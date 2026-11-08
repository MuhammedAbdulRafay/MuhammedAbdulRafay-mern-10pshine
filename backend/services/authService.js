const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomBytes, createHash } = require('crypto');
const { logger } = require('../utils/logger');

/**
 * Register a new user
 * @param {string} username - User's username
 * @param {string} email - User's email
 * @param {string} password - User's password (will be hashed)
 * @returns {Object} User object (without password)
 */
const registerUser = async (username, email, password) => {
  try {
    // Step 1: Validate inputs
    if (!username || !email || !password) {
      const error = new Error('Username, email, and password are required');
      error.status = 400;
      throw error;
    }

    // Step 2: Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const error = new Error('User with this email or username already exists');
      error.status = 400;
      throw error;
    }

    // Step 3: Hash the password
    // bcrypt.hash(password, saltRounds)
    // saltRounds = 10 means hash it 10 times (more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 4: Create new user in database
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword // Store hashed password, not plain text
    });

    // Step 5: Log the event
    logger.info(`New user registered: ${email}`);

    // Step 6: Return user without password
    return {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt
    };
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    throw error;
  }
};

/**
 * Login user and return JWT token
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} User object and JWT token
 */
const loginUser = async (email, password) => {
  try {
    // Step 1: Validate inputs
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.status = 400;
      throw error;
    }

    // Step 2: Find user by email
    const user = await User.findOne({ email }).select('+password');
    // .select('+password') means: include password field (normally hidden)

    // Step 3: Check if user exists
    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // Step 4: Compare password with hash
    // bcrypt.compare(plainPassword, hashedPassword)
    // Returns true if match, false if no match
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // Step 5: Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username
      },
      process.env.JWT_SECRET, // Secret key from .env
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d' // Token expires in 7 days
      }
    );

    // Step 6: Log the event
    logger.info(`User logged in: ${email}`);

    // Step 7: Return user and token
    return {
      user: {
        _id: user._id,
        username: user.username,
        name: user.username,
        email: user.email,
        mobile: user.mobile || '',
        location: user.location || '',
        avatar: user.avatar || '',
        avatarUrl: user.avatar || '',
      },
      token: token
    };
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    throw error;
  }
};

/**
 * Logout user (logging only, actual logout happens client-side)
 * @param {string} email - User's email
 */
const logoutUser = async (email) => {
  try {
    // Log the logout event
    logger.info(`User logged out: ${email}`);
    
    return {
      message: 'Logout successful'
    };
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    throw error;
  }
};

/**
 * Request password reset
 */
const requestPasswordReset = async (email) => {
  try {
    const emailService = require('./emailService');
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Generate reset token (random 32 characters)
    const resetToken = randomBytes(32).toString('hex');

    // Hash token (don't store plain token in DB)
    const hashedToken = createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Set token expiry (1 hour from now)
    const expiryTime = Date.now() + 3600000; // 1 hour

    // Save to user
    user.resetToken = hashedToken;
    user.resetTokenExpiry = expiryTime;
    await user.save();

    // Send email
    await emailService.sendPasswordResetEmail(email, resetToken);

    logger.info(`Password reset requested for: ${email}`);
    return { message: 'Reset link sent to email' };
  } catch (error) {
    logger.error(`Error requesting reset: ${error.message}`);
    throw error;
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (resetToken, newPassword) => {
  try {
    const crypto = require('crypto');

    // Hash the token from URL
    const hashedToken = createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
      // Find user with this token and check if expired
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() } // Token not expired
    });

    if (!user) {
      const error = new Error('Reset token invalid or expired');
      error.status = 400;
      throw error;
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.status = 400;
      throw error;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    logger.info(`Password reset successful for user: ${user.email}`);
    return { message: 'Password reset successful' };
  } catch (error) {
    logger.error(`Error resetting password: ${error.message}`);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword
};
