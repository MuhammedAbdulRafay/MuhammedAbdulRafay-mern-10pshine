const { logger } = require('../utils/logger');

/**
 * 404 Not Found Middleware
 * This catches requests to routes that don't exist
 * Must be registered AFTER all other routes
 */
const notFound = (req, res, next) => {
  // Create an error object
  const error = new Error(`Not Found - ${req.originalUrl}`);
  
  // Set status to 404
  error.status = 404;
  
  // Log the 404 as a warning (not critical, just unusual)
  logger.warn({
    message: '404 - Route not found',
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });
  
  // Pass to error handler middleware
  next(error);
};

module.exports = notFound;