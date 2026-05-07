const { registerUser, loginUser, logoutUser } = require('../services/authService');
const { logger } = require('../utils/logger');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    // Get data from request body
    const { username, email, password } = req.body;

    // Call service to register user
    const user = await registerUser(username, email, password);

    // Send success response
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: user
    });
  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    // Get data from request body
    const { email, password } = req.body;

    // Call service to login user
    const { user, token } = await loginUser(email, password);

    // Send success response with token
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      user: user,
      token: token
    });
  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // Get email from authenticated user (will be added by auth middleware)
    const email = req.user.email;

    // Call service to logout
    await logoutUser(email);

    // Send success response
    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout
};