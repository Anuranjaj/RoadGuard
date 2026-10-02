import mongoose from 'mongoose';

const payoutRequestSchema = new mongoose.Schema(
  {
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'PAID', 'REJECTED'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

export default mongoose.model('PayoutRequest', payoutRequestSchema);
