require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Group = require('./models/Group');
const GroupPost = require('./models/GroupPost');
const GroupMessage = require('./models/GroupMessage');
const Note = require('./models/Note');
const StudyResource = require('./models/StudyResource');
const Chat = require('./models/Chat');
const Task = require('./models/Task');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Clear existing data
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await Group.deleteMany({});
  await GroupPost.deleteMany({});
  await GroupMessage.deleteMany({});
  await Note.deleteMany({});
  await StudyResource.deleteMany({});
  await Chat.deleteMany({});
  await Task.deleteMany({});

  // Create users
  const password = await bcrypt.hash('password123', 10);
  const user1 = await User.create({ name: 'Alice', username: 'alicej', email: 'alice@example.com', password });
  const user2 = await User.create({ name: 'Bob', username: 'bobsmith', email: 'bob@example.com', password });
  const user3 = await User.create({ name: 'Charlie', username: 'charliec', email: 'charlie@example.com', password });

  // Create posts
  const post1 = await Post.create({ title: 'Welcome Post', content: 'Hello, this is the first post!', author: user1._id });
  const post2 = await Post.create({ title: 'Second Post', content: 'Another post for testing.', author: user2._id });

  // Create comments
  await Comment.create({ content: 'Nice post!', author: user2._id, post: post1._id });
  await Comment.create({ content: 'Thank you!', author: user1._id, post: post1._id });

  // Create groups
  const group1 = await Group.create({
    name: 'React Study Group',
    description: 'A group for learning React together.',
    creator: user1._id,
    category: 'Study Group',
    tags: ['react', 'frontend'],
    isPrivate: false
  });
  const group2 = await Group.create({
    name: 'Project Team Alpha',
    description: 'Team for the Alpha project.',
    creator: user2._id,
    category: 'Project Team',
    tags: ['project', 'team'],
    isPrivate: false
  });
  const group3 = await Group.create({
    name: 'AI & Data Science Club',
    description: 'Exploring AI, ML, and data science together.',
    creator: user3._id,
    category: 'Research',
    tags: ['ai', 'ml', 'data'],
    isPrivate: false
  });
  const group4 = await Group.create({
    name: 'Competitive Coding',
    description: 'Sharpen your coding skills with contests and practice.',
    creator: user1._id,
    category: 'Study Group',
    tags: ['coding', 'contests'],
    isPrivate: false
  });
  const group5 = await Group.create({
    name: 'Book Lovers',
    description: 'A social group for book discussions and recommendations.',
    creator: user2._id,
    category: 'Social',
    tags: ['books', 'reading', 'social'],
    isPrivate: false
  });

  // Create group posts
  await GroupPost.create({
    title: 'React Hooks Discussion',
    content: "Let's discuss useEffect and useState!",
    author: user1._id,
    group: group1._id,
    tags: ['hooks', 'discussion']
  });
  await GroupPost.create({
    title: 'Alpha Project Kickoff',
    content: 'Kickoff meeting at 5pm.',
    author: user2._id,
    group: group2._id,
    tags: ['kickoff']
  });

  // Create group messages
  await GroupMessage.create({
    group: group1._id,
    author: user2._id,
    content: 'Hi everyone! Ready to learn React?'
  });
  await GroupMessage.create({
    group: group2._id,
    author: user3._id,
    content: 'Looking forward to working on Alpha!'
  });

  // Create notes
  await Note.create({
    title: 'React Basics',
    content: 'JSX, components, props, and state.',
    author: user1._id,
    category: 'Lecture Notes',
    subject: 'React',
    tags: ['react', 'basics'],
    isPublic: true
  });
  await Note.create({
    title: 'Project Alpha Plan',
    content: 'Project milestones and deliverables.',
    author: user2._id,
    category: 'Study Guide',
    subject: 'Project Management',
    tags: ['project', 'plan'],
    isPublic: true
  });
  await Note.create({
    title: 'Data Structures Overview',
    content: 'Arrays, Linked Lists, Trees, Graphs.',
    author: user3._id,
    category: 'Lecture Notes',
    subject: 'Data Structures',
    tags: ['data structures', 'overview'],
    isPublic: true
  });
  await Note.create({
    title: 'Machine Learning Intro',
    content: 'Supervised vs Unsupervised, Regression, Classification.',
    author: user1._id,
    category: 'Lecture Notes',
    subject: 'Machine Learning',
    tags: ['ml', 'intro'],
    isPublic: true
  });
  await Note.create({
    title: 'Operating Systems Summary',
    content: 'Processes, threads, scheduling, memory management.',
    author: user2._id,
    category: 'Lecture Notes',
    subject: 'Operating Systems',
    tags: ['os', 'summary'],
    isPublic: true
  });
  await Note.create({
    title: 'DBMS Cheat Sheet',
    content: 'ER diagrams, normalization, SQL basics.',
    author: user3._id,
    category: 'Study Guide',
    subject: 'DBMS',
    tags: ['dbms', 'cheatsheet'],
    isPublic: true
  });
  await Note.create({
    title: 'JavaScript Tips',
    content: 'Closures, async/await, ES6 features.',
    author: user1._id,
    category: 'Lecture Notes',
    subject: 'JavaScript',
    tags: ['js', 'tips'],
    isPublic: true
  });
  await Note.create({
    title: 'Python for Data Science',
    content: 'Numpy, Pandas, Matplotlib basics.',
    author: user2._id,
    category: 'Lecture Notes',
    subject: 'Python',
    tags: ['python', 'data science'],
    isPublic: true
  });
  await Note.create({
    title: 'Networks Quick Review',
    content: 'OSI model, TCP/IP, protocols.',
    author: user3._id,
    category: 'Lecture Notes',
    subject: 'Computer Networks',
    tags: ['networks', 'review'],
    isPublic: true
  });
  await Note.create({
    title: 'Cloud Computing Basics',
    content: 'IaaS, PaaS, SaaS, cloud providers.',
    author: user1._id,
    category: 'Lecture Notes',
    subject: 'Cloud Computing',
    tags: ['cloud', 'basics'],
    isPublic: true
  });
  await Note.create({
    title: 'Software Engineering Principles',
    content: 'SDLC, Agile, testing, version control.',
    author: user2._id,
    category: 'Study Guide',
    subject: 'Software Engineering',
    tags: ['se', 'principles'],
    isPublic: true
  });

  // Create study resources
  await StudyResource.create({
    title: 'React Official Docs',
    description: 'The official React documentation.',
    type: 'Link',
    url: 'https://reactjs.org',
    author: user1._id,
    subject: 'React',
    tags: ['docs', 'react'],
    difficulty: 'Beginner',
    isPublic: true
  });
  await StudyResource.create({
    title: 'Project Management Book',
    description: 'A book on project management best practices.',
    type: 'Book',
    author: user2._id,
    subject: 'Project Management',
    tags: ['book', 'project'],
    difficulty: 'Intermediate',
    isPublic: true
  });

  // Create chats and messages
  const chat1 = await Chat.create({
    type: 'private',
    participants: [user1._id, user2._id],
    messages: [
      {
        sender: user1._id,
        content: 'Hey Bob, are you joining the React group?',
        messageType: 'text',
        timestamp: new Date()
      },
      {
        sender: user2._id,
        content: 'Yes! I just joined.',
        messageType: 'text',
        timestamp: new Date()
      }
    ]
  });
  const chat2 = await Chat.create({
    type: 'group',
    participants: [user1._id, user2._id, user3._id],
    group: group1._id,
    messages: [
      {
        sender: user3._id,
        content: 'Hello everyone!',
        messageType: 'text',
        timestamp: new Date()
      }
    ]
  });

  // Create tasks (analytics)
  await Task.create({
    title: 'Prepare React Slides',
    description: 'Create slides for the next React session.',
    status: 'in-progress',
    priority: 'high',
    assignee: user1._id,
    creator: user2._id,
    group: group1._id,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    tags: ['slides', 'react']
  });
  await Task.create({
    title: 'Alpha Project Report',
    description: 'Draft the initial report for Alpha project.',
    status: 'pending',
    priority: 'medium',
    assignee: user3._id,
    creator: user2._id,
    group: group2._id,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    tags: ['report', 'alpha']
  });

  console.log('Demo data for all features inserted!');
  process.exit();
}

