const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

// Individual tasks
router.post('/', auth, taskController.createTask);
router.get('/', auth, taskController.getUserTasks);
router.patch('/:taskId/status', auth, taskController.updateIndividualTaskStatus);
router.delete('/:taskId', auth, taskController.deleteIndividualTask);

// Group tasks
router.post('/groups/:groupId/tasks', auth, taskController.createGroupTask);
router.get('/groups/:groupId/tasks', auth, taskController.getGroupTasks);

// Single task (for group tasks)
router.get('/:taskId', auth, taskController.getTaskById);
router.patch('/:taskId/assign', auth, taskController.updateTaskAssignee);
router.post('/:taskId/comments', auth, taskController.addTaskComment);

// Analytics
router.get('/analytics', auth, taskController.getAnalytics);

module.exports = router; 