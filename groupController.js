const Group = require('../models/Group');
const GroupPost = require('../models/GroupPost');
const GroupMessage = require('../models/GroupMessage');
const Task = require('../models/Task');
const notificationController = require('./notificationController');

exports.createGroup = async (req, res) => {
  const { name, description, category, isPrivate, tags, avatar } = req.body;
  try {
    const group = new Group({
      name,
      description,
      category,
      isPrivate,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
      avatar,
      creator: req.user.id
    });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPublicGroups = async (req, res) => {
  try {
    const groups = await Group.find({ isPrivate: false })
      .populate('creator', 'name')
      .populate('members.user', 'name')
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { creator: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
    .populate('creator', 'name')
    .populate('members.user', 'name')
    .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name')
      .populate('members.user', 'name')
      .populate('admins', 'name');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (isMember) return res.status(400).json({ message: 'Already a member of this group' });
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }
    group.members.push({ user: req.user.id, role: 'member' });
    await group.save();
    await notificationController.createNotification(
      req.user.id,
      group.creator.toString(),
      'group_invite',
      'Group Invite',
      `You were invited to join the group ${group.name}.`,
      { relatedGroup: group._id }
    );
    res.json({ message: 'Joined group successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.creator.toString() === req.user.id) {
      return res.status(400).json({ message: 'Creator cannot leave the group. Transfer ownership or delete the group.' });
    }
    group.members = group.members.filter(member => member.user.toString() !== req.user.id);
    await group.save();
    res.json({ message: 'Left group successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.createGroupPost = async (req, res) => {
  const { title, content, image, tags } = req.body;
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to post in this group' });
    const groupPost = new GroupPost({
      title,
      content,
      author: req.user.id,
      group: req.params.groupId,
      image,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
    });
    await groupPost.save();
    res.status(201).json(groupPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getGroupPosts = async (req, res) => {
  try {
    const groupPosts = await GroupPost.find({ group: req.params.groupId })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    res.json(groupPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getGroupMessages = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to view messages' });
    const messages = await GroupMessage.find({ group: req.params.groupId })
      .populate('author', 'name')
      .sort({ createdAt: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.sendGroupMessage = async (req, res) => {
  const { content, messageType = 'text', fileUrl, fileName, fileSize } = req.body;
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to send messages' });
    const message = new GroupMessage({
      group: req.params.groupId,
      author: req.user.id,
      content,
      messageType,
      fileUrl,
      fileName,
      fileSize
    });
    await message.save();
    const populatedMessage = await GroupMessage.findById(message._id).populate('author', 'name');
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.createGroupTask = async (req, res) => {
  const { title, description, priority, assignee, dueDate, tags } = req.body;
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to create tasks' });
    const task = new Task({
      title,
      description,
      priority,
      assignee,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
      creator: req.user.id,
      group: req.params.groupId
    });
    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('creator', 'name')
      .populate('assignee', 'name');
    res.status(201).json(populatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getGroupTasks = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to view tasks' });
    const tasks = await Task.find({ group: req.params.groupId })
      .populate('creator', 'name')
      .populate('assignee', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}; 