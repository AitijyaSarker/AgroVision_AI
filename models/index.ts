import mongoose from 'mongoose';


// MongoDB connection URI - supports both local and Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agrovision';

export const connectDB = async () => {
  try {
    // Prevent multiple connections in development
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      // Modern Mongoose options
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'specialist'], required: true },
  avatar: { type: String, default: '' },
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

export const User = mongoose.model('User', userSchema);
export const Message = mongoose.model('Message', messageSchema);
export const Scan = mongoose.model('Scan', scanSchema);