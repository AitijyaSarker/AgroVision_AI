import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB, Message, User } from '@/models';
import { buildConversationId, formatMessage, normalizeUserId } from '@/lib/messages';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const senderId = normalizeUserId(body.senderId);
    const receiverId = normalizeUserId(body.receiverId);
    const text = String(body.content || body.text || '').trim();

    if (!senderId || !receiverId || !text) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and content are required' },
        { status: 400 }
      );
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        { error: 'Cannot message yourself' },
        { status: 400 }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return NextResponse.json(
        { error: 'Invalid sender or receiver id' },
        { status: 400 }
      );
    }

    const [sender, receiver] = await Promise.all([
      User.findById(senderId).select('role name').lean(),
      User.findById(receiverId).select('role name').lean(),
    ]);

    if (!sender || !receiver) {
      return NextResponse.json(
        { error: 'Sender or receiver not found' },
        { status: 404 }
      );
    }

    const message = await Message.create({
      conversationId: buildConversationId(senderId, receiverId),
      senderId,
      receiverId,
      text,
      read: false,
    });

    return NextResponse.json(formatMessage(message), { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
