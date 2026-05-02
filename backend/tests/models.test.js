const mongoose = require('mongoose');
const User = require('../models/User');
const Note = require('../models/Note');

/**
 * Simple test to verify models load correctly
 */
async function testModels() {
  try {
    console.log('Testing User model...');
    console.log('User model loaded:', User.modelName); // Should print: User

    console.log('Testing Note model...');
    console.log('Note model loaded:', Note.modelName); // Should print: Note

    console.log('✓ All models loaded successfully!');
  } catch (error) {
    console.error('✗ Error loading models:', error.message);
  }
}

// Run the test
testModels();