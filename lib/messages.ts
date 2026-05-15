export function buildConversationId(userIdA: string, userIdB: string): string {
  return [String(userIdA), String(userIdB)].sort().join('_');
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
  receiverId: string;
  text: string;
  read?: boolean;
  createdAt?: Date;
}): MessageRecord {
  return {
    id: doc._id.toString(),
    conversationId: doc.conversationId,
    senderId: String(doc.senderId),
    receiverId: String(doc.receiverId),
    content: doc.text,
    text: doc.text,
    timestamp: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    read: Boolean(doc.read),
  };
}
