const { getUserProfile, updateUserProfile } = require('../services/userService');

const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user.userId);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user.userId, req.body);
    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
