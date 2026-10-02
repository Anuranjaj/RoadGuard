import User from '../models/User.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Complaint from '../models/Complaint.js';
import Rating from '../models/Rating.js';
import Vehicle from '../models/Vehicle.js';

const ACTIVE_STATUSES = ['REQUESTED', 'PARTNER_ACCEPTED', 'PARTNER_ARRIVING', 'PARTNER_ARRIVED', 'SERVICE_IN_PROGRESS'];
const SERVICE_CATEGORIES = [
  { label: 'Breakdown', value: 'breakdown' },
  { label: 'Towing', value: 'towing' },
  { label: 'Battery', value: 'battery' },
  { label: 'Flat Tire', value: 'tyre' },
  { label: 'Fuel', value: 'fuel' },
];

const requestAmount = (request) => request.price + (request.additionalCharges || []).reduce((total, charge) => total + charge.amount, 0);

const monthSeries = (requests, months = 6) => {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - index - 1), 1);
    const monthRequests = requests.filter((request) => {
      const createdAt = new Date(request.createdAt);
      return createdAt.getFullYear() === date.getFullYear() && createdAt.getMonth() === date.getMonth();
    });
    return {
      label: date.toLocaleString('en-US', { month: 'short' }),
      requests: monthRequests.length,
      completed: monthRequests.filter((request) => request.status === 'COMPLETED').length,
      cancelled: monthRequests.filter((request) => request.status === 'CANCELLED').length,
      revenue: monthRequests.filter((request) => request.status === 'COMPLETED').reduce((total, request) => total + requestAmount(request), 0),
    };
  });
};

const serializePartner = (partner, completedJobs = 0) => ({
  id: partner._id,
  name: partner.businessName || partner.name,
  owner: partner.name,
  photo: (partner.businessName || partner.name).split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
  email: partner.email,
  phone: partner.phone,
  area: partner.businessArea || 'Location not provided',
  services: partner.serviceCategories || [],
  rating: partner.rating || 0,
  reviews: partner.ratingCount || 0,
  jobs: completedJobs,
  joined: partner.createdAt,
  status: partner.verificationStatus || (partner.isVerified ? 'verified' : 'pending'),
  verified: partner.isVerified,
  documents: partner.verificationDocuments || [],
});

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [users, requests, complaints, ratings] = await Promise.all([
      User.find().select('role isVerified verificationStatus createdAt'),
      ServiceRequest.find().select('serviceCategory status price additionalCharges createdAt assignedPartner'),
      Complaint.countDocuments(),
      Rating.aggregate([{ $group: { _id: null, avgRating: { $avg: '$rating' } } }]),
    ]);
    const totalUsers = users.length;
    const totalPartners = users.filter((user) => user.role === 'PARTNER').length;
    const pendingPartners = users.filter((user) => user.role === 'PARTNER' && !user.isVerified && user.verificationStatus !== 'rejected').length;
    const totalRequests = requests.length;
    const activeRequests = requests.filter((request) => ACTIVE_STATUSES.includes(request.status)).length;
    const completedRequests = requests.filter((request) => request.status === 'COMPLETED').length;
    const cancelledRequests = requests.filter((request) => request.status === 'CANCELLED').length;
    const acceptedRequests = requests.filter((request) => ['PARTNER_ACCEPTED', 'PARTNER_ARRIVING', 'PARTNER_ARRIVED', 'SERVICE_IN_PROGRESS', 'COMPLETED'].includes(request.status)).length;
    const grossVolume = requests.filter((request) => request.status === 'COMPLETED').reduce((total, request) => total + requestAmount(request), 0);
    const serviceMix = SERVICE_CATEGORIES.map(({ label, value }) => ({
      label,
      value: totalRequests ? Number(((requests.filter((request) => request.serviceCategory === value).length / totalRequests) * 100).toFixed(2)) : 0,
    }));

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPartners,
        pendingPartners,
        totalServiceRequests: totalRequests,
        activeRequests,
        completedRequests,
        cancelledRequests,
        complaints,
        grossVolume,
        averageRating: ratings[0]?.avgRating || 0,
        partnerAcceptanceRate: totalRequests ? Number(((acceptedRequests / totalRequests) * 100).toFixed(2)) : 0,
        completionRate: totalRequests ? Number(((completedRequests / totalRequests) * 100).toFixed(2)) : 0,
        monthlySeries: monthSeries(requests),
        serviceMix,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'OWNER' }).select('-password').sort({ createdAt: -1 }).lean();
    const userIds = users.map((user) => user._id);
    const [vehicles, requests] = await Promise.all([
      Vehicle.find({ owner: { $in: userIds } }).select('owner').lean(),
      ServiceRequest.find({ owner: { $in: userIds } }).select('owner').lean(),
    ]);
    const data = users.map((user) => ({
      ...user,
      id: user._id,
      vehicles: vehicles.filter((vehicle) => String(vehicle.owner) === String(user._id)).length,
      services: requests.filter((request) => String(request.owner) === String(user._id)).length,
      status: user.isActive ? 'Active' : 'Suspended',
      registered: user.createdAt,
    }));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUserStatus = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'OWNER' },
      { $set: { isActive: Boolean(req.body.isActive) } },
      { new: true, runValidators: true },
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Owner not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getAdminPartners = async (req, res, next) => {
  try {
    const partners = await User.find({ role: 'PARTNER' }).select('-password').sort({ createdAt: -1 }).lean();
    const completed = await ServiceRequest.aggregate([
      { $match: { status: 'COMPLETED', assignedPartner: { $ne: null } } },
      { $group: { _id: '$assignedPartner', jobs: { $sum: 1 } } },
    ]);
    const jobsByPartner = new Map(completed.map((item) => [String(item._id), item.jobs]));
    res.json({ success: true, data: partners.map((partner) => serializePartner(partner, jobsByPartner.get(String(partner._id)) || 0)) });
  } catch (error) {
    next(error);
  }
};

