import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: { type: String, trim: true },
    serviceCategories: [{ type: String }],
    availability: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true },
);

partnerSchema.index({ location: '2dsphere' });

export default mongoose.model('Partner', partnerSchema);
