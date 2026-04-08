
export type Language = 'en' | 'bn';
export type UserRole = 'farmer' | 'specialist' | 'guest';

export interface TranslationStrings {
  [key: string]: {
    en: string;
    bn: string;
  };
}

export interface DiseaseDetectionResult {
  cropName: string;
  diseaseName: string;
  confidence: number;
  description: string;
  solution: string[];
  prevention: string[];
}

export interface Specialist {
  id: string;
  name: string;
  institution: string;
  department: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  image: string;
  online: boolean;
  rating?: number;
  specialization?: string;
  experience?: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isFromFarmer: boolean;
  fromUserId?: string;
}

export interface Conversation {
  id: string;
  farmerId?: string;
  farmerName: string;
  farmerImage: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  messages: Message[];
}

export interface DatasetInfo {
  id: string;
  name: string;
  description: string;
  url: string;
}
