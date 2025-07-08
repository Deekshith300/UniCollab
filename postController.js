const Post = require('../models/Post');
const Comment = require('../models/Comment');
const notificationController = require('./notificationController');

exports.createPost = async (req, res) => {
  const { title, content, image, tags } = req.body;
  try {
    const post = new Post({
      title,
      content,
      author: req.user.id,
      image,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name email').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    post.title = title;
    post.content = content;
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
      if (post.author.toString() !== req.user.id) {
        await notificationController.createNotification(
          post.author,
          req.user.id,
          'post_like',
          'New Like',
          'Your post was liked.'
        );
      }
    }
    res.json({ likes: post.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.likes = post.likes.filter(uid => uid.toString() !== req.user.id);
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.createComment = async (req, res) => {
  const { content } = req.body;
  try {
    const comment = new Comment({
      content,
      author: req.user.id,
      post: req.params.postId
    });
    await comment.save();
    const post = await Post.findById(req.params.postId);
    if (post && post.author.toString() !== req.user.id) {
      await notificationController.createNotification(
        post.author,
        req.user.id,
        'post_comment',
        'New Comment',
        'Your post received a new comment.'
      );
    }
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.reportPost = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: 'Reason is required' });
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.reports.some(r => r.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }
    post.reports.push({ user: req.user.id, reason });
    await post.save();
    res.json({ message: 'Post reported', post });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReportedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ 'reports.0': { $exists: true } })
      .populate('author', 'name username')
      .populate('reports.user', 'name username')
      .sort({ 'reports.length': -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.moderatorDeletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted by moderator' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 