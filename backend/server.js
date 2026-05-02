const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware - functions that process requests
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Understand JSON data
app.use(express.urlencoded({ extended: true })); // Understand form data

// Connect to MongoDB database
// This runs when server starts
connectDB();

// Test route - just to confirm server works
app.get('/', (req, res) => {
  res.json({ 
    message: 'Notes App Backend is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is healthy',
    database: 'MongoDB connected',
    timestamp: new Date().toISOString()
  });
});

// 404 - route not found
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    status: 'error',
    path: req.path
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`
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

// Handle unhandled promise rejections (database errors, etc)
process.on('unhandledRejection', (reason, promise) => {
  console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
});