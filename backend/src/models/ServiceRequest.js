import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceCategory: { type: String, required: true },
    description: { type: String, default: '' },
    pickupLocation: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    assignedPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['REQUESTED', 'PARTNER_ACCEPTED', 'PARTNER_ARRIVING', 'PARTNER_ARRIVED', 'SERVICE_IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED',
    },
    estimatedDistance: { type: Number, default: 0 },
    estimatedArrivalTime: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    cancellationReason: { type: String },
    completionDetails: { type: String },
    completedAt: { type: Date },
    additionalCharges: [{
      label: { type: String, required: true, trim: true },
      amount: { type: Number, required: true, min: 0 },
    }],
    declinedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
  },
  { timestamps: true },
);

serviceRequestSchema.index({ owner: 1, createdAt: -1 });
serviceRequestSchema.index({ assignedPartner: 1, status: 1 });
serviceRequestSchema.index({ serviceCategory: 1, status: 1 });

export default mongoose.model('ServiceRequest', serviceRequestSchema);
