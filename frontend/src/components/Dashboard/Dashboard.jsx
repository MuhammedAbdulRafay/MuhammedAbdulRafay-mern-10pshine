import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Dashboard.css';

/**
 * Dashboard Component
 * Shows all notes for the logged-in user
 */
const Dashboard = () => {
  // State for notes list
  const [notes, setNotes] = useState([]);

  // State for loading (show spinner while fetching)
  const [loading, setLoading] = useState(true);

  // State for error messages
  const [error, setError] = useState('');

  // Hook to navigate to other pages
  const navigate = useNavigate();

  /**
   * Fetch all notes for the logged-in user
   * Called when component mounts
   */
  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError('');

      // Call backend API to get notes
      const response = await api.get('/notes');

      // Extract notes from response
      // response.data = { status: 'success', notes: [...], count: 5 }
      setNotes(response.data.notes);
    } catch (err) {
      // Handle errors
      const errorMessage = err.response?.data?.message || 'Failed to fetch notes';
      setError(errorMessage);
      setNotes([]); // Clear notes if error
    } finally {
      setLoading(false);
    }
  };

  /**
   * useEffect Hook
   * Runs when component mounts
   * Fetches notes from backend
   */
  useEffect(() => {
    fetchNotes();
  }, []); // Empty array = run once on mount

  /**
   * Handle delete note
   * Called when user clicks delete button on a note
   */
  const handleDeleteNote = async (noteId) => {
    // Confirm deletion with user
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return; // User cancelled
    }

    try {
      // Call delete API
      await api.delete(`/notes/${noteId}`);

      // Remove note from list (don't need to refetch)
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (err) {
      // Show error if delete fails
      setError('Failed to delete note');
    }
  };

  /**
   * Handle edit note
   * Navigate to edit page
   */
  const handleEditNote = (noteId) => {
    navigate(`/notes/${noteId}/edit`);
  };

  /**
   * Handle create new note
   * Navigate to create page
   */
  const handleCreateNote = () => {
    navigate('/notes/new');
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect to login
    navigate('/login');
  };

  // ===== RENDER =====

  return (
    <div className="dashboard-container">
      {/* Header with title and buttons */}
      <div className="dashboard-header">
        <h1>My Notes</h1>
        <div className="header-buttons">
          <button
            className="btn btn-primary"
            onClick={handleCreateNote}
          >
            + New Note
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your notes...</p>
        </div>
      )}

      {/* Empty state (no notes) */}
      {!loading && notes.length === 0 && (
        <div className="empty-state">
          <h2>No notes yet</h2>
          <p>Create your first note to get started</p>
          <button
            className="btn btn-primary"
            onClick={handleCreateNote}
          >
            Create First Note
          </button>
        </div>
      )}

      {/* Notes grid */}
      {!loading && notes.length > 0 && (
        <div className="notes-grid">
          {notes.map(note => (
            <div key={note._id} className="note-card">
              {/* Note title */}
              <h3 className="note-title">
                {note.title}
              </h3>

              {/* Note content snippet (first 150 characters) */}
              <p className="note-content">
                {note.content.substring(0, 150)}...
              </p>

              {/* Note metadata (dates) */}
              <div className="note-meta">
                <small>
                  Created: {new Date(note.createdAt).toLocaleDateString()}
                </small>
                <small>
                  Updated: {new Date(note.updatedAt).toLocaleDateString()}
                </small>
              </div>

              {/* Note actions (edit, delete) */}
              <div className="note-actions">
                <button
                  className="btn btn-small btn-primary"
                  onClick={() => handleEditNote(note._id)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDeleteNote(note._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;