export const updatePartnerVerification = async (req, res, next) => {
  try {
    if (typeof req.body.isVerified !== 'boolean') return res.status(400).json({ success: false, message: 'isVerified must be a boolean' });
    const partner = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'PARTNER' },
      { $set: { isVerified: req.body.isVerified, verificationStatus: req.body.isVerified ? 'verified' : 'rejected' } },
      { new: true, runValidators: true },
    ).select('-password').lean();
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    res.json({ success: true, data: serializePartner(partner) });
  } catch (error) {
    next(error);
  }
};

export const getAdminRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find()
      .populate('owner', 'name email phone')
      .populate('vehicle', 'name registration type fuel')
      .populate('assignedPartner', 'name businessName phone location')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const getAdminComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('user', 'name email phone')
      .populate({ path: 'serviceRequest', populate: [{ path: 'assignedPartner', select: 'name businessName' }, { path: 'vehicle', select: 'name registration' }] })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const [requests, partners] = await Promise.all([
      ServiceRequest.find().select('status price additionalCharges createdAt serviceCategory assignedPartner').lean(),
      User.find({ role: 'PARTNER' }).select('name businessName rating ratingCount').lean(),
    ]);
    const completedRequests = requests.filter((request) => request.status === 'COMPLETED');
    const totals = {
      grossVolume: completedRequests.reduce((total, request) => total + requestAmount(request), 0),
      totalRequests: requests.length,
      completedRequests: completedRequests.length,
      cancelledRequests: requests.filter((request) => request.status === 'CANCELLED').length,
    };
    const jobsByPartner = await ServiceRequest.aggregate([
      { $match: { status: 'COMPLETED', assignedPartner: { $ne: null } } },
      { $group: { _id: '$assignedPartner', jobs: { $sum: 1 }, earnings: { $sum: { $add: ['$price', { $sum: '$additionalCharges.amount' }] } } } },
      { $sort: { jobs: -1 } },
    ]);
    const partnerMap = new Map(partners.map((partner) => [String(partner._id), partner]));
    res.json({
      success: true,
      data: {
        ...totals,
        cancellationRate: requests.length ? Number(((totals.cancelledRequests / requests.length) * 100).toFixed(2)) : 0,
        monthlySeries: monthSeries(requests),
        topPartners: jobsByPartner.map((item) => ({
          name: partnerMap.get(String(item._id))?.businessName || partnerMap.get(String(item._id))?.name || 'Unknown partner',
          jobs: item.jobs,
          rating: partnerMap.get(String(item._id))?.rating || 0,
          earnings: item.earnings,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
