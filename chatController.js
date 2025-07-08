const Chat = require('../models/Chat');
const Group = require('../models/Group');

exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
    .populate('participants', 'name')
    .populate('group', 'name')
    .populate('messages.sender', 'name')
    .populate('lastMessage.sender', 'name')
    .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'name')
      .populate('group', 'name')
      .populate('messages.sender', 'name')
      .populate('messages.readBy.user', 'name');
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const isParticipant = chat.participants.some(p => p._id.toString() === req.user.id);
    if (!isParticipant) return res.status(403).json({ message: 'Access denied' });
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.createOrGetPrivateChat = async (req, res) => {
  const { participantId } = req.body;
  try {
    let chat = await Chat.findOne({
      type: 'private',
      participants: { $all: [req.user.id, participantId] }
    }).populate('participants', 'name');
    if (!chat) {
      chat = new Chat({
        type: 'private',
        participants: [req.user.id, participantId]
      });
      await chat.save();
      chat = await chat.populate('participants', 'name');
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.createGroupChat = async (req, res) => {
  const { groupId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const isMember = group.members.some(member => member.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: 'You must be a member to access group chat' });
    let chat = await Chat.findOne({
      type: 'group',
      group: groupId
    }).populate('participants', 'name').populate('group', 'name');
    if (!chat) {
      chat = new Chat({
        type: 'group',
        participants: group.members.map(m => m.user),
        group: groupId
      });
      await chat.save();
      chat = await chat.populate('participants', 'name').populate('group', 'name');
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { content, messageType = 'text', fileUrl = null, fileName = null } = req.body;
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const isParticipant = chat.participants.some(p => p.toString() === req.user.id);
    if (!isParticipant) return res.status(403).json({ message: 'Access denied' });
    await chat.addMessage(req.user.id, content, messageType, fileUrl, fileName);
    const updatedChat = await Chat.findById(chat._id)
      .populate('participants', 'name')
      .populate('group', 'name')
      .populate('messages.sender', 'name');
    res.json(updatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.markMessagesRead = async (req, res) => {
  const { messageIds } = req.body;
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const isParticipant = chat.participants.some(p => p.toString() === req.user.id);
    if (!isParticipant) return res.status(403).json({ message: 'Access denied' });
    messageIds.forEach(messageId => {
      chat.markAsRead(req.user.id, messageId);
    });
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}; 