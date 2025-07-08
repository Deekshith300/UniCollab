const Task = require('../models/Task');
const Group = require('../models/Group');
const Post = require('../models/Post');
const Note = require('../models/Note');
const StudyResource = require('../models/StudyResource');

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

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('creator', 'name')
      .populate('assignee', 'name')
      .populate('comments.author', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const group = await Group.findById(task.group);
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to view this task' });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const group = await Group.findById(task.group);
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to update this task' });
    task.status = status;
    await task.save();
    const updatedTask = await Task.findById(task._id)
      .populate('creator', 'name')
      .populate('assignee', 'name');
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateTaskAssignee = async (req, res) => {
  const { assignee } = req.body;
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const group = await Group.findById(task.group);
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to assign this task' });
    task.assignee = assignee;
    await task.save();
    const updatedTask = await Task.findById(task._id)
      .populate('creator', 'name')
      .populate('assignee', 'name');
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.addTaskComment = async (req, res) => {
  const { content } = req.body;
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const group = await Group.findById(task.group);
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to comment on this task' });
    task.comments.push({ author: req.user.id, content });
    await task.save();
    const updatedTask = await Task.findById(task._id)
      .populate('creator', 'name')
      .populate('assignee', 'name')
      .populate('comments.author', 'name');
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const group = await Group.findById(task.group);
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to delete this task' });
    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Individual task management
exports.createTask = async (req, res) => {
  const { title, description, priority, dueDate, tags } = req.body;
  try {
    const task = new Task({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : []),
      creator: req.user.id,
      assignee: req.user.id, // Assign to creator by default
      status: 'pending'
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

exports.getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      $or: [
        { creator: req.user.id },
        { assignee: req.user.id }
      ]
    })
      .populate('creator', 'name')
      .populate('assignee', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateIndividualTaskStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Check if user is creator or assignee
    if (task.creator.toString() !== req.user.id && task.assignee.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own tasks' });
    }
    
    task.status = status;
    await task.save();
    const updatedTask = await Task.findById(task._id)
      .populate('creator', 'name')
      .populate('assignee', 'name');
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteIndividualTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Only creator can delete the task
    if (task.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete tasks you created' });
    }
    
    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  const { range = 'week' } = req.query;
  try {
    const now = new Date();
    let startDate;
    switch (range) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    const userPosts = await Post.find({ author: req.user.id, createdAt: { $gte: startDate } });
    const allPosts = await Post.find({ createdAt: { $gte: startDate } });
    const userNotes = await Note.find({ author: req.user.id, createdAt: { $gte: startDate } });
    const userResources = await StudyResource.find({ author: req.user.id, createdAt: { $gte: startDate } });
    // Mock activity data
    const activity = [
      { label: 'Mon', value: 5 },
      { label: 'Tue', value: 8 },
      { label: 'Wed', value: 3 },
      { label: 'Thu', value: 12 },
      { label: 'Fri', value: 7 },
      { label: 'Sat', value: 15 },
      { label: 'Sun', value: 9 }
    ];
    // Mock engagement data
    const engagement = {
      postsCreated: userPosts.length,
      commentsMade: Math.floor(Math.random() * 20),
      likesGiven: Math.floor(Math.random() * 50),
      notesCreated: userNotes.length,
      resourcesShared: userResources.length,
      messagesSent: Math.floor(Math.random() * 30)
    };
    // Mock performance data
    const performance = {
      mostActiveDay: 'Friday',
      peakActivityTime: '2:00 PM',
      engagementRate: 85.5,
      contentQualityScore: 8.7
    };
    res.json({
      overview: {
        totalPosts: allPosts.length,
        totalLikes: Math.floor(Math.random() * 1000),
        totalComments: Math.floor(Math.random() * 500),
        activeUsers: Math.floor(Math.random() * 100),
        postsChange: { current: userPosts.length, previous: Math.floor(Math.random() * 10) },
        likesChange: { current: Math.floor(Math.random() * 100), previous: Math.floor(Math.random() * 80) },
        commentsChange: { current: Math.floor(Math.random() * 50), previous: Math.floor(Math.random() * 40) },
        usersChange: { current: Math.floor(Math.random() * 100), previous: Math.floor(Math.random() * 90) }
      },
      activity,
      engagement,
      performance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}; 