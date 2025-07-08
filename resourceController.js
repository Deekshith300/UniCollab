const StudyResource = require('../models/StudyResource');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const notificationController = require('./notificationController');

exports.createResource = async (req, res) => {
  const { title, description, type, url, subject, tags, difficulty, isPublic } = req.body;
  try {
    const resource = new StudyResource({
      title,
      description,
      type,
      url,
      author: req.user.id,
      subject,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
      difficulty,
      isPublic
    });
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getResources = async (req, res) => {
  try {
    const resources = await StudyResource.find({
      $or: [
        { author: req.user.id },
        { isPublic: true }
      ]
    })
    .populate('author', 'name')
    .sort({ updatedAt: -1 });
    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getResourceById = async (req, res) => {
  try {
    const resource = await StudyResource.findById(req.params.id)
      .populate('author', 'name');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (!resource.isPublic && resource.author._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateResource = async (req, res) => {
  const { title, description, type, url, subject, tags, difficulty, isPublic } = req.body;
  try {
    const resource = await StudyResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the author can update this resource' });
    }
    resource.title = title;
    resource.description = description;
    resource.type = type;
    resource.url = url;
    resource.subject = subject;
    resource.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []);
    resource.difficulty = difficulty;
    resource.isPublic = isPublic;
    await resource.save();
    res.json(resource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await StudyResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the author can delete this resource' });
    }
    await resource.deleteOne();
    res.json({ message: 'Resource deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.uploadResourceFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'resources' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const resource = await StudyResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (!resource.canView(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await resource.toggleLike(req.user.id);
    const updatedResource = await StudyResource.findById(resource._id)
      .populate('author', 'name')
      .populate('likes', 'name');
    // Emit notification to resource author
    if (resource.author.toString() !== req.user.id) {
      await notificationController.createNotification(
        resource.author,
        req.user.id,
        'resource_like',
        'New Like',
        'Your resource was liked.'
      );
    }
    res.json(updatedResource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  const { content } = req.body;
  try {
    const resource = await StudyResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (!resource.canView(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await resource.addComment(req.user.id, content);
    const updatedResource = await StudyResource.findById(resource._id)
      .populate('author', 'name')
      .populate('comments.author', 'name');
    // Emit notification to resource author
    if (resource.author.toString() !== req.user.id) {
      await notificationController.createNotification(
        resource.author,
        req.user.id,
        'resource_comment',
        'New Comment',
        'Your resource received a new comment.'
      );
    }
    res.json(updatedResource);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.reportResource = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: 'Reason is required' });
  try {
    const resource = await StudyResource.findById(id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.reports.some(r => r.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'You have already reported this resource' });
    }
    resource.reports.push({ user: req.user.id, reason });
    await resource.save();
    res.json({ message: 'Resource reported', resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReportedResources = async (req, res) => {
  try {
    const resources = await StudyResource.find({ 'reports.0': { $exists: true } })
      .populate('author', 'name username')
      .populate('reports.user', 'name username')
      .sort({ 'reports.length': -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.moderatorDeleteResource = async (req, res) => {
  try {
    const resource = await StudyResource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ message: 'Resource deleted by moderator' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 