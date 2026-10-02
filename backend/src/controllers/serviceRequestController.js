import ServiceRequest from '../models/ServiceRequest.js';
import Notification from '../models/Notification.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import ServiceCategory from '../models/ServiceCategory.js';
import { isAllowedStatusTransition } from '../utils/security.js';
import { normalizeCreateRequestPayload } from '../utils/serviceRequestUtils.js';
import {
  ACTIVE_PARTNER_JOB_STATUSES,
  getPartnerSearchRadiusMeters,
  getServiceCategoryKeys,
  hasUsablePartnerLocation,
  partnerOffersService,
} from '../utils/partnerEligibility.js';

const buildStatusMessage = (status) => {
  const map = {
    REQUESTED: 'Service request created',
    PARTNER_ACCEPTED: 'Partner accepted your service request',
    PARTNER_ARRIVING: 'Partner is on the way',
    PARTNER_ARRIVED: 'Partner has arrived',
    SERVICE_IN_PROGRESS: 'Service is in progress',
    COMPLETED: 'Service completed',
    CANCELLED: 'Service request cancelled',
  };

  return map[status] || 'Service request updated';
};

export const getMyServiceRequests = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'PARTNER') {
      const partnerRequests = [{ assignedPartner: req.user._id }];
      if (req.user.isActive && req.user.isVerified && req.user.availability && req.user.serviceCategories.length) {
        const incomingQuery = {
          status: 'REQUESTED',
          assignedPartner: null,
          declinedBy: { $ne: req.user._id },
          serviceCategory: { $in: req.user.serviceCategories },
        };
        const [longitude, latitude] = req.user.location?.coordinates || [];
        if (Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0)) {
          const latitudeRange = 15000 / 111320;
          const longitudeRange = latitudeRange / Math.max(Math.cos((latitude * Math.PI) / 180), 0.01);
          incomingQuery.latitude = { $gte: latitude - latitudeRange, $lte: latitude + latitudeRange };
          incomingQuery.longitude = { $gte: longitude - longitudeRange, $lte: longitude + longitudeRange };
        }
        partnerRequests.push(incomingQuery);
      }
      query = { $or: partnerRequests };
    } else if (req.user.role === 'OWNER') {
      query = { owner: req.user._id };
    } else {
      query = {};
    }

    const requests = await ServiceRequest.find(query)
      .populate('owner', 'name email phone role')
      .populate('vehicle', 'name registration type fuel')
      .populate('assignedPartner', 'name email phone businessName location rating ratingCount isVerified pricing')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const createServiceRequest = async (req, res, next) => {
  try {
    const payload = normalizeCreateRequestPayload(req.body, req.user);
    const {
      vehicle,
      serviceCategory,
      description,
      pickupLocation,
      latitude,
      longitude,
    } = payload;

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180
    ) {
      return res.status(400).json({ success: false, message: 'Valid latitude and longitude are required' });
    }

    if (typeof serviceCategory !== 'string' || !serviceCategory.trim()) {
      return res.status(400).json({ success: false, message: 'A service category is required' });
    }

    const service = await ServiceCategory.findOne({ id: serviceCategory, active: true });
    if (!service) {
      return res.status(400).json({ success: false, message: 'Select a valid active service category' });
    }

    const vehicleDoc = await Vehicle.findOne({ _id: vehicle, owner: req.user._id });
    if (!vehicleDoc) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const request = await ServiceRequest.create({
      owner: req.user._id,
      vehicle,
      serviceCategory,
      description,
      pickupLocation,
      latitude,
      longitude,
      price: service.basePrice,
      status: 'REQUESTED',
    });

    await Notification.create({
      user: req.user._id,
      title: 'Request created',
      message: 'Your service request has been submitted successfully',
      type: 'REQUEST',
      relatedRequest: request._id,
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const getServiceRequestById = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('owner', 'name email phone role')
      .populate('vehicle', 'name registration type fuel')
      .populate('assignedPartner', 'name email phone businessName');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== request.owner._id.toString() && req.user._id.toString() !== String(request.assignedPartner?._id || '')) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const updateServiceRequestStatus = async (req, res, next) => {
  try {
    const { status, completionDetails, cancellationReason } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (req.user.role === 'PARTNER' && request.assignedPartner && req.user._id.toString() !== request.assignedPartner.toString()) {
      return res.status(403).json({ success: false, message: 'This request is not assigned to you' });
    }

    if (req.user.role === 'PARTNER' && !request.assignedPartner) {
      return res.status(403).json({ success: false, message: 'This request is not assigned to you' });
    }

    if (req.user.role === 'OWNER' && req.user._id.toString() !== request.owner.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (status && !isAllowedStatusTransition(request.status, status)) {
      return res.status(400).json({ success: false, message: 'Invalid status transition' });
    }

    request.status = status || request.status;
    if (completionDetails) request.completionDetails = completionDetails;
    if (status === 'COMPLETED') request.completedAt = new Date();
    if (cancellationReason) request.cancellationReason = cancellationReason;

    if (status === 'CANCELLED') {
      request.assignedPartner = null;
    }

    await request.save();

    const message = buildStatusMessage(status);
    await Notification.create({
      user: request.owner,
      title: 'Request updated',
      message,
      type: 'REQUEST',
      relatedRequest: request._id,
    });

    if (request.assignedPartner) {
      await Notification.create({
        user: request.assignedPartner,
        title: 'Request updated',
        message,
        type: 'REQUEST',
        relatedRequest: request._id,
      });
    }

    const io = req.app.get('io');
    io.to(`service-request:${request._id}`).emit('service-request:status:update', {
      requestId: request._id,
      status,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    if (!req.user.isActive || !req.user.isVerified || !req.user.availability) {
      return res.status(403).json({ success: false, message: 'A verified, available partner account is required' });
    }

    const request = await ServiceRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'REQUESTED',
        assignedPartner: null,
        declinedBy: { $ne: req.user._id },
        serviceCategory: { $in: req.user.serviceCategories },
      },
      { $set: { assignedPartner: req.user._id, status: 'PARTNER_ACCEPTED' } },
      { new: true },
    );
    if (!request) {
      return res.status(409).json({ success: false, message: 'Request is no longer available for this partner' });
    }

    await Notification.create({
      user: request.owner,
      title: 'Partner accepted',
      message: 'A verified partner has accepted your request',
      type: 'REQUEST',
      relatedRequest: request._id,
    });

    const io = req.app.get('io');
    io.to(`service-request:${request._id}`).emit('request:accepted', {
      requestId: request._id,
      partnerId: req.user._id,
      status: 'PARTNER_ACCEPTED',
    });

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const passRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        status: 'REQUESTED',
        assignedPartner: null,
        serviceCategory: { $in: req.user.serviceCategories },
      },
      { $addToSet: { declinedBy: req.user._id } },
      { new: true },
    );
    if (!request) {
      return res.status(409).json({ success: false, message: 'Request is no longer available' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const updateAdditionalCharges = async (req, res, next) => {
  try {
    const charges = req.body.charges;
    if (!Array.isArray(charges) || charges.some((charge) => (
      !charge || typeof charge.label !== 'string' || !charge.label.trim() ||
      !Number.isFinite(Number(charge.amount)) || Number(charge.amount) < 0
    ))) {
      return res.status(400).json({ success: false, message: 'Valid charge labels and amounts are required' });
    }

    const request = await ServiceRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        assignedPartner: req.user._id,
        status: { $in: ['PARTNER_ACCEPTED', 'PARTNER_ARRIVING', 'PARTNER_ARRIVED', 'SERVICE_IN_PROGRESS'] },
      },
      {
        $set: {
          additionalCharges: charges.map((charge) => ({ label: charge.label.trim(), amount: Number(charge.amount) })),
        },
      },
      { new: true, runValidators: true },
    );
    if (!request) {
      return res.status(404).json({ success: false, message: 'Active service request not found' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const cancelRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (req.user._id.toString() !== request.owner.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can cancel this request' });
    }

    request.status = 'CANCELLED';
    request.cancellationReason = req.body.reason || 'Cancelled by owner';
    await request.save();

    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const getActiveRequests = async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find({ status: { $nin: ['COMPLETED', 'CANCELLED'] } })
      .populate('owner', 'name')
      .populate('vehicle', 'name registration')
      .populate('assignedPartner', 'name businessName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};
