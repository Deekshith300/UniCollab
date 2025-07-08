const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

// Get user's chats
router.get('/', auth, chatController.getUserChats);
// Get a specific chat
router.get('/:chatId', auth, chatController.getChatById);
// Create or get private chat
router.post('/private', auth, chatController.createOrGetPrivateChat);
// Create group chat
router.post('/group', auth, chatController.createGroupChat);
// Send message to chat
router.post('/:chatId/messages', auth, chatController.sendMessage);
// Mark messages as read
router.post('/:chatId/read', auth, chatController.markMessagesRead);

module.exports = router;
