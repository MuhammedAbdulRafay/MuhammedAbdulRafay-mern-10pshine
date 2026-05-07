const Note = require('../models/Note');
const { logger } = require('../utils/logger');

/**
 * Get all notes for a specific user
 * @param {string} userId - The user's ID
 * @returns {Array} Array of notes belonging to the user
 */
const getUserNotes = async (userId) => {
  try {
    // Find all notes where user_id matches the logged-in user
    const notes = await Note.find({ user_id: userId })
      .sort({ createdAt: -1 }); // Sort by newest first (-1 = descending)

    // Log the event
    logger.info(`Fetched ${notes.length} notes for user: ${userId}`);

    return notes;
  } catch (error) {
    logger.error(`Error fetching notes: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new note
 * @param {string} userId - The user's ID
 * @param {string} title - Note title
 * @param {string} content - Note content (rich text)
 * @returns {Object} The created note
 */
const createNote = async (userId, title, content) => {
  try {
    // Validate inputs
    if (!title || !content) {
      const error = new Error('Title and content are required');
      error.status = 400;
      throw error;
    }

    // Create new note
    const note = await Note.create({
      title,
      content,
      user_id: userId // Link note to the user who created it
    });

    // Log the event
    logger.info(`Note created by user ${userId}: ${note._id}`);

    return note;
  } catch (error) {
    logger.error(`Error creating note: ${error.message}`);
    throw error;
  }
};

/**
 * Update an existing note
 * @param {string} noteId - The note's ID
 * @param {string} userId - The user's ID (for ownership verification)
 * @param {string} title - New title
 * @param {string} content - New content
 * @returns {Object} The updated note
 */
const updateNote = async (noteId, userId, title, content) => {
  try {
    // Find the note
    const note = await Note.findById(noteId);

    // Check if note exists
    if (!note) {
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    // Check ownership - verify the note belongs to this user
    // Convert to strings for comparison (MongoDB IDs are objects)
    if (note.user_id.toString() !== userId.toString()) {
      const error = new Error('You can only update your own notes');
      error.status = 403; // 403 = Forbidden
      throw error;
    }

    // Update the note
    note.title = title || note.title; // Use new title if provided, else keep old
    note.content = content || note.content; // Use new content if provided, else keep old
    await note.save(); // Save to database

    // Log the event
    logger.info(`Note updated by user ${userId}: ${noteId}`);

    return note;
  } catch (error) {
    logger.error(`Error updating note: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a note
 * @param {string} noteId - The note's ID
 * @param {string} userId - The user's ID (for ownership verification)
 * @returns {Object} Deletion confirmation
 */
const deleteNote = async (noteId, userId) => {
  try {
    // Find the note
    const note = await Note.findById(noteId);

    // Check if note exists
    if (!note) {
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    // Check ownership
    if (note.user_id.toString() !== userId.toString()) {
      const error = new Error('You can only delete your own notes');
      error.status = 403; // 403 = Forbidden
      throw error;
    }

    // Delete the note
    await Note.findByIdAndDelete(noteId);

    // Log the event
    logger.info(`Note deleted by user ${userId}: ${noteId}`);

    return {
      message: 'Note deleted successfully',
      deletedNoteId: noteId
    };
  } catch (error) {
    logger.error(`Error deleting note: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getUserNotes,
  createNote,
  updateNote,
  deleteNote
};