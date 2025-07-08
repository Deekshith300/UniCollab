const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { auth } = require('../middleware/auth');

// Groups CRUD
router.post('/', auth, groupController.createGroup);
router.get('/', groupController.getAllPublicGroups);
router.get('/my-groups', auth, groupController.getMyGroups);
router.get('/:id', groupController.getGroupById);
router.post('/:id/join', auth, groupController.joinGroup);
router.post('/:id/leave', auth, groupController.leaveGroup);

// Group Posts
router.post('/:groupId/posts', auth, groupController.createGroupPost);
router.get('/:groupId/posts', groupController.getGroupPosts);

// Group Messages
router.get('/:groupId/messages', auth, groupController.getGroupMessages);
router.post('/:groupId/messages', auth, groupController.sendGroupMessage);

// Group Tasks
router.post('/:groupId/tasks', auth, groupController.createGroupTask);
router.get('/:groupId/tasks', auth, groupController.getGroupTasks);

module.exports = router; 