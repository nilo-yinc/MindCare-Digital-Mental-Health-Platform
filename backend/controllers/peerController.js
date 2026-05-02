const PeerGroup = require('../models/PeerGroup');

// Random alias generator
const ALIASES = [
  'Silent Guardian', 'Zen Seeker', 'Midnight Echo', 'Crystal Calm',
  'Lunar Spark', 'Ocean Breeze', 'Mountain Sage', 'Star Walker',
  'Dawn Rider', 'Cloud Nomad', 'Ember Soul', 'Frost Whisper',
  'Horizon Watcher', 'Iron Lotus', 'Jade Phoenix', 'Neon Drift'
];

function generateAlias() {
  return ALIASES[Math.floor(Math.random() * ALIASES.length)] + '-' + Math.floor(Math.random() * 999);
}

// Get all groups
const listGroups = async (req, res) => {
  try {
    const groups = await PeerGroup.find({ isActive: true })
      .select('name mood language members messages createdAt')
      .lean();

    const result = groups.map(g => ({
      _id: g._id,
      name: g.name,
      mood: g.mood,
      language: g.language,
      members: g.members.length,
      lastMessage: g.messages.length > 0 ? g.messages[g.messages.length - 1] : null,
      createdAt: g.createdAt
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to list groups', error: error.message });
  }
};

// Create a group
const createGroup = async (req, res) => {
  try {
    const { name, mood, language } = req.body;
    const userId = req.user._id;
    const alias = generateAlias();

    const group = await PeerGroup.create({
      name,
      mood: mood || 'Calm',
      language: language || 'English',
      createdBy: userId,
      members: [{ user: userId, alias }],
      messages: [{ alias: 'System', content: `Circle "${name}" created. Welcome, ${alias}.` }]
    });

    res.status(201).json({
      _id: group._id,
      name: group.name,
      mood: group.mood,
      language: group.language,
      members: 1,
      userAlias: alias
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
};

// Join a group
const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const group = await PeerGroup.findById(id);

    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if already a member
    const existing = group.members.find(m => m.user?.toString() === userId.toString());
    if (existing) {
      return res.json({ message: 'Already a member', userAlias: existing.alias });
    }

    const alias = generateAlias();
    group.members.push({ user: userId, alias });
    group.messages.push({ alias: 'System', content: `${alias} has joined the circle.` });
    await group.save();

    res.json({ message: 'Joined successfully', userAlias: alias });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join group', error: error.message });
  }
};

// Send message in group
const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const group = await PeerGroup.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const member = group.members.find(m => m.user?.toString() === userId.toString());
    if (!member) return res.status(403).json({ message: 'Not a member of this group' });

    group.messages.push({ alias: member.alias, content });
    await group.save();

    res.json({ alias: member.alias, content, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

// Get messages for a group
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await PeerGroup.findById(id).lean();
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const member = group.members.find(m => m.user?.toString() === userId.toString());
    const userAlias = member?.alias || 'Unknown';

    res.json({
      groupName: group.name,
      userAlias,
      messages: group.messages.slice(-100) // Last 100 messages
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get messages', error: error.message });
  }
};

module.exports = { listGroups, createGroup, joinGroup, sendMessage, getMessages };
