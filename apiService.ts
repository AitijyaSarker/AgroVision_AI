// API service for both local development and Vercel deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    // For Vercel deployment, use relative URLs (API routes are on the same domain)
    // For local development, use the full URL if NEXT_PUBLIC_API_URL is set
    const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async register(userData: { name: string; email: string; password: string; role?: string; location?: any }) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // User methods
  async getUserProfile(userId: string) {
    return this.request(`/api/users/profile/${userId}`);
  }

  async updateUserProfile(userId: string, data: any) {
    return this.request(`/api/users/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Specialist methods
  async getSpecialists() {
    return this.request('/api/specialists');
  }

  async getSpecialist(id: string) {
    return this.request(`/api/specialists/${id}`);
  }

  // Message methods
  async getMessages(userId: string) {
    return this.request(`/api/messages/${userId}`);
  }

  async sendMessage(message: { senderId: string; receiverId: string; content: string }) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/api/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Scan methods
  async getScans(userId: string) {
    return this.request(`/api/scans/${userId}`);
  }

  async saveScan(scan: { userId: string; imageUrl: string; disease: string; confidence: number; recommendations: string[] }) {
    return this.request('/api/scans', {
      method: 'POST',
      body: JSON.stringify(scan),
    });
  }
}

export const apiService = new ApiService();