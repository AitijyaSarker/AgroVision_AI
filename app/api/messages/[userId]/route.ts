import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Message, User } from '@/models';
import { formatMessage } from '@/lib/messages';

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json({ error: 'User id required' }, { status: 400 });
    }

    const docs = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: 1 })
      .lean();

    const messages = docs.map((doc) =>
      formatMessage(doc as Parameters<typeof formatMessage>[0])
    );

    const otherUserIds = new Set<string>();
    const conversationMap = new Map<
      string,
      {
        id: string;
        farmerId: string;
        specialistId: string;
        otherUserId: string;
        lastMessage: string;
        timestamp: Date;
        unreadCount: number;
        messages: ReturnType<typeof formatMessage>[];
      }
    >();

    for (const msg of messages) {
      const otherUserId =
        msg.senderId === userId ? msg.receiverId : msg.senderId;
      otherUserIds.add(otherUserId);

      const existing = conversationMap.get(msg.conversationId);
      if (!existing) {
        conversationMap.set(msg.conversationId, {
          id: msg.conversationId,
          farmerId: userId,
          specialistId: otherUserId,
          otherUserId,
          lastMessage: msg.text,
          timestamp: msg.timestamp,
          unreadCount: !msg.read && msg.senderId !== userId ? 1 : 0,
          messages: [msg],
        });
      } else {
        existing.messages.push(msg);
        existing.lastMessage = msg.text;
        existing.timestamp = msg.timestamp;
        if (!msg.read && msg.senderId !== userId) {
          existing.unreadCount += 1;
        }
      }
    }

    const users = await User.find({
      _id: { $in: Array.from(otherUserIds) },
    }).lean();

    type UserSummary = { name: string; role: string; avatar: string };
    const userById = new Map<string, UserSummary>(
      users.map((u) => [
        String(u._id),
        {
          name: String(u.name),
          role: String(u.role),
          avatar: String(u.avatar || ''),
        },
      ])
    );

    const currentUser = await User.findById(userId).select('role').lean();
    const currentRole = (currentUser?.role as string) || 'farmer';

    const conversations = Array.from(conversationMap.values())
      .map((conv) => {
        const other = userById.get(conv.otherUserId);
        const displayName = other?.name || 'User';
        const displayImage =
          other?.avatar ||
          `https://picsum.photos/100/100?q=${conv.otherUserId}`;

        const farmerId =
          currentRole === 'farmer' ? userId : conv.otherUserId;
        const specialistId =
          currentRole === 'specialist' ? userId : conv.otherUserId;

        return {
          ...conv,
          farmerId,
          specialistId,
          farmerName: currentRole === 'specialist' ? displayName : displayName,
          farmerImage: displayImage,
          otherUserName: displayName,
          otherUserImage: displayImage,
          messages: conv.messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderId === userId ? 'You' : displayName,
            text: m.text,
            timestamp: m.timestamp,
            isFromFarmer: m.senderId === farmerId,
          })),
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return NextResponse.json({ messages, conversations });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}
