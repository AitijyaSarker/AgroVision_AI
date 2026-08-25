import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'https://agro-vision-ai-crop-disease-detection.vercel.app'
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3016', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-memory storage for development (replace with MongoDB later)
let users = [];
let messages = [];
let scans = [];
let specialists = [
  {
    id: 'specialist1',
    name: 'Dr. Mohammad Rahman',
    email: 'rahman@bau.edu.bd',
    institution: 'Bangladesh Agricultural University',
    department: 'Plant Pathology',
    image: 'https://picsum.photos/100/100?person=1',
    online: true,
    location: { lat: 24.7471, lng: 90.4203, address: 'Mymensingh' },
    rating: 4.8,
    available: true
  },
  {
    id: 'specialist2',
    name: 'Dr. Fatima Begum',
    email: 'fatima@brri.gov.bd',
    institution: 'Bangladesh Rice Research Institute',
    department: 'Agronomy',
    image: 'https://picsum.photos/100/100?person=2',
    online: false,
    location: { lat: 23.9920, lng: 90.4125, address: 'Gazipur' },
    rating: 4.6,
    available: true
  },
  {
    id: 'specialist3',
    name: 'Dr. Abdul Karim',
    email: 'karim@srdi.gov.bd',
    institution: 'Soil Resource Development Institute',
    department: 'Soil Science',
    image: 'https://picsum.photos/100/100?person=3',
    online: true,
    location: { lat: 23.8103, lng: 90.4125, address: 'Dhaka' },
    rating: 4.9,
    available: true
  },
  {
    id: 'specialist4',
    name: 'Dr. Nasrin Akter',
    email: 'nasrin@horticulture.gov.bd',
    institution: 'Horticulture Research Center',
    department: 'Horticulture',
    image: 'https://picsum.photos/100/100?person=4',
    online: true,
    location: { lat: 23.9920, lng: 90.4125, address: 'Joydebpur' },
    rating: 4.7,
    available: true
  }
];

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

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'AgroVision API Server',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      users: {
        profile: 'GET /api/users/profile/:id',
        updateProfile: 'PUT /api/users/profile/:id'
      },
      specialists: {
        list: 'GET /api/specialists',
        get: 'GET /api/specialists/:id'
      },
      messages: {
        getUserMessages: 'GET /api/messages/:userId',
        sendMessage: 'POST /api/messages',
        markAsRead: 'PUT /api/messages/:id/read'
      },
      scans: {
        getUserScans: 'GET /api/scans/:userId',
        createScan: 'POST /api/scans'
      }
    }
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, location } = req.body;

    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: role || 'farmer',
      location,
      createdAt: new Date()
    };

    users.push(user);
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
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
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, location: user.location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/profile/:id', authenticateToken, async (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    users[userIndex] = { ...users[userIndex], ...req.body };
    const user = users[userIndex];
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, location: user.location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Specialist routes
app.get('/api/specialists', async (req, res) => {
  try {
    const availableSpecialists = specialists.filter(s => s.available);
    res.json(availableSpecialists.map(s => ({
      id: s.id,
      name: s.name,
      institution: s.institution,
      department: s.department,
      image: s.image,
      online: s.online,
      location: s.location,
      rating: s.rating
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/specialists/:id', async (req, res) => {
  try {
    const specialist = specialists.find(s => s.id === req.params.id);
    if (!specialist) return res.status(404).json({ error: 'Specialist not found' });
    res.json({
      id: specialist.id,
      name: specialist.name,
      institution: specialist.institution,
      department: specialist.department,
      image: specialist.image,
      online: specialist.online,
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
    const userMessages = messages.filter(m =>
      m.senderId === req.params.userId || m.receiverId === req.params.userId
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    res.json(userMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;
    const message = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
      read: false
    };
    messages.push(message);
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
  try {
    const messageIndex = messages.findIndex(m => m.id === req.params.id);
    if (messageIndex === -1) return res.status(404).json({ error: 'Message not found' });

    messages[messageIndex].read = true;
    res.json(messages[messageIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scan routes
app.get('/api/scans/:userId', authenticateToken, async (req, res) => {
  try {
    const userScans = scans.filter(s => s.userId === req.params.userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(userScans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/scans', authenticateToken, async (req, res) => {
  try {
    const { userId, imageUrl, disease, confidence, recommendations } = req.body;
    const scan = {
      id: Date.now().toString(),
      userId,
      imageUrl,
      disease,
      confidence,
      recommendations,
      timestamp: new Date()
    };
    scans.push(scan);
    res.json(scan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});