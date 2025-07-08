const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const isModerator = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
    return res.status(403).json({ message: 'Moderator access required' });
  }
  next();
};

const isAdminOrModerator = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return res.status(403).json({ message: 'Admin or moderator access required' });
  }
  next();
};

module.exports = { auth, isAdmin, isModerator, isAdminOrModerator };