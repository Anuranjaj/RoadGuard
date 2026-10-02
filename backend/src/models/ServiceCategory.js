import mongoose from 'mongoose';

const serviceCategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    basePrice: { type: Number, required: true, default: 0 },
    etaMinutes: { type: Number, default: 15 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('ServiceCategory', serviceCategorySchema);
