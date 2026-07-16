export function normalizeUserId(id: unknown): string {
  if (!id) return '';
  if (typeof id === 'object' && id !== null && 'toString' in id) {
    return String((id as { toString(): string }).toString());
  }
  return String(id).trim();
}

export function buildConversationId(userIdA: string, userIdB: string): string {
  return [normalizeUserId(userIdA), normalizeUserId(userIdB)].sort().join('_');
}

/** Other participant when receiverId was not stored (legacy messages). */
export function getOtherUserIdFromConversation(
  conversationId: string,
  userId: string
): string {
  const uid = normalizeUserId(userId);
  const parts = String(conversationId || '')
    .split('_')
    .filter(Boolean);
  return parts.find((p) => p !== uid) || '';
}

export function conversationIdMatchesUser(conversationId: string, userId: string): boolean {
  const uid = normalizeUserId(userId);
  if (!uid || !conversationId) return false;
  const parts = conversationId.split('_');
  return parts.includes(uid);
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

export function formatMessage(doc: {
  _id: { toString(): string };
  conversationId: string;
  senderId: string;
  receiverId?: string;
  text: string;
  read?: boolean;
  createdAt?: Date;
}): MessageRecord {
  const senderId = normalizeUserId(doc.senderId);
  let receiverId = normalizeUserId(doc.receiverId);
  if (!receiverId) {
    receiverId = getOtherUserIdFromConversation(doc.conversationId, senderId);
  }

  return {
    id: doc._id.toString(),
    conversationId: doc.conversationId,
    senderId,
    receiverId,
    content: doc.text,
    text: doc.text,
    timestamp: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    read: Boolean(doc.read),
  };
}
