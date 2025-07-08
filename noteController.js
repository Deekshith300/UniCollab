const Note = require('../models/Note');
const notificationController = require('./notificationController');

exports.createNote = async (req, res) => {
  const { title, content, category, subject, tags, isPublic, groupId } = req.body;
  try {
    const note = new Note({
      title,
      content,
      category,
      subject,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
      isPublic,
      group: groupId,
      author: req.user.id
    });
    await note.save();
    const populatedNote = await Note.findById(note._id)
      .populate('author', 'name')
      .populate('sharedWith.user', 'name');
    res.status(201).json(populatedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getUserNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { author: req.user.id },
        { isPublic: true },
        { 'sharedWith.user': req.user.id }
      ]
    })
    .populate('author', 'name')
    .populate('sharedWith.user', 'name')
    .populate('group', 'name')
    .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('author', 'name')
      .populate('sharedWith.user', 'name')
      .populate('group', 'name')
      .populate('comments.author', 'name')
      .populate('likes', 'name');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.canView(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateNote = async (req, res) => {
  const { title, content, category, subject, tags, isPublic } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.canEdit(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    note.title = title;
    note.content = content;
    note.category = category;
    note.subject = subject;
    note.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []);
    note.isPublic = isPublic;
    note.version += 1;
    await note.save();
    const updatedNote = await Note.findById(note._id)
      .populate('author', 'name')
      .populate('sharedWith.user', 'name');
    res.json(updatedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the author can delete notes' });
    }
    await note.deleteOne();
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.shareNote = async (req, res) => {
  const { userId, permission } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the author can share notes' });
    }
    note.sharedWith = note.sharedWith.filter(share => share.user.toString() !== userId);
    note.sharedWith.push({ user: userId, permission: permission || 'view' });
    await note.save();
    const updatedNote = await Note.findById(note._id)
      .populate('author', 'name')
      .populate('sharedWith.user', 'name');
    res.json(updatedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  const { content } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.canView(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await note.addComment(req.user.id, content);
    const updatedNote = await Note.findById(note._id)
      .populate('author', 'name')
      .populate('sharedWith.user', 'name')
      .populate('comments.author', 'name');
    // Emit notification to note author
    if (note.author.toString() !== req.user.id) {
      await notificationController.createNotification(
        note.author,
        req.user.id,
        'note_comment',
        'New Comment',
        'Your note received a new comment.'
      );
    }
    res.json(updatedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.canView(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await note.toggleLike(req.user.id);
    const updatedNote = await Note.findById(note._id)
      .populate('author', 'name')
      .populate('likes', 'name');
    // Emit notification to note author
    if (note.author.toString() !== req.user.id) {
      await notificationController.createNotification(
        note.author,
        req.user.id,
        'note_like',
        'New Like',
        'Your note was liked.'
      );
    }
    res.json(updatedNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.reportNote = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: 'Reason is required' });
  try {
    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.reports.some(r => r.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'You have already reported this note' });
    }
    note.reports.push({ user: req.user.id, reason });
    await note.save();
    res.json({ message: 'Note reported', note });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReportedNotes = async (req, res) => {
  try {
    const notes = await Note.find({ 'reports.0': { $exists: true } })
      .populate('author', 'name username')
      .populate('reports.user', 'name username')
      .sort({ 'reports.length': -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.moderatorDeleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted by moderator' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPublicNotes = async (req, res) => {
  try {
    const notes = await Note.find({ isPublic: true })
      .populate('author', 'name')
      .populate('sharedWith.user', 'name')
      .populate('group', 'name')
      .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}; 