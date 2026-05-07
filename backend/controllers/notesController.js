const {
  getUserNotes,
  createNote,
  updateNote,
  deleteNote
} = require('../services/notesService');
const { logger } = require('../utils/logger');

/**
 * Get all notes for logged-in user
 * GET /api/notes
 */
const getNotes = async (req, res, next) => {
  try {
    // Get user ID from authenticated user (added by authMiddleware)
    const userId = req.user.userId;

    // Call service to get user's notes
    const notes = await getUserNotes(userId);

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Notes fetched successfully',
      count: notes.length,
      notes: notes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new note
 * POST /api/notes
 */
const createNewNote = async (req, res, next) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.userId;

    // Get title and content from request body
    const { title, content } = req.body;

    // Call service to create note
    const note = await createNote(userId, title, content);

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'Note created successfully',
      note: note
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing note
 * PUT /api/notes/:id
 */
const updateNoteById = async (req, res, next) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.userId;

    // Get note ID from URL parameter
    const noteId = req.params.id;

    // Get title and content from request body
    const { title, content } = req.body;

    // Call service to update note
    const updatedNote = await updateNote(noteId, userId, title, content);

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Note updated successfully',
      note: updatedNote
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a note
 * DELETE /api/notes/:id
 */
const deleteNoteById = async (req, res, next) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.userId;

    // Get note ID from URL parameter
    const noteId = req.params.id;

    // Call service to delete note
    const result = await deleteNote(noteId, userId);

    // Send response
    res.status(200).json({
      status: 'success',
      message: result.message,
      deletedNoteId: result.deletedNoteId
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotes,
  createNewNote,
  updateNoteById,
  deleteNoteById
};