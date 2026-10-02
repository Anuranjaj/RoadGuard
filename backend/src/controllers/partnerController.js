import User from '../models/User.js';
import ServiceRequest from '../models/ServiceRequest.js';
import PayoutRequest from '../models/PayoutRequest.js';
import ServiceCategory from '../models/ServiceCategory.js';
import {
  ACTIVE_PARTNER_JOB_STATUSES,
  getServiceCategoryKeys,
  partnerOffersService,
} from '../utils/partnerEligibility.js';

const buildNoPartnerDiagnostics = ({ profiles, serviceKeys, busyPartnerIds }) => {
  const reasons = [];
  const matchesService = (partner) => partnerOffersService(partner.serviceCategories, serviceKeys);
  const serviceMatches = profiles.filter(matchesService);
  const activeMatches = serviceMatches.filter((partner) => partner.isActive !== false);
  const verifiedMatches = activeMatches.filter((partner) => partner.isVerified === true);
  const availableMatches = verifiedMatches.filter((partner) => partner.availability === true);
  const busyIds = new Set(busyPartnerIds.map(String));
  const notBusyMatches = availableMatches.filter((partner) => !busyIds.has(String(partner._id)));

  if (profiles.length === 0) reasons.push('NO_PARTNER_PROFILES');
  if (serviceMatches.length === 0) reasons.push('NO_PARTNER_OFFERS_SERVICE');
  else {
    if (activeMatches.length === 0) reasons.push('PARTNER_ACCOUNT_INACTIVE');
    if (activeMatches.length > 0 && verifiedMatches.length === 0) reasons.push('PARTNER_NOT_VERIFIED');
    if (verifiedMatches.length > 0 && availableMatches.length === 0) reasons.push('PARTNER_UNAVAILABLE');
    if (availableMatches.length > 0 && notBusyMatches.length === 0) reasons.push('PARTNER_HAS_ACTIVE_JOB');
  }

  return reasons;
};

const getCompletedEarnings = async (partnerId) => {
  const requests = await ServiceRequest.find({ assignedPartner: partnerId, status: 'COMPLETED' })
    .select('price additionalCharges');
  return requests.reduce(
    (total, request) => total + request.price + request.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0),
    0,
  );
};

export const getPartners = async (req, res, next) => {
  try {
    const partners = await User.find({ role: 'PARTNER', isActive: true }).select('-password').sort({ rating: -1, createdAt: -1 });
    res.json({ success: true, data: partners });
  } catch (error) {
    next(error);
  }
};

export const getNearbyPartners = async (req, res, next) => {
  try {
    const { serviceCategory } = req.query;

    if (typeof serviceCategory !== 'string' || !serviceCategory.trim()) {
      return res.status(400).json({ success: false, message: 'A service category is required' });
    }

    const service = await ServiceCategory.findOne({ id: serviceCategory, active: true }).lean();
    if (!service) {
      return res.status(400).json({ success: false, message: 'Select a valid active service category' });
    }

    const serviceKeys = getServiceCategoryKeys(service);
    const busyPartnerIds = await ServiceRequest.distinct('assignedPartner', {
      assignedPartner: { $ne: null },
      status: { $in: ACTIVE_PARTNER_JOB_STATUSES },
    });

    const partnerProfiles = await User.find({
      role: 'PARTNER',
      isActive: true,
      isVerified: true,
      availability: true,
      _id: { $nin: busyPartnerIds },
    })
      .select('name phone businessName businessArea businessDescription isActive isVerified availability serviceCategories pricing rating ratingCount location')
      .lean();

    const partners = partnerProfiles
      .filter((partner) => partnerOffersService(partner.serviceCategories, serviceKeys))
      .map((partner) => ({
        ...partner,
        id: partner._id,
        distanceKm: null,
      }));

    if (partners.length === 0) {
      const profiles = await User.find({ role: 'PARTNER' })
        .select('isActive isVerified availability serviceCategories location')
        .lean();
      const diagnostics = buildNoPartnerDiagnostics({
        profiles,
        serviceKeys,
        busyPartnerIds,
      });
      return res.json({ success: true, data: partners, diagnostics: { reasons: diagnostics } });
    }

    res.json({ success: true, data: partners });
  } catch (error) {
    next(error);
  }
};

