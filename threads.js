const express = require('express');
const router = express.Router();
const threadController = require('../controllers/threadController');
const { auth } = require('../middleware/auth');

router.get('/', threadController.getThreads);
router.get('/:id', threadController.getThread);
router.post('/', auth, threadController.createThread);
router.post('/:id/comments', auth, threadController.addComment);
router.put('/:id', auth, threadController.updateThread);
router.delete('/:id', auth, threadController.deleteThread);

module.exports = router; 