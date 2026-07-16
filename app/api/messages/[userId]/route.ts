import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB, Message, User } from '@/models';
import {
  conversationIdMatchesUser,
  formatMessage,
  getOtherUserIdFromConversation,
  normalizeUserId,
} from '@/lib/messages';

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { userId: rawUserId } = await context.params;
    const userId = normalizeUserId(rawUserId);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    // Include legacy messages that only have conversationId + senderId (no receiverId)
    const docs = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId },
        {
          conversationId: {
            $regex: new RegExp(`(^|_)${userId}(_|$)`),
          },
        },
      ],
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
        normalizeUserId(msg.senderId) === userId
          ? normalizeUserId(msg.receiverId) ||
            getOtherUserIdFromConversation(msg.conversationId, userId)
          : normalizeUserId(msg.senderId);

      if (!otherUserId) continue;

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
          unreadCount: !msg.read && normalizeUserId(msg.senderId) !== userId ? 1 : 0,
          messages: [msg],
        });
      } else {
        existing.messages.push(msg);
        existing.lastMessage = msg.text;
        existing.timestamp = msg.timestamp;
        if (!msg.read && normalizeUserId(msg.senderId) !== userId) {
          existing.unreadCount += 1;
        }
      }
    }

    const validOtherIds = Array.from(otherUserIds).filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const users = await User.find({
      _id: { $in: validOtherIds },
    }).lean();

    type UserSummary = { name: string; role: string; avatar: string };
    const userById = new Map<string, UserSummary>(
      users.map((u) => [
        normalizeUserId(u._id),
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
      .filter((conv) => conversationIdMatchesUser(conv.id, userId))
      .map((conv) => {
        const other = userById.get(conv.otherUserId);
        const displayName = other?.name || (currentRole === 'specialist' ? 'Farmer' : 'User');
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
          farmerName: displayName,
          farmerImage: displayImage,
          otherUserName: displayName,
          otherUserImage: displayImage,
          messages: conv.messages.map((m) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: normalizeUserId(m.senderId) === userId ? 'You' : displayName,
            text: m.text,
            timestamp: m.timestamp,
            isFromFarmer: normalizeUserId(m.senderId) === farmerId,
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
