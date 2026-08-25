import mongoose from 'mongoose';

// Set MONGODB_URI in .env.local (MongoDB Atlas connection string)
const MONGODB_URI = process.env.MONGODB_URI?.trim() || '';

let isConnected = false;

export const connectDB = async () => {
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Add your MongoDB Atlas connection string to .env.local and restart the dev server.'
    );
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
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
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