import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    registration: { type: String, required: true, uppercase: true, trim: true },
    type: { type: String, required: true },
    fuel: { type: String, required: true },
    color: { type: String, default: 'White' },
    image: { type: String },
    lastService: { type: String },
  },
  { timestamps: true },
);

vehicleSchema.index({ owner: 1, registration: 1 }, { unique: true });

export default mongoose.model('Vehicle', vehicleSchema);
