const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { auth, isModerator } = require('../middleware/auth');

// Posts CRUD
router.post('/', auth, postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', auth, postController.updatePost);
router.delete('/:id', auth, postController.deletePost);

// Likes
router.post('/:id/like', auth, postController.likePost);
router.post('/:id/unlike', auth, postController.unlikePost);

// Comments
router.post('/:postId/comments', auth, postController.createComment);
router.get('/:postId/comments', postController.getComments);
router.delete('/comments/:commentId', auth, postController.deleteComment);

// Report
router.post('/:id/report', auth, postController.reportPost);

// Moderator endpoints
router.get('/reported', isModerator, postController.getReportedPosts);
router.delete('/:id/moderate', isModerator, postController.moderatorDeletePost);

module.exports = router; 