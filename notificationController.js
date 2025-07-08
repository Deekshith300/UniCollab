const Notification = require('../models/Notification');
const User = require('../models/User');
let io;
try { io = require('../index').io; } catch {}

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name')
      .populate('relatedPost', 'title')
      .populate('relatedNote', 'title')
      .populate('relatedResource', 'title')
      .populate('relatedGroup', 'name')
      .populate('relatedTask', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user.id, 
      read: false 
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.createNotification = async (recipientId, senderId, type, title, content, relatedData = {}) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      content,
      ...relatedData
    });
    await notification.save();
    // Emit real-time notification if io is available
    if (io) {
      io.to(`user_${recipientId}`).emit('notification', notification);
    }
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
}; 