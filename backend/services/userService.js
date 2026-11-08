const User = require('../models/user');
const bcrypt = require('bcrypt');
const { logger } = require('../utils/logger');

const formatUser = (user) => ({
  _id: user._id,
  username: user.username,
  name: user.username,
  email: user.email,
  mobile: user.mobile || '',
  location: user.location || '',
  avatar: user.avatar || '',
  avatarUrl: user.avatar || '',
});

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return formatUser(user);
};

const updateUserProfile = async (userId, updates) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const {
    username,
    email,
    mobile,
    location,
    avatar,
    currentPassword,
    newPassword,
  } = updates;

  if (username !== undefined) {
    const trimmed = String(username).trim();
    if (trimmed.length < 3) {
      const error = new Error('Username must be at least 3 characters');
      error.status = 400;
      throw error;
    }
    const existing = await User.findOne({
      username: trimmed,
      _id: { $ne: userId },
    });
    if (existing) {
      const error = new Error('Username is already taken');
      error.status = 400;
      throw error;
    }
    user.username = trimmed;
  }

  if (email !== undefined) {
    const trimmed = String(email).trim().toLowerCase();
    const existing = await User.findOne({
      email: trimmed,
      _id: { $ne: userId },
    });
    if (existing) {
      const error = new Error('Email is already in use');
      error.status = 400;
      throw error;
    }
    user.email = trimmed;
  }

  if (mobile !== undefined) {
    user.mobile = String(mobile).trim();
  }

  if (location !== undefined) {
    user.location = String(location).trim();
  }

  if (avatar !== undefined) {
    user.avatar = avatar;
  }

  if (newPassword) {
    if (!currentPassword) {
      const error = new Error('Current password is required to set a new password');
      error.status = 400;
      throw error;
    }
    if (String(newPassword).length < 6) {
      const error = new Error('New password must be at least 6 characters');
      error.status = 400;
      throw error;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.status = 400;
      throw error;
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  logger.info(`Profile updated for user: ${user.email}`);

  return formatUser(user);
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};
