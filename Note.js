const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Lecture Notes', 'Study Guide', 'Assignment', 'Research', 'Personal', 'Other'],
    default: 'Other'
  },
  subject: {
    type: String,
    trim: true
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  reports: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

// Update the updatedAt field before saving
noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if user can view the note
noteSchema.methods.canView = function(userId) {
  // Author can always view
  if (this.author.toString() === userId) return true;
  
  // Public notes can be viewed by anyone
  if (this.isPublic) return true;
  
  // Check if shared with user
  return this.sharedWith.some(share => share.user.toString() === userId);
};

// Method to check if user can edit the note
noteSchema.methods.canEdit = function(userId) {
  // Author can always edit
  if (this.author.toString() === userId) return true;
  
  // Check if shared with edit permission
  return this.sharedWith.some(share => 
    share.user.toString() === userId && share.permission === 'edit'
  );
};

// Method to add a comment
noteSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content
  });
  return this.save();
};

// Method to like/unlike the note
noteSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

module.exports = mongoose.model('Note', noteSchema); 