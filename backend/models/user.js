const mongoose = require('mongoose');

/**
 * User Schema
 * Defines the structure of a user document in MongoDB
 */
const userSchema = new mongoose.Schema(
  {
    // Username field
    username: {
      type: String,
      required: [true, 'Username is required'], // Must provide username
      unique: true, // No two users can have same username
      trim: true, // Remove whitespace from beginning and end
      minlength: [3, 'Username must be at least 3 characters'], // Minimum length
      maxlength: [30, 'Username cannot exceed 30 characters'], // Maximum length
    },

    // Email field
    email: {
      type: String,
      required: [true, 'Email is required'], // Must provide email
      unique: true, // No two users can have same email
      lowercase: true, // Convert to lowercase automatically
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation regex
        'Please provide a valid email address',
      ],
    },

    // Password field (will be hashed/encrypted)
    password: {
      type: String,
      required: [true, 'Password is required'], // Must provide password
      minlength: [6, 'Password must be at least 6 characters'], // Minimum length
      select: false, // Don't include password in queries by default (for security)
    },

    // Password reset fields
    resetToken: {
      type: String,
      default: null
    },
    resetTokenExpiry: {
      type: Date,
      default: null
    },

    mobile: {
      type: String,
      trim: true,
      default: '',
    },

    location: {
      type: String,
      trim: true,
      default: '',
    },

    avatar: {
      type: String,
      default: '',
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Create User model from schema
 * This model will be used to create/read/update/delete users
 */
const User = mongoose.model('User', userSchema);

// Export the model so other files can use it
module.exports = User;