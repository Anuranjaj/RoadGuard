import User from '../models/User.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
