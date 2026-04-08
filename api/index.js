import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://mxb-2026-sylhet-neural-nodes-agro-v.vercel.app', 'https://mxb-2026-sylhet-neural-nodes-agro-vision-r3skz53rz.vercel.app', 'https://agrovision-juh5mhvb3-aitijyasarkers-projects.vercel.app', 'https://agrovision-f5rbwngii-aitijyasarkers-projects.vercel.app', process.env.FRONTEND_URL].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3016', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrovision', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['farmer', 'specialist'], default: 'farmer' },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  id: String,
  senderId: String,
  receiverId: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const scanSchema = new mongoose.Schema({
  id: String,
  userId: String,
  imageUrl: String,
  disease: String,
  confidence: Number,
  recommendations: [String],
  timestamp: { type: Date, default: Date.now }
});

const specialistSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  specialization: String,
  experience: Number,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  rating: { type: Number, default: 0 },
  available: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const Scan = mongoose.model('Scan', scanSchema);
const Specialist = mongoose.model('Specialist', specialistSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Routes

// Handle OPTIONS for all routes (CORS preflight)
app.options('*', (req, res) => {
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://mxb-2026-sylhet-neural-nodes-agro-v.vercel.app', 'https://mxb-2026-sylhet-neural-nodes-agro-vision-r3skz53rz.vercel.app', 'https://agrovision-juh5mhvb3-aitijyasarkers-projects.vercel.app', 'https://agrovision-f5rbwngii-aitijyasarkers-projects.vercel.app', process.env.FRONTEND_URL].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:3016', 'http://127.0.0.1:3000'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.status(200).end();
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: role || 'farmer',
      location
    });

    await user.save();
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User routes
app.get('/api/users/profile/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, location: user.location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/profile/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, location: user.location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Specialist routes
app.get('/api/specialists', async (req, res) => {
  try {
    const specialists = await Specialist.find({ available: true });
    res.json(specialists.map(s => ({
      id: s.id,
      name: s.name,
      specialization: s.specialization,
      experience: s.experience,
      location: s.location,
      rating: s.rating
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/specialists/:id', async (req, res) => {
  try {
    const specialist = await Specialist.findOne({ id: req.params.id });
    if (!specialist) return res.status(404).json({ error: 'Specialist not found' });
    res.json({
      id: specialist.id,
      name: specialist.name,
      specialization: specialist.specialization,
      experience: specialist.experience,
      location: specialist.location,
      rating: specialist.rating
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Message routes
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = new Message({
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      timestamp: new Date()
    });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { id: req.params.id },
      { read: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ error: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scan routes
app.get('/api/scans/:userId', authenticateToken, async (req, res) => {
  try {
    const scans = await Scan.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/scans', authenticateToken, async (req, res) => {
  try {
    const { userId, imageUrl, disease, confidence, recommendations } = req.body;
    const scan = new Scan({
      id: Date.now().toString(),
      userId,
      imageUrl,
      disease,
      confidence,
      recommendations,
      timestamp: new Date()
    });
    await scan.save();
    res.json(scan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize default specialists if none exist
const initializeSpecialists = async () => {
  try {
    const count = await Specialist.countDocuments();
    if (count === 0) {
      const defaultSpecialists = [
        {
          id: '1',
          name: 'Dr. Rahman Khan',
          email: 'rahman.khan@agrovision.com',
          specialization: 'Rice Diseases',
          experience: 15,
          location: { lat: 23.8103, lng: 90.4125, address: 'Dhaka, Bangladesh' },
          rating: 4.8,
          available: true
        },
        {
          id: '2',
          name: 'Dr. Fatima Begum',
          email: 'fatima.begum@agrovision.com',
          specialization: 'Vegetable Crops',
          experience: 12,
          location: { lat: 22.8456, lng: 89.5403, address: 'Khulna, Bangladesh' },
          rating: 4.9,
          available: true
        },
        {
          id: '3',
          name: 'Dr. Ahmed Hossain',
          email: 'ahmed.hossain@agrovision.com',
          specialization: 'Fruit Trees',
          experience: 18,
          location: { lat: 24.3636, lng: 88.6241, address: 'Rajshahi, Bangladesh' },
          rating: 4.7,
          available: true
        }
      ];

      await Specialist.insertMany(defaultSpecialists);
      console.log('Default specialists initialized');
    }
  } catch (err) {
    console.error('Error initializing specialists:', err);
  }
};

initializeSpecialists();

export default app;
