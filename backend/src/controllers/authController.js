import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const normalizeUserRecord = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  isActive: user.isActive,
});

export const resolveLoginIdentifier = (payload = {}) => {
  const candidate =
    payload.email ??
    payload.identifier ??
    payload.phone ??
    '';

  if (typeof candidate !== 'string') {
    return '';
  }

  return candidate.trim();
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhone = (value) => /^\+?[0-9]{10,15}$/.test(value.replace(/\s+/g, ''));
const isValidRole = (role) => ['OWNER', 'PARTNER'].includes(String(role || 'OWNER').toUpperCase());

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const normalizedRole = (role || 'OWNER').toUpperCase();
    if (!isValidRole(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid account role' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: normalizedRole,
      isVerified: normalizedRole === 'OWNER',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      data: normalizeUserRecord(user),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { password } = req.body;
    const identifier = resolveLoginIdentifier(req.body);

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/phone and password are required' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      data: normalizeUserRecord(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};
