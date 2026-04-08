import { apiService } from './apiService';

// Mock specialists data (fallback when API is not available)
const mockSpecialists = [
  {
    id: 'specialist1',
    name: 'Dr. Mohammad Rahman',
    institution: 'Bangladesh Agricultural University',
    department: 'Plant Pathology',
    location: 'Mymensingh',
    image: 'https://picsum.photos/100/100?q=specialist1',
    online: true
  },
  {
    id: 'specialist2',
    name: 'Dr. Fatima Begum',
    institution: 'Bangladesh Rice Research Institute',
    department: 'Agronomy',
    location: 'Gazipur',
    image: 'https://picsum.photos/100/100?q=specialist2',
    online: false
  },
  {
    id: 'specialist3',
    name: 'Dr. Abdul Karim',
    institution: 'Soil Resource Development Institute',
    department: 'Soil Science',
    location: 'Dhaka',
    image: 'https://picsum.photos/100/100?q=specialist3',
    online: true
  },
  {
    id: 'specialist4',
    name: 'Dr. Nasrin Akter',
    institution: 'Horticulture Research Center',
    department: 'Horticulture',
    location: 'Joydebpur',
    image: 'https://picsum.photos/100/100?q=specialist4',
    online: true
  }
];

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

  // Specialists operations
  getSpecialists: async () => {
    try {
      const data = await apiService.getSpecialists();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error getting specialists, using mock data:', error);
      // Fallback to mock data if API is not available
      const specialists = mockSpecialists.map(spec => ({
        ...spec,
        _id: spec.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      return { data: specialists, error: null };
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
      return { data, error: null };
    } catch (error: any) {
      console.error('Error getting messages:', error);
      return { data: null, error: error.message };
    }
  },

  getConversations: async (userId: string) => {
    try {
      const messages = await apiService.getMessages(userId);

      // Group messages by conversation
      const conversationsMap = new Map();

      for (const message of messages) {
        const conversationId = [message.senderId, message.receiverId].sort().join('-');
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;

        if (!conversationsMap.has(conversationId)) {
          conversationsMap.set(conversationId, {
            id: conversationId,
            farmerId: message.senderId === userId ? userId : otherUserId,
            specialistId: message.senderId === userId ? otherUserId : userId,
            lastMessage: message.content,
            timestamp: message.timestamp,
            unreadCount: !message.read && message.senderId !== userId ? 1 : 0,
            messages: []
          });
        }

        conversationsMap.get(conversationId).messages.push({
          id: message.id,
          senderId: message.senderId,
          text: message.content,
          timestamp: message.timestamp,
          isFromFarmer: message.senderId !== userId
        });
      }

      const conversations = Array.from(conversationsMap.values());
      return { data: conversations, error: null };
    } catch (error: any) {
      console.error('Error getting conversations:', error);
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