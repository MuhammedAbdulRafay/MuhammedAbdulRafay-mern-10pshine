const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
        email: user.email
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

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};