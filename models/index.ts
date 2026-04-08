import mongoose from 'mongoose';

// CRITICAL: For Vercel, MONGODB_URI is required. For local dev, use fallback.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrovision';

let isConnected = false;

export const connectDB = async () => {
  // Check on Vercel only
  const isVercel = !!process.env.VERCEL_URL;
  if (isVercel && !process.env.MONGODB_URI) {
    throw new Error('🔴 CRITICAL: MONGODB_URI environment variable is not defined on Vercel. Check Vercel environment variables.');
  }

  // Prevent multiple connections
  if (isConnected && mongoose.connection.readyState >= 1) {
    console.log('ℹ️ Using existing MongoDB connection');
    return;
  }

  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📍 MONGODB_URI exists:', !!MONGODB_URI);
    
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB connected successfully');
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error?.message || error);
    isConnected = false;
    throw new Error(`MongoDB connection failed: ${error?.message || 'Unknown error'}`);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'specialist'], default: 'farmer' },
  avatar: { type: String, default: '' },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Message Schema
const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Scan Schema
const scanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cropName: String,
  diseaseName: String,
  confidence: Number,
  resultJson: mongoose.Schema.Types.Mixed,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

// Prevent model redefinition in development
export const User = (mongoose.models.User || mongoose.model('User', userSchema)) as any;
export const Message = (mongoose.models.Message || mongoose.model('Message', messageSchema)) as any;
export const Scan = (mongoose.models.Scan || mongoose.model('Scan', scanSchema)) as any;