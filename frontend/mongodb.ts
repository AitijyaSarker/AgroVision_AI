import { apiService } from './apiService';

/** Real MongoDB user ids are 24-char hex strings. */
export function isValidMongoId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(String(id || '').trim());
}

export const dbService = {
  // Initialize database connection (now just sets up API service)
  init: async () => {
    // API service doesn't need initialization
    console.log('API service initialized');
  },

  // User/Profile operations
  createProfile: async (userId: string, name: string, email: string, role: string, password: string) => {
    try {
      const response = await apiService.register({
        name,
        email,
        password,
        role
      });
      return { data: response, error: null };
    } catch (error: any) {
      console.error('Error creating profile:', error);
      return { data: null, error: error.message };
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      return { data: response, error: null };
    } catch (error: any) {
      console.error('Error logging in:', error);
      return { data: null, error: error.message };
    }
  },

  getProfile: async (userId: string) => {
    try {
      const data = await apiService.getUserProfile(userId);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error getting profile:', error);
      return { data: null, error: error.message };
    }
  },

  updateProfile: async (userId: string, updates: any) => {
    try {
      const data = await apiService.updateUserProfile(userId, updates);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { data: null, error: error.message };
    }
  },

  getAllProfiles: async () => {
    try {
      // This endpoint doesn't exist in the API, return empty array for now
      return { data: [], error: null };
    } catch (error: any) {
      console.error('Error getting all profiles:', error);
      return { data: null, error: error.message };
    }
  },

  // Specialists operations — only registered users from MongoDB (no mock fallback)
  getSpecialists: async () => {
    try {
      const data = await apiService.getSpecialists();
      const list = Array.isArray(data) ? data : [];
      const specialists = list
        .map((s: { id?: string; _id?: string }) => ({
          ...s,
          id: String(s.id || s._id || '').trim(),
        }))
        .filter((s: { id: string }) => isValidMongoId(s.id));
      return { data: specialists, error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to load specialists';
      console.error('Error getting specialists:', message);
      return { data: [], error: message };
    }
  },

  // Message operations
  sendMessage: async (messageData: {
    fromUserId: string;
    toUserId: string;
    text: string;
    timestamp: Date;
  }) => {
    try {
      const data = await apiService.sendMessage({
        senderId: messageData.fromUserId,
        receiverId: messageData.toUserId,
        content: messageData.text
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('Error sending message:', error);
      return { data: null, error: error.message };
    }
  },

  getMessages: async (userId: string) => {
    try {
      const data = await apiService.getMessages(userId);
      return { data: data.messages || data, error: null };
    } catch (error: any) {
      console.error('Error getting messages:', error);
      return { data: null, error: error.message };
    }
  },

  getConversations: async (userId: string) => {
    try {
      const data = await apiService.getMessages(userId);
      return { data: data.conversations || [], error: null };
    } catch (error: any) {
      console.error('Error getting conversations:', error);
      return { data: null, error: error.message };
    }
  },

  getConversationMessages: async (conversationId: string, userId: string) => {
    try {
      const raw = await apiService.getConversationMessages(conversationId);
      const messages = (raw || []).map((msg: {
        id: string;
        senderId: string;
        text?: string;
        content?: string;
        timestamp: string | Date;
      }) => ({
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderId === userId ? 'You' : 'User',
        text: msg.text || msg.content || '',
        timestamp: new Date(msg.timestamp),
        isFromFarmer: false,
      }));
      return { data: messages, error: null };
    } catch (error: any) {
      console.error('Error getting conversation messages:', error);
      return { data: null, error: error.message };
    }
  },

  // Scan operations
  saveScan: async (scanData: {
    userId: string;
    cropName: string;
    diseaseName: string;
    confidence: number;
    resultJson: any;
  }) => {
    try {
      const data = await apiService.saveScan({
        userId: scanData.userId,
        imageUrl: scanData.resultJson?.imageUrl || '',
        disease: scanData.diseaseName,
        confidence: scanData.confidence,
        recommendations: scanData.resultJson?.recommendations || []
      });
      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving scan:', error);
      return { data: null, error: error.message };
    }
  },

  getScanHistory: async (userId: string) => {
    try {
      const data = await apiService.getScans(userId);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error getting scan history:', error);
      return { data: null, error: error.message };
    }
  }
};