const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { auth, isModerator } = require('../middleware/auth');

// Notes CRUD
router.post('/', auth, noteController.createNote);
router.get('/', auth, noteController.getUserNotes);
router.get('/:id', auth, noteController.getNoteById);
router.put('/:id', auth, noteController.updateNote);
router.delete('/:id', auth, noteController.deleteNote);

// Share note
router.post('/:id/share', auth, noteController.shareNote);

// Comments
router.post('/:id/comments', auth, noteController.addComment);

// Like/unlike note
router.post('/:id/like', auth, noteController.toggleLike);

// Report note
router.post('/:id/report', auth, noteController.reportNote);

// Moderator endpoints
router.get('/reported', isModerator, noteController.getReportedNotes);
router.delete('/:id/moderate', isModerator, noteController.moderatorDeleteNote);

// Public notes (no auth required)
router.get('/public', noteController.getAllPublicNotes);

module.exports = router; 