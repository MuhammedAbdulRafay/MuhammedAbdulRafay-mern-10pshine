const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get MongoDB URI from .env file
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes_app';

/**
 * Connect to MongoDB database
 * This function is called when the server starts
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB
    const conn = await mongoose.connect(MONGODB_URI);

    // If connection successful, log this
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    // If connection fails, log the error
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    
    // Exit the process (stop the server) if can't connect to DB
    process.exit(1);
  }
};

// Export the function so other files can use it
module.exports = connectDB;