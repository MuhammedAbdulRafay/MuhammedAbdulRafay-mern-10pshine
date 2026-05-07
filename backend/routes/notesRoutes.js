const express = require('express');
const {
  getNotes,
  createNewNote,
  updateNoteById,
  deleteNoteById
} = require('../controllers/notesController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * All notes routes are protected with authMiddleware
 * User must be logged in to access these routes
 */

/**
 * GET /api/notes
 * Get all notes for logged-in user
 */
router.get('/', authMiddleware, getNotes);

/**
 * POST /api/notes
 * Create a new note
 */
router.post('/', authMiddleware, createNewNote);

/**
 * PUT /api/notes/:id
 * Update a specific note
 * :id = note ID in URL (e.g., /api/notes/65a1b2c3d4e5f6g7h8i9j0k1)
 */
router.put('/:id', authMiddleware, updateNoteById);

/**
 * DELETE /api/notes/:id
 * Delete a specific note
 */
router.delete('/:id', authMiddleware, deleteNoteById);

module.exports = router;