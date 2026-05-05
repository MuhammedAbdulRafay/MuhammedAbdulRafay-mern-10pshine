const { logger } = require('../utils/logger');

/**
 * Global Error Handling Middleware
 * This catches ALL errors thrown anywhere in the application
 * 
 * IMPORTANT: Must have 4 arguments (err, req, res, next)
 * The 4 arguments tell Express this is an error handler
 */
const errorHandler = (err, req, res, next) => {
  // Get the error message
  const message = err.message || 'Internal Server Error';
  
  // Get the status code (default to 500 if not set)
  const status = err.status || err.statusCode || 500;

  const error = new Error('User not found');
  error.status = 404; // Tell error handler to use 404
  next(error);
  
  // Log the error with full details
  logger.error({
    message: 'Error occurred',
    error: message,
    status: status,
    url: req.url,
    method: req.method,
    stack: err.stack, // Full stack trace for debugging
    timestamp: new Date().toISOString(),
  });

  // In development, send full details (including stack trace)
  if (process.env.NODE_ENV === 'development') {
    return res.status(status).json({
      status: 'error',
      message: message,
      error: err, // Send full error object in development
      stack: err.stack, // Send stack trace in development
      timestamp: new Date().toISOString(),
    });
  }

  // In production, send only safe information (no stack trace)
  res.status(status).json({
    status: 'error',
    message: message,
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorHandler;