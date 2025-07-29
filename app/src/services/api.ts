import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds timeout for ML processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API response types
export interface ScanResponse {
  name: string;
  set: string;
  rarity: string;
  confidence: number;
  image_url?: string;
}

export interface Card {
  id: string;
  name: string;
  set: string;
  number: string;
  rarity: string;
  type: string;
  hp: string;
  image: string;
  estimatedValue: number;
  dateAdded: string;
  condition?: string;
  notes?: string;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  totalCards: number;
  uniqueCards: number;
  sets: number;
  streak: number;
  totalValue: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

// API service functions
export const apiService = {
  // Card scanning
  async scanCard(file: File): Promise<ScanResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ScanResponse>('/api/v1/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Analytics
  async getScanStats(days: number = 30): Promise<any> {
    const response = await api.get(`/api/v1/analytics/stats?days=${days}`);
    return response.data;
  },

  async getConfidenceDistribution(): Promise<any> {
    const response = await api.get('/api/v1/analytics/confidence-distribution');
    return response.data;
  },

  async getModelPerformance(): Promise<any> {
    const response = await api.get('/api/v1/analytics/model-performance');
    return response.data;
  },

  async getErrorAnalysis(): Promise<any> {
    const response = await api.get('/api/v1/analytics/error-analysis');
    return response.data;
  },

  async getScanHistory(page: number = 1, limit: number = 50): Promise<any> {
    const response = await api.get(`/api/v1/analytics/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getRealtimeStats(): Promise<any> {
    const response = await api.get('/api/v1/analytics/realtime');
    return response.data;
  },

  async getScanLeaderboard(days: number = 7): Promise<any> {
    const response = await api.get(`/api/v1/analytics/leaderboard?days=${days}`);
    return response.data;
  },

  // Card management
  async getCards(): Promise<Card[]> {
    const response = await api.get<Card[]>('/api/v1/collection');
    return response.data;
  },

  async getCard(cardId: string): Promise<Card> {
    const response = await api.get<Card>(`/api/v1/collection/${cardId}`);
    return response.data;
  },

  async addCard(cardData: Omit<Card, 'id' | 'dateAdded'>): Promise<Card> {
    const response = await api.post<Card>('/api/v1/collection', cardData);
    return response.data;
  },

  async updateCard(cardId: string, cardData: Partial<Card>): Promise<Card> {
    const response = await api.put<Card>(`/api/v1/collection/${cardId}`, cardData);
    return response.data;
  },

  async deleteCard(cardId: string): Promise<void> {
    await api.delete(`/api/v1/collection/${cardId}`);
  },

  // Collection statistics
  async getCollectionStats(): Promise<UserStats> {
    const response = await api.get<UserStats>('/api/v1/collection/stats');
    return response.data;
  },

  // User stats and achievements
  async getUserStats(): Promise<UserStats> {
    const response = await api.get<UserStats>('/api/v1/users/stats');
    return response.data;
  },

  async getAchievements(): Promise<Achievement[]> {
    const response = await api.get<Achievement[]>('/api/v1/users/achievements');
    return response.data;
  },

  async getUserProfile(): Promise<any> {
    const response = await api.get('/api/v1/users/profile');
    return response.data;
  },

  async updateUserProfile(profileData: any): Promise<any> {
    const response = await api.put('/api/v1/users/profile', profileData);
    return response.data;
  },

  // Authentication (if using your own auth system)
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, displayName: string): Promise<{ token: string; user: any }> {
    const response = await api.post('/api/auth/register', { email, password, displayName });
    return response.data;
  },

  // Firebase authentication sync
  async syncFirebaseAuth(idToken: string): Promise<{ token: string; user: any }> {
    const response = await api.post('/api/auth/firebase', { id_token: idToken });
    return response.data;
  },

  async getCurrentUser(): Promise<any> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<{ token: string; user: any }> {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api; 