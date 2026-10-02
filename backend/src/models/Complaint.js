import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['OPEN', 'IN_REVIEW', 'RESOLVED'], default: 'OPEN' },
    resolution: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('Complaint', complaintSchema);
