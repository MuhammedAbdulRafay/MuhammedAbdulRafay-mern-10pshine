const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * 
 * Connect to test database
 * Use a different database name for testing so we don't touch production data
 */
const connectTestDB = async () => {
  try {
    const testDBURI = process.env.MONGODB_URI.replace('notes_app', 'notes_app_test');

    // Remove the deprecated options
    await mongoose.connect(testDBURI);

    console.log('Connected to test database');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from test database
 */
const disconnectTestDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Failed to disconnect from test database:', error);
  }
};

/**
 * Clear all collections in test database
 * Useful before each test to start fresh
 */
const clearDatabase = async () => {
  try {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }

    console.log('Database cleared');
  } catch (error) {
    console.error('Failed to clear database:', error);
  }
};

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearDatabase
};