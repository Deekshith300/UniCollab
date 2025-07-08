const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member'
    }
  }],
  category: {
    type: String,
    required: true,
    enum: ['Study Group', 'Project Team', 'Research', 'Social', 'Other']
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: 50
  },
  tags: [String],
  avatar: String, // Cloudinary URL
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add creator as admin and member
groupSchema.pre('save', function(next) {
  if (this.isNew) {
    this.admins.push(this.creator);
    this.members.push({
      user: this.creator,
      role: 'admin'
    });
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema); 