const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    required: true,
    enum: ['post_like', 'post_comment', 'note_comment', 'resource_rating', 'group_invite', 'task_assigned', 'task_completed', 'message_received', 'new_follower', 'resource_like']
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  relatedNote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  },
  relatedResource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyResource'
  },
  relatedGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  relatedChat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 