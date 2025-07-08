const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const Note = require('../models/Note');
const StudyResource = require('../models/StudyResource');
const Group = require('../models/Group');
const notificationController = require('./notificationController');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.signup = async (req, res) => {
  console.log('Signup request body:', req.body);
  const { name, username, email, password, bio } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('Signup error: Email or username already exists');
      return res.status(400).json({ message: 'Email or username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, username, email, password: hashedPassword, bio });
    await user.save();
    console.log('User created successfully:', user._id);
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  console.log('Login request body:', req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login error: Invalid credentials (user not found)');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login error: Invalid credentials (wrong password)');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful for user:', user._id);
    res.json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email, bio: user.bio } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, username, email, bio } = req.body;
  try {
    // Check for username uniqueness if changed
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existingUser) return res.status(400).json({ message: 'Username already exists' });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, username, email, bio },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name username email bio').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('name username bio profilePicture department year skills followers following');
    if (!user) return res.status(404).json({ message: 'User not found' });
    let isFollowing = false;
    if (req.user && user.followers && user.followers.length > 0) {
      isFollowing = user.followers.some(f => f.equals(req.user.id));
    }
    res.json({
      name: user.name,
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture,
      department: user.department,
      year: user.year,
      skills: user.skills,
      followersCount: user.followers ? user.followers.length : 0,
      followingCount: user.following ? user.following.length : 0,
      isFollowing
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (!userToFollow || !currentUser) return res.status(404).json({ message: 'User not found' });
    if (userToFollow._id.equals(currentUser._id)) return res.status(400).json({ message: 'You cannot follow yourself' });
    if (userToFollow.followers.includes(currentUser._id)) return res.status(400).json({ message: 'Already following' });
    userToFollow.followers.push(currentUser._id);
    currentUser.following.push(userToFollow._id);
    await userToFollow.save();
    await currentUser.save();
    // Emit notification
    await notificationController.createNotification(
      userToFollow._id,
      currentUser._id,
      'new_follower',
      'New Follower',
      `${currentUser.name} started following you.`
    );
    res.json({ message: 'Followed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (!userToUnfollow || !currentUser) return res.status(404).json({ message: 'User not found' });
    if (userToUnfollow._id.equals(currentUser._id)) return res.status(400).json({ message: 'You cannot unfollow yourself' });
    userToUnfollow.followers = userToUnfollow.followers.filter(f => !f.equals(currentUser._id));
    currentUser.following = currentUser.following.filter(f => !f.equals(userToUnfollow._id));
    await userToUnfollow.save();
    await currentUser.save();
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userId = user._id;
    // Fetch posts
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 }).limit(10);
    // Fetch notes
    const notes = await Note.find({ author: userId }).sort({ createdAt: -1 }).limit(10);
    // Fetch resources
    const resources = await StudyResource.find({ author: userId }).sort({ createdAt: -1 }).limit(10);
    // Fetch group joins
    const groups = await Group.find({ 'members.user': userId }).sort({ createdAt: -1 }).limit(10);
    // Fetch comments (from posts, notes, resources)
    let comments = [];
    // Post comments
    for (const post of posts) {
      if (post.comments && post.comments.length > 0) {
        comments = comments.concat(post.comments.filter(c => c.author.equals(userId)).map(c => ({
          type: 'comment',
          targetType: 'post',
          targetId: post._id,
          content: c.content,
          date: c.createdAt,
          extra: post.title
        })));
      }
    }
    // Note comments
    const noteDocs = await Note.find({ 'comments.author': userId });
    for (const note of noteDocs) {
      if (note.comments && note.comments.length > 0) {
        comments = comments.concat(note.comments.filter(c => c.author.equals(userId)).map(c => ({
          type: 'comment',
          targetType: 'note',
          targetId: note._id,
          content: c.content,
          date: c.createdAt,
          extra: note.title
        })));
      }
    }
    // Resource comments
    const resourceDocs = await StudyResource.find({ 'comments.author': userId });
    for (const resource of resourceDocs) {
      if (resource.comments && resource.comments.length > 0) {
        comments = comments.concat(resource.comments.filter(c => c.author.equals(userId)).map(c => ({
          type: 'comment',
          targetType: 'resource',
          targetId: resource._id,
          content: c.content,
          date: c.createdAt,
          extra: resource.title
        })));
      }
    }
    // Map activities
    const activities = [
      ...posts.map(p => ({ type: 'post', date: p.createdAt, title: p.title, targetId: p._id })),
      ...notes.map(n => ({ type: 'note', date: n.createdAt, title: n.title, targetId: n._id })),
      ...resources.map(r => ({ type: 'resource', date: r.createdAt, title: r.title, targetId: r._id })),
      ...groups.map(g => ({ type: 'group_join', date: g.createdAt, title: g.name, targetId: g._id })),
      ...comments
    ];
    // Sort by date descending, limit 30
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(activities.slice(0, 30));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required.' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: List all users with roles
exports.adminListUsers = async (req, res) => {
  try {
    const users = await User.find().select('name username email role department year skills bio');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Update user role
exports.adminUpdateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['user', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: Delete user and their content
exports.adminDeleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Optionally, delete user's posts, notes, resources, etc.
    await Post.deleteMany({ author: id });
    await Note.deleteMany({ author: id });
    await StudyResource.deleteMany({ author: id });
    // Remove user from groups
    await Group.updateMany({}, { $pull: { 'members': { user: id } } });
    res.json({ message: 'User and content deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.globalSearch = async (req, res) => {
  const { q, type } = req.query;
  if (!q || q.length < 2) return res.status(400).json({ message: 'Query too short' });
  const regex = new RegExp(q, 'i');
  try {
    let users = [], posts = [], notes = [], resources = [];
    if (!type || type === 'user') {
      users = await User.find({ $or: [
        { name: regex },
        { username: regex },
        { email: regex },
        { bio: regex }
      ] }).select('name username email bio profilePicture');
    }
    if (!type || type === 'post') {
      posts = await Post.find({ $or: [
        { title: regex },
        { content: regex }
      ] }).populate('author', 'name username profilePicture');
    }
    if (!type || type === 'note') {
      notes = await Note.find({ $or: [
        { title: regex },
        { content: regex }
      ] }).populate('author', 'name username profilePicture');
    }
    if (!type || type === 'resource') {
      resources = await StudyResource.find({ $or: [
        { title: regex },
        { description: regex }
      ] }).populate('author', 'name username profilePicture');
    }
    res.json({ users, posts, notes, resources });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with that email.' });
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    // Send email
    const resetUrl = `http://localhost:3001/reset-password/${token}`;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - UniCollab',
      html: `<p>You requested a password reset for your UniCollab account.</p>
             <p>Click <a href="${resetUrl}">here</a> to reset your password. This link will expire in 1 hour.</p>
             <p>If you did not request this, please ignore this email.</p>`
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.log('Failed to send email, but here is the reset link:', resetUrl);
    }
    res.json({ message: 'Password reset link sent! Check your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }
  try {
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });
    user.password = await require('bcryptjs').hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 