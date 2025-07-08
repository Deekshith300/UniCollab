const mongoose = require('mongoose');

const studyResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Video', 'Document', 'Link', 'Book', 'Article', 'Quiz', 'Other'],
    required: true
  },
  url: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileType: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    trim: true
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    ratings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  views: {
    type: Number,
    default: 0
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
studyResourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if user can view the resource
studyResourceSchema.methods.canView = function(userId) {
  // Author can always view
  if (this.author.toString() === userId) return true;
  
  // Public resources can be viewed by anyone
  if (this.isPublic) return true;
  
  // Check if shared with user
  return this.sharedWith.some(share => share.user.toString() === userId);
};

// Method to add a rating
studyResourceSchema.methods.addRating = function(userId, rating) {
  // Remove existing rating by this user
  this.rating.ratings = this.rating.ratings.filter(r => r.user.toString() !== userId);
  
  // Add new rating
  this.rating.ratings.push({
    user: userId,
    rating
  });
  
  // Calculate new average
  const totalRating = this.rating.ratings.reduce((sum, r) => sum + r.rating, 0);
  this.rating.average = totalRating / this.rating.ratings.length;
  this.rating.count = this.rating.ratings.length;
  
  return this.save();
};

// Method to add a comment
studyResourceSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content
  });
  return this.save();
};

// Method to like/unlike the resource
studyResourceSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Method to increment views
studyResourceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('StudyResource', studyResourceSchema); 