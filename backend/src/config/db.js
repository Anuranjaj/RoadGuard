import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  mongoose.set('strictQuery', true);

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to start the RoadGuard API.');
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`, { cause: error });
  }
};

export const isDbAvailable = async () => {
  try {
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

export default connectDB;
