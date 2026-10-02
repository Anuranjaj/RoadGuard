import Vehicle from '../models/Vehicle.js';
import { sanitizeProtectedFields } from '../utils/security.js';

const allowedVehicleFields = ['name', 'registration', 'type', 'fuel', 'color', 'image', 'lastService'];

export const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const { name, registration, type, fuel, color, image, lastService } = sanitizeProtectedFields(req.body);

    if (!name || !registration || !type || !fuel) {
      return res.status(400).json({ success: false, message: 'Vehicle name, registration, type, and fuel are required' });
    }

    const existing = await Vehicle.findOne({ owner: req.user._id, registration: registration?.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Vehicle already exists' });
    }

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      name,
      registration: registration?.toUpperCase(),
      type,
      fuel,
      color,
      image,
      lastService,
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user._id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const updates = {};
    for (const field of allowedVehicleFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    Object.assign(vehicle, sanitizeProtectedFields(updates));
    await vehicle.save();
    res.json({ success: true, data: vehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
    res.json({ success: true, data: { id: vehicle._id } });
  } catch (error) {
    next(error);
  }
};
