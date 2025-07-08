const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

router.get('/', auth, notificationController.getNotifications);
router.post('/:id/read', auth, notificationController.markAsRead);
router.post('/mark-all-read', auth, notificationController.markAllAsRead);

module.exports = router; 