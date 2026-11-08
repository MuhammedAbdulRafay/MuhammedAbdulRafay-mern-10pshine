const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { logger, httpLogger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const userRoutes = require('./routes/userRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');


// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware - request processing
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP logging middleware (logs all requests)
app.use(httpLogger);

// Connect to MongoDB
connectDB();

// ===== ROUTES =====
// All your routes go here (in later phases)

// Auth routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  logger.info('Home route accessed');
  res.json({ 
    message: 'Notes App Backend is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/api/auth', forgotPasswordRoutes);

app.use('/api/auth', authRoutes);

// Notes routes (protected)
app.use('/api/notes', notesRoutes);

// User profile routes (protected)
app.use('/api/users', userRoutes);

// Test route
app.get('/', (req, res) => {
  logger.info('Home route accessed');
  res.json({ 
    message: 'Notes App Backend is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'error',
    message: dbConnected
      ? 'Server is healthy'
      : 'Database connection unavailable',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ===== ERROR HANDLING MIDDLEWARE =====
// IMPORTANT: Register these AFTER all routes

// 404 Not Found middleware
// Catches requests to routes that don't exist
app.use(notFound);

// Global Error Handler middleware
// Catches all errors thrown anywhere in the app
// MUST be last middleware (after all routes and other middleware)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  logger.info(`
╔════════════════════════════════════════╗
║     Notes App Backend Server           ║
╠════════════════════════════════════════╣
║ Server Status: ✓ Running               ║
║ Port: ${PORT}                            ║
║ Environment: ${NODE_ENV}              ║
║ URL: http://localhost:${PORT}          ║
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
