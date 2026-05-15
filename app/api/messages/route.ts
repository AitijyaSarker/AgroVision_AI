import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Message } from '@/models';
import { buildConversationId, formatMessage } from '@/lib/messages';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const senderId = String(body.senderId || '').trim();
    const receiverId = String(body.receiverId || '').trim();
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
