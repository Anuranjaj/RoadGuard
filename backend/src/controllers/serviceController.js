import ServiceCategory from '../models/ServiceCategory.js';
import { sanitizeProtectedFields } from '../utils/security.js';

const defaultServices = [
  { id: 'breakdown', name: 'Breakdown Repair', description: 'On-spot diagnosis and repair by a certified mechanic.', basePrice: 499, etaMinutes: 15, active: true },
  { id: 'towing', name: 'Towing', description: 'Flatbed or lift towing to the nearest trusted garage.', basePrice: 1200, etaMinutes: 25, active: true },
  { id: 'battery', name: 'Battery Jump-Start', description: 'Dead battery? We jump-start or replace it on the spot.', basePrice: 349, etaMinutes: 12, active: true },
  { id: 'tyre', name: 'Flat Tire Repair', description: 'Puncture repair or spare wheel fitting wherever you are.', basePrice: 399, etaMinutes: 14, active: true },
  { id: 'fuel', name: 'Fuel Delivery', description: 'Petrol, diesel or CNG delivered straight to your vehicle.', basePrice: 299, etaMinutes: 18, active: true },
];

export const seedServiceCategories = async () => {
  for (const service of defaultServices) {
    await ServiceCategory.findOneAndUpdate({ id: service.id }, service, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
};

export const getServices = async (req, res, next) => {
  try {
    const services = await ServiceCategory.find({ active: true }).sort({ name: 1 });
    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const payload = sanitizeProtectedFields(req.body);
    const { id, name, description, basePrice, etaMinutes, active } = payload;

    if (!id || !name || basePrice === undefined) {
      return res.status(400).json({ success: false, message: 'Service id, name, and basePrice are required' });
    }

    const service = await ServiceCategory.create({
      id,
      name,
      description: description || '',
      basePrice,
      etaMinutes: etaMinutes ?? 15,
      active: active ?? true,
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};