// Clean and validate mock users
const rawMockUsers = [
  { name: 'Alice Johnson', username: 'alicej', email: 'alice@example.com', password: 'password123', role: 'user', department: 'CSE', year: '2', skills: ['React', 'Node.js'], bio: 'Aspiring web developer.' },
  { name: 'Bob Smith', username: 'bobsmith', email: 'bob@example.com', password: 'password123', role: 'moderator', department: 'ECE', year: '3', skills: ['Python', 'ML'], bio: 'Machine learning enthusiast.' },
  { name: 'Carol Lee', username: 'carollee', email: 'carol@example.com', password: 'password123', role: 'admin', department: 'IT', year: '4', skills: ['Java', 'Spring'], bio: 'Backend specialist.' },
];

// Filter out any invalid users (missing username, email, or password)
const mockUsers = rawMockUsers.filter(u => u.username && u.email && u.password);

// Only use usernames that exist in mockUsers for other mock data
const validUsernames = mockUsers.map(u => u.username);

const mockPosts = [
  { title: 'How to ace coding interviews', content: 'Practice DSA and system design regularly.', author: 'alicej', tags: ['interview', 'coding'], createdAt: new Date() },
  { title: 'Best resources for React', content: 'Check out the official docs and freeCodeCamp.', author: 'bobsmith', tags: ['react', 'resources'], createdAt: new Date() },
].filter(p => validUsernames.includes(p.author));