export const getMyPartnerProfile = async (req, res, next) => {
  try {
    const completedDispatches = await ServiceRequest.countDocuments({
      assignedPartner: req.user._id,
      status: 'COMPLETED',
    });
    res.json({
      success: true,
      data: { ...req.user.toObject(), completedDispatches },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyPartnerProfile = async (req, res, next) => {
  try {
    const { name, phone, businessName, businessArea, businessDescription, serviceCategories, location } = req.body;
    const updates = {};

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ success: false, message: 'A valid owner or manager name is required' });
    }
    if (
      phone !== undefined &&
      (typeof phone !== 'string' || !/^\+?[0-9]{10,15}$/.test(phone.replace(/\s+/g, '')))
    ) {
      return res.status(400).json({ success: false, message: 'A valid phone number is required' });
    }
    if ([businessName, businessArea, businessDescription].some((value) => value !== undefined && typeof value !== 'string')) {
      return res.status(400).json({ success: false, message: 'Garage profile details must be text' });
    }

    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (typeof businessName === 'string') updates.businessName = businessName.trim();
    if (typeof businessArea === 'string') updates.businessArea = businessArea.trim();
    if (typeof businessDescription === 'string') updates.businessDescription = businessDescription.trim();
    if (serviceCategories !== undefined) {
      if (!Array.isArray(serviceCategories) || serviceCategories.some((category) => typeof category !== 'string')) {
        return res.status(400).json({ success: false, message: 'Service categories must be a list of active service IDs' });
      }
      const requestedCategories = [...new Set(serviceCategories.map((category) => category.trim()).filter(Boolean))];
      const activeCategories = await ServiceCategory.find({ active: true, id: { $in: requestedCategories } })
        .select('id')
        .lean();
      if (activeCategories.length !== requestedCategories.length) {
        return res.status(400).json({ success: false, message: 'Select only active service categories' });
      }
      updates.serviceCategories = requestedCategories;
    }

    if (location !== undefined) {
      const coordinates = location?.coordinates;
      if (
        location?.type !== 'Point' ||
        !Array.isArray(coordinates) ||
        coordinates.length !== 2 ||
        !coordinates.every(Number.isFinite) ||
        coordinates[0] < -180 || coordinates[0] > 180 ||
        coordinates[1] < -90 || coordinates[1] > 90 ||
        (coordinates[0] === 0 && coordinates[1] === 0)
      ) {
        return res.status(400).json({ success: false, message: 'A valid non-default business location is required' });
      }
      updates.location = { type: 'Point', coordinates };
    }

    const partner = await User.findByIdAndUpdate(req.user._id, { $set: updates }, {
      new: true,
      runValidators: true,
    }).select('-password');
    res.json({ success: true, data: partner });
  } catch (error) {
    next(error);
  }
};

export const updateMyAvailability = async (req, res, next) => {
  try {
    if (typeof req.body.availability !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Availability must be true or false' });
    }
    const partner = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { availability: req.body.availability } },
      { new: true },
    ).select('-password');
    res.json({ success: true, data: partner });
  } catch (error) {
    next(error);
  }
};

export const getMyPayoutRequests = async (req, res, next) => {
  try {
    const payouts = await PayoutRequest.find({ partner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: payouts });
  } catch (error) {
    next(error);
  }
};

export const createPayoutRequest = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Enter a valid payout amount' });
    }

    const [earned, reservedPayouts] = await Promise.all([
      getCompletedEarnings(req.user._id),
      PayoutRequest.find({ partner: req.user._id, status: { $in: ['PENDING', 'APPROVED', 'PAID'] } })
        .select('amount'),
    ]);
    const reserved = reservedPayouts.reduce((total, payout) => total + payout.amount, 0);
    const available = Math.max(0, earned - reserved);
    if (amount > available) {
      return res.status(400).json({ success: false, message: 'Payout amount exceeds your available earnings' });
    }

    const payout = await PayoutRequest.create({ partner: req.user._id, amount });
    res.status(201).json({ success: true, data: payout });
  } catch (error) {
    next(error);
  }
};
