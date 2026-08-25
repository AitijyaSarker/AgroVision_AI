// Simple localStorage-based database for testing
// Replace with actual MongoDB later

const STORAGE_KEYS = {
  users: 'agrovision_users',
  messages: 'agrovision_messages',
  scans: 'agrovision_scans'
};

export const dbService = {
  // User/Profile operations
  createProfile: async (userId: string, name: string, email: string, role: string) => {
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
      const newUser = { _id: userId, email, name, role, avatar: '', createdAt: new Date() };
      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
      return { data: newUser, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getProfile: async (userId: string) => {
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
      const user = users.find((u: any) => u._id === userId);
      return { data: user, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateProfile: async (userId: string, updates: any) => {
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
      const index = users.findIndex((u: any) => u._id === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates, updatedAt: new Date() };
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
        return { data: users[index], error: null };
      }
      return { data: null, error: 'User not found' };
    } catch (error) {
      return { data: null, error };
    }
  },

  getSpecialists: async () => {
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
      const specialists = users.filter((u: any) => u.role === 'specialist');
      return { data: specialists, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getAllProfiles: async () => {
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');
      return { data: users, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Message operations
  sendMessage: async (conversationId: string, senderId: string, text: string) => {
    try {
      const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]');
      const newMessage = {
        _id: Date.now().toString(),
        conversationId,
        senderId,
        text,
        createdAt: new Date()
      };
      messages.push(newMessage);
      localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
      return { data: newMessage, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getMessages: async (conversationId: string) => {
    try {
      const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]');
      const filteredMessages = messages.filter((m: any) => m.conversationId === conversationId)
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return { data: filteredMessages, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getConversationsForFarmer: async (farmerId: string) => {
    try {
      const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]');
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');

      // Get all messages where conversation_id starts with farmerId-
      const farmerMessages = messages.filter((m: any) => m.conversationId.startsWith(`${farmerId}-`));

      // Group by conversation_id
      const conversationsMap = new Map();

      for (const msg of farmerMessages) {
        const convId = msg.conversationId;
        if (!conversationsMap.has(convId)) {
          const specialistId = convId.split('-')[1];
          const specialist = users.find((u: any) => u._id === specialistId);

          conversationsMap.set(convId, {
            id: convId,
            farmerName: 'You',
            farmerImage: 'https://picsum.photos/100/100?q=' + farmerId,
            lastMessage: msg.text,
            timestamp: msg.createdAt,
            unreadCount: 0,
            messages: [],
            specialistId: specialistId,
            specialistName: specialist?.name || 'Specialist'
          });
        }
      }

      return { data: Array.from(conversationsMap.values()), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getConversationsForSpecialist: async (specialistId: string) => {
    try {
      const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.messages) || '[]');
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]');

      // Get all messages where conversation_id ends with specialistId
      const specialistMessages = messages.filter((m: any) => m.conversationId.endsWith(`-${specialistId}`));

      // Group by conversation_id
      const conversationsMap = new Map();

      for (const msg of specialistMessages) {
        const convId = msg.conversationId;
        if (!conversationsMap.has(convId)) {
          const farmerId = convId.split('-')[0];
          const farmer = users.find((u: any) => u._id === farmerId);

          conversationsMap.set(convId, {
            id: convId,
            farmerName: farmer?.name || 'Farmer',
            farmerImage: 'https://picsum.photos/100/100?q=' + farmerId,
            lastMessage: msg.text,
            timestamp: msg.createdAt,
            unreadCount: 0,
            messages: [],
            farmerId: farmerId
          });
        }
      }

      return { data: Array.from(conversationsMap.values()), error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Scan operations
  saveScan: async (userId: string, result: any, imageUrl: string) => {
    try {
      const scans = JSON.parse(localStorage.getItem(STORAGE_KEYS.scans) || '[]');
      const newScan = {
        _id: Date.now().toString(),
        userId,
        cropName: result.cropName,
        diseaseName: result.diseaseName,
        confidence: result.confidence,
        resultJson: result,
        imageUrl,
        createdAt: new Date()
      };
      scans.push(newScan);
      localStorage.setItem(STORAGE_KEYS.scans, JSON.stringify(scans));
      return { data: newScan, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getScanHistory: async (userId: string) => {
    try {
      const scans = JSON.parse(localStorage.getItem(STORAGE_KEYS.scans) || '[]');
      const userScans = scans.filter((s: any) => s.userId === userId)
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { data: userScans, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};