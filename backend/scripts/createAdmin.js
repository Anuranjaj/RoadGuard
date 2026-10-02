import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

const ADMIN_EMAIL = 'admin@roadguard.com';
const ADMIN_NAME = 'RoadGuard Admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('ADMIN_PASSWORD is required in the environment before creating the admin account.');
  process.exit(1);
}

const ensureAdminExists = async () => {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (existingUser) {
      const needsRoleUpdate = existingUser.role !== 'ADMIN';
      const needsActivation = existingUser.isActive === false;

      if (needsRoleUpdate || needsActivation) {
        existingUser.role = 'ADMIN';
        existingUser.isActive = true;
        await existingUser.save();
      }

      console.log('Admin account already exists.');
      console.log(`Email: ${ADMIN_EMAIL}`);
      console.log('Role: ADMIN');
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      phone: '+919999999999',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    });

    console.log('Admin account created successfully.');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log('Role: ADMIN');
  } catch (error) {
    console.error('Failed to create admin account:', error.message);
    process.exitCode = 1;
  } finally {
    if (process.env.MONGODB_URI) {
      await import('mongoose').then(({ default: mongoose }) => mongoose.disconnect());
    }
  }
};

ensureAdminExists();
