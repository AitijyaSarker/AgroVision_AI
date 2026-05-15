export interface User {
  id: string
  email?: string
  phone?: string
  role: 'farmer' | 'specialist'
  name?: string
}

export interface DetectionResult {
  crop: string
  disease: string
  confidence: number
  solution: string
}

export interface FarmerRequest {
  id: string
  farmer_id: string
  farmer_name: string
  message: string
  crop_issue: string
  location: string
  status: 'pending' | 'accepted' | 'resolved' | 'ignored'
  specialist_id?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
}

export interface Office {
  id: string
  name: string
  nameBn: string
  lat: number
  lng: number
  address: string
  addressBn: string
  phone: string
}


