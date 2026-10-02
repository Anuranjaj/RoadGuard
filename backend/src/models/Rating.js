import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    serviceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
      unique: true,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('Rating', ratingSchema);
