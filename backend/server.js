const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { logger, httpLogger } = require('./utils/logger'); // Import logger and httpLogger

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware - functions that process requests
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Understand JSON data
app.use(express.urlencoded({ extended: true })); // Understand form data

// Register HTTP logger middleware BEFORE all routes
// This logs every incoming request and outgoing response
app.use(httpLogger);

// Connect to MongoDB database
connectDB();

// Test route
app.get('/', (req, res) => {
  // Log a custom message
  logger.info('Home route accessed');
  
  res.json({ 
    message: 'Notes App Backend is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  logger.info('Health check endpoint called');
  
  res.json({
    status: 'ok',
    message: 'Server is healthy',
    database: 'MongoDB connected',
    timestamp: new Date().toISOString()
  });
});

// 404 - route not found
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`); // Log as warning
  
  res.status(404).json({
    message: 'Route not found',
    status: 'error',
    path: req.path
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  logger.error({
    message: 'Server error occurred',
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    status: 'error'
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  logger.info(`
╔════════════════════════════════════════╗
║     Notes App Backend Server           ║
╠════════════════════════════════════════╣
║ Server Status: ✓ Running               ║
║ Port: ${PORT}                             ║
║ Environment: ${NODE_ENV}               ║
║ URL: http://localhost:${PORT}             ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    message: 'Unhandled rejection occurred',
    reason: reason,
    promise: promise
  });
});