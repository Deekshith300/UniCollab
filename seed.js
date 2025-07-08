// seed.js
const mongoose = require('mongoose');
const { mockUsers, mockPosts, mockNotes, mockResources, mockGroups, mockTasks } = require('./mockData');
const User = require('./models/User');
const Post = require('./models/Post');
const Note = require('./models/Note');
const StudyResource = require('./models/StudyResource');
const Group = require('./models/Group');
const Task = require('./models/Task');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/schapp';

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Clear existing data
  await User.deleteMany({});
  await Post.deleteMany({});
  await Note.deleteMany({});
  await StudyResource.deleteMany({});
  await Group.deleteMany({});
  await Task.deleteMany({});

  // Insert users and build a username-to-id map
  console.log('About to insert users:', mockUsers);
  mockUsers.forEach((u, i) => {
    if (!u.username) {
      console.error('User at index', i, 'is missing username:', u);
    }
  });

  // Insert users one by one, skipping any invalid user
  const insertedUsers = [];
  for (const user of mockUsers) {
    if (!user.username) {
      console.error('Skipping user with missing username:', user);
      continue;
    }
    try {
      console.log('Inserting user:', user);
      const created = await User.create(user);
      insertedUsers.push(created);
    } catch (err) {
      console.error('Failed to insert user:', user, err);
    }
  }
  console.log('Total users inserted:', insertedUsers.length);

  const userMap = {};
  insertedUsers.forEach(user => {
    userMap[user.username] = user._id;
  });

  // Helper to replace usernames with ObjectIds
  const mapAuthor = (item) => ({
    ...item,
    author: userMap[item.author] || undefined,
    assignee: userMap[item.assignee] || undefined,
    members: item.members ? item.members.map(u => userMap[u]) : undefined
  });

  // Insert posts, notes, resources, groups, tasks with correct ObjectIds
  await Post.insertMany(mockPosts.map(mapAuthor));
  await Note.insertMany(mockNotes.map(mapAuthor));
  await StudyResource.insertMany(mockResources.map(mapAuthor));
  await Group.insertMany(mockGroups.map(g => ({
    ...g,
    creator: userMap[g.creator],
    members: g.members.map(u => ({ user: userMap[u] }))
  })));
  await Task.insertMany(mockTasks.map(mapAuthor));

  console.log('Database seeded with mock data!');
  mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
});