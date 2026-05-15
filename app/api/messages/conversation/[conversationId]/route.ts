import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Message } from '@/models';
import { formatMessage } from '@/lib/messages';

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { conversationId } = await context.params;
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation id required' }, { status: 400 });
    }

    const docs = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    const messages = docs.map((doc) =>
      formatMessage(doc as Parameters<typeof formatMessage>[0])
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json({ error: 'Failed to load conversation' }, { status: 500 });
  }
}
