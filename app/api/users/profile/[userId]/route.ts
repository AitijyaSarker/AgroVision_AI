import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { connectDB, User } from '@/models';

type RouteContext = { params: Promise<{ userId: string }> };

function getTokenUserId(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(
      auth.slice(7),
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { id?: string };
    return decoded.id ? String(decoded.id) : null;
  } catch {
    return null;
  }
}

function formatUser(user: {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  location?: { lat?: number; lng?: number; address?: string };
  createdAt?: Date;
}) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    location: user.location || null,
    createdAt: user.createdAt,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { userId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const tokenUserId = getTokenUserId(request);
    if (tokenUserId && tokenUserId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(formatUser(user as Parameters<typeof formatUser>[0]));
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

const MAX_AVATAR_LENGTH = 600_000;

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const { userId } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const tokenUserId = getTokenUserId(request);
    if (!tokenUserId || tokenUserId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.name === 'string') {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
      updates.name = name;
    }

    if (typeof body.avatar === 'string') {
      const avatar = body.avatar.trim();
      if (avatar && avatar.length > MAX_AVATAR_LENGTH) {
        return NextResponse.json(
          { error: 'Image is too large. Use a smaller photo.' },
          { status: 400 }
        );
      }
      updates.avatar = avatar;
    }

    if (body.location && typeof body.location === 'object') {
      updates.location = body.location;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(formatUser(user as Parameters<typeof formatUser>[0]));
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
