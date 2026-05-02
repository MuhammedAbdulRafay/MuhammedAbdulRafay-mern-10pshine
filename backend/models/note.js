const mongoose = require('mongoose');

/**
 * Note Schema
 * Defines the structure of a note document in MongoDB
 */
const noteSchema = new mongoose.Schema(
  {
    // Title of the note
    title: {
      type: String,
      required: [true, 'Note title is required'], // Must provide title
      trim: true,
      maxlength: [100, 'Note title cannot exceed 100 characters'],
    },

    // Content of the note (rich text - can be HTML)
    content: {
      type: String,
      required: [true, 'Note content is required'], // Must provide content
      default: '', // Default to empty string if not provided
    },

    // Reference to the User who created this note
    // This is how we link notes to users
    user_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User's ObjectId
      ref: 'User', // Reference to the User model
      required: [true, 'User ID is required'], // Must link to a user
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Create Note model from schema
 */
const Note = mongoose.model('Note', noteSchema);

// Export the model
module.exports = Note;