const Thread = require('../models/Thread');

// Get all threads
exports.getThreads = async (req, res) => {
  try {
    const threads = await Thread.find().populate('poster', 'name username').populate('comments.author', 'name username');
    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get thread by ID
exports.getThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id).populate('poster', 'name username').populate('comments.author', 'name username');
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    res.json(thread);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create thread
exports.createThread = async (req, res) => {
  try {
    const { title, content } = req.body;
    const thread = new Thread({
      title,
      content,
      poster: req.user.id
    });
    await thread.save();
    res.status(201).json(thread);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create thread' });
  }
};

// Add comment to thread
exports.addComment = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    const { text } = req.body;
    thread.comments.push({ author: req.user.id, text });
    await thread.save();
    await thread.populate('comments.author', 'name username');
    res.json(thread);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add comment' });
  }
};

// Update thread
exports.updateThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.poster.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    const { title, content } = req.body;
    thread.title = title || thread.title;
    thread.content = content || thread.content;
    await thread.save();
    res.json(thread);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update thread' });
  }
};

// Delete thread
exports.deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });
    if (thread.poster.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    await thread.remove();
    res.json({ message: 'Thread deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete thread' });
  }
}; 