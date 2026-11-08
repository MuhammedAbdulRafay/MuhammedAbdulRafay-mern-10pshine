const { expect } = require('chai');
const { connectTestDB, disconnectTestDB, clearDatabase } = require('./setup');
const User = require('../models/user');
const Note = require('../models/note');
const { registerUser } = require('../services/authService');
const {
  getUserNotes,
  createNote,
  updateNote,
  deleteNote
} = require('../services/notesService');

/**
 * Test suite for Notes Service
 */
describe('Notes Service', () => {
  let userId; // Store user ID for tests

  before(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create a user for note tests
    const user = await registerUser('ahmed', 'ahmed@gmail.com', 'password123');
    userId = user._id;
  });

  after(async () => {
    await disconnectTestDB();
  });

  // ===== GET NOTES TESTS =====
  describe('getUserNotes', () => {
    it('should return empty array when user has no notes', async () => {
      // Act
      const notes = await getUserNotes(userId);

      // Assert
      expect(notes).to.be.an('array');
      expect(notes).to.have.lengthOf(0);
    });

    it('should return only the logged-in user\'s notes', async () => {
      // Arrange - Create notes for current user
      await createNote(userId, 'Note 1', 'Content 1');
      await createNote(userId, 'Note 2', 'Content 2');

      // Create another user with notes
      const otherUser = await registerUser('john', 'john@gmail.com', 'password456');
      await createNote(otherUser._id, 'Other Note', 'Other Content');

      // Act
      const userNotes = await getUserNotes(userId);

      // Assert - Should only get current user's notes
      expect(userNotes).to.have.lengthOf(2);
      expect(userNotes[0].title).to.equal('Note 2'); // Newest first
      expect(userNotes[1].title).to.equal('Note 1');

      // Verify all notes belong to this user
      userNotes.forEach(note => {
        expect(note.user_id.toString()).to.equal(userId.toString());
      });
    });

    it('should sort notes by newest first', async () => {
      // Arrange - Create notes in order
      const note1 = await createNote(userId, 'First Note', 'Content 1');
      const note2 = await createNote(userId, 'Second Note', 'Content 2');
      const note3 = await createNote(userId, 'Third Note', 'Content 3');

      // Act
      const notes = await getUserNotes(userId);

      // Assert - Should be newest first
      expect(notes[0].title).to.equal('Third Note');
      expect(notes[1].title).to.equal('Second Note');
      expect(notes[2].title).to.equal('First Note');
    });
  });

  // ===== CREATE NOTE TESTS =====
  describe('createNote', () => {
    it('should create a new note with valid data', async () => {
      // Act
      const note = await createNote(userId, 'Test Note', 'Test Content');

      // Assert
      expect(note).to.have.property('_id');
      expect(note.title).to.equal('Test Note');
      expect(note.content).to.equal('Test Content');
      expect(note.user_id.toString()).to.equal(userId.toString());
      expect(note).to.have.property('createdAt');
    });

    it('should fail when title is missing', async () => {
      try {
        await createNote(userId, '', 'Test Content');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('required');
        expect(error.status).to.equal(400);
      }
    });

    it('should fail when content is missing', async () => {
      try {
        await createNote(userId, 'Test Note', '');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('required');
        expect(error.status).to.equal(400);
      }
    });
  });

  // ===== UPDATE NOTE TESTS =====
  describe('updateNote', () => {
    let noteId;

    beforeEach(async () => {
      // Create a note for update tests
      const note = await createNote(userId, 'Original Title', 'Original Content');
      noteId = note._id;
    });

    it('should update note with ownership', async () => {
      // Act
      const updatedNote = await updateNote(noteId, userId, 'New Title', 'New Content');

      // Assert
      expect(updatedNote.title).to.equal('New Title');
      expect(updatedNote.content).to.equal('New Content');
      expect(updatedNote._id.toString()).to.equal(noteId.toString());
    });

    it('should fail to update note without ownership', async () => {
      // Arrange - Create another user
      const otherUser = await registerUser('john', 'john@gmail.com', 'password456');

      // Act & Assert
      try {
        await updateNote(noteId, otherUser._id, 'Hacked Title', 'Hacked Content');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('only update your own notes');
        expect(error.status).to.equal(403);
      }
    });

    it('should fail to update non-existent note', async () => {
      // Create a valid but non-existent MongoDB ID
      const validButNonExistentId = new (require('mongoose')).Types.ObjectId();

      try {
        await updateNote(validButNonExistentId, userId, 'Title', 'Content');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('not found');
        expect(error.status).to.equal(404);
      }
    });

    it('should update only title when content is not provided', async () => {
      // Act
      const updatedNote = await updateNote(noteId, userId, 'New Title', null);

      // Assert
      expect(updatedNote.title).to.equal('New Title');
      expect(updatedNote.content).to.equal('Original Content'); // Unchanged
    });

    it('should update only content when title is not provided', async () => {
      // Act
      const updatedNote = await updateNote(noteId, userId, null, 'New Content');

      // Assert
      expect(updatedNote.title).to.equal('Original Title'); // Unchanged
      expect(updatedNote.content).to.equal('New Content');
    });
  });

  // ===== DELETE NOTE TESTS =====
  describe('deleteNote', () => {
    let noteId;

    beforeEach(async () => {
      // Create a note for delete tests
      const note = await createNote(userId, 'Note to Delete', 'Delete me');
      noteId = note._id;
    });

    it('should delete note with ownership', async () => {
      // Act
      const result = await deleteNote(noteId, userId);

      // Assert
      expect(result.message).to.include('deleted');
      expect(result.deletedNoteId.toString()).to.equal(noteId.toString());

      // Verify note is actually deleted
      const deletedNote = await Note.findById(noteId);
      expect(deletedNote).to.be.null;
    });

    it('should fail to delete note without ownership', async () => {
      // Arrange - Create another user
      const otherUser = await registerUser('john', 'john@gmail.com', 'password456');

      // Act & Assert
      try {
        await deleteNote(noteId, otherUser._id);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('only delete your own notes');
        expect(error.status).to.equal(403);
      }
    });

    it('should fail to delete non-existent note', async () => {
      // Create a valid but non-existent MongoDB ID
      const validButNonExistentId = new (require('mongoose')).Types.ObjectId();

      try {
        await deleteNote(validButNonExistentId, userId);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('not found');
        expect(error.status).to.equal(404);
      }
    });
  });
});