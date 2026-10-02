import Rating from '../models/Rating.js';
import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/User.js';

export const submitRating = async (req, res, next) => {
  try {
    const { serviceRequest, rating, review } = req.body;
    const request = await ServiceRequest.findById(serviceRequest);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request not found' });
    }

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can rate this request' });
    }

    const existing = await Rating.findOne({ serviceRequest });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Rating already submitted for this request' });
    }

    const newRating = await Rating.create({
      serviceRequest,
      owner: request.owner,
      partner: request.assignedPartner,
      rating,
      review,
    });

    const partner = await User.findById(request.assignedPartner);
    if (partner) {
      const ratings = await Rating.find({ partner: partner._id });
      const avg = ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;
      partner.rating = Number(avg.toFixed(1));
      partner.ratingCount = ratings.length;
      await partner.save();
    }

    res.status(201).json({ success: true, data: newRating });
  } catch (error) {
    next(error);
  }
};

export const getRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find().populate('partner', 'name businessName').sort({ createdAt: -1 });
    res.json({ success: true, data: ratings });
  } catch (error) {
    next(error);
  }
};
