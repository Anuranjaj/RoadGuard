import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['OWNER', 'PARTNER', 'ADMIN'],
      default: 'OWNER',
    },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    availability: { type: Boolean, default: true },
    serviceCategories: [{ type: String }],
    pricing: { type: Number, default: 0 },
    businessName: { type: String },
    businessArea: { type: String, trim: true, default: '' },
    businessDescription: { type: String, trim: true, default: '' },
    verificationDocuments: [{ name: { type: String, trim: true }, status: { type: String, trim: true } }],
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

userSchema.index({ role: 1 });
userSchema.index({ location: '2dsphere' });

export default mongoose.model('User', userSchema);
