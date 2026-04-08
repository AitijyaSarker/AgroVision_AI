import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// MongoDB connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrovision');
};

// User interface
interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'farmer' | 'specialist';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
}

// User schema
const userSchema = new mongoose.Schema<IUser>({
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

const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password, role, location } = await request.json();

    const existingUser = await (User as any).findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

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
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key'
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}