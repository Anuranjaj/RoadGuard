import Complaint from '../models/Complaint.js';
import { sanitizeProtectedFields } from '../utils/security.js';

export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find().populate('user', 'name email role').sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, serviceRequest } = req.body;
    const complaint = await Complaint.create({
      user: req.user._id,
      title,
      description,
      serviceRequest,
      status: 'OPEN',
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req, res, next) => {
  try {
    const allowedUpdates = sanitizeProtectedFields(req.body);
    const { status, resolution } = allowedUpdates;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        ...(status ? { status } : {}),
        ...(resolution !== undefined ? { resolution } : {}),
      },
      { new: true },
    );

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    res.json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};