const mockNotes = [
  { title: 'DBMS Summary', content: 'ER diagrams, normalization, SQL basics.', author: 'carollee', tags: ['dbms', 'summary'], createdAt: new Date() },
  { title: 'OS Cheat Sheet', content: 'Processes, threads, scheduling.', author: 'alicej', tags: ['os', 'cheatsheet'], createdAt: new Date() },
].filter(n => validUsernames.includes(n.author));

const mockResources = [
  { title: 'React Roadmap PDF', description: 'A complete roadmap for learning React.', author: 'bobsmith', type: 'Document', url: 'https://example.com/react-roadmap.pdf', tags: ['react', 'pdf'], createdAt: new Date() },
  { title: 'ML Slides', description: 'Intro to Machine Learning slides.', author: 'carollee', type: 'Document', url: 'https://example.com/ml-slides.ppt', tags: ['ml', 'slides'], createdAt: new Date() },
].filter(r => validUsernames.includes(r.author));

const mockGroups = [
  {
    name: 'Web Dev Enthusiasts',
    description: 'A group for web dev lovers.',
    creator: 'alicej',
    category: 'Study Group',
    isPrivate: false,
    tags: ['web', 'dev'],
    members: ['alicej', 'bobsmith']
  },
  {
    name: 'ML Study Circle',
    description: 'Discuss and learn ML together.',
    creator: 'carollee',
    category: 'Project Team',
    isPrivate: false,
    tags: ['ml'],
    members: ['carollee', 'bobsmith']
  }
].filter(g => validUsernames.includes(g.creator) && g.members.every(m => validUsernames.includes(m)));

const mockTasks = [
  { title: 'Finish React project', status: 'in-progress', assignee: 'alicej', dueDate: new Date(Date.now() + 3*24*60*60*1000) },
  { title: 'Prepare ML presentation', status: 'pending', assignee: 'bobsmith', dueDate: new Date(Date.now() + 5*24*60*60*1000) },
].filter(t => validUsernames.includes(t.assignee));

console.log('mockUsers:', mockUsers);

module.exports = { mockUsers, mockPosts, mockNotes, mockResources, mockGroups, mockTasks };

seed();