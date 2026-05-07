const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

/**
 * Authentication Middleware
 * Checks if user has valid JWT token
 * If valid: attaches user info to req.user and calls next()
 * If invalid: returns 401 Unauthorized
 */
const authMiddleware = (req, res, next) => {
  try {
    // Step 1: Get token from Authorization header
    // Header format: "Bearer eyJhbGciOiJIUzI1NiIs..."
    const authHeader = req.headers.authorization;

    // Check if header exists
    if (!authHeader) {
      const error = new Error('No token provided');
      error.status = 401;
      logger.warn(`Unauthorized access attempt: No token provided for ${req.path}`);
      return next(error);
    }

    // Step 2: Extract token from header
    // Split "Bearer token" and get the token part
    const token = authHeader.split(' ')[1];

    if (!token) {
      const error = new Error('Invalid token format');
      error.status = 401;
      logger.warn(`Unauthorized access attempt: Invalid token format for ${req.path}`);
      return next(error);
    }

    // Step 3: Verify token
    // If token is valid, jwt.verify returns the payload (userId, email, etc)
    // If token is invalid, it throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 4: Attach user info to request object
    // So other middleware/controllers can access req.user
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username
    };

    // Step 5: Log successful authentication
    logger.info(`User authenticated: ${decoded.email}`);

    // Step 6: Call next middleware/controller
    next();
  } catch (error) {
    // Handle various JWT errors
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Token expired');
      err.status = 401;
      logger.warn(`Unauthorized access attempt: Token expired for ${req.path}`);
      return next(err);
    }

    if (error.name === 'JsonWebTokenError') {
      const err = new Error('Invalid token');
      err.status = 401;
      logger.warn(`Unauthorized access attempt: Invalid token for ${req.path}`);
      return next(err);
    }

    // Other errors
    const err = new Error('Authentication failed');
    err.status = 401;
    logger.error(`Authentication error: ${error.message}`);
    next(err);
  }
};

module.exports = authMiddleware;