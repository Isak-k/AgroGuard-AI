/**
 * Backend API Service
 * Handles all communication with the backend server
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

class BackendService {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Backend API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Generic CRUD operations
  async getAll<T>(collection: string): Promise<T[]> {
    const response = await this.request<T[]>(`/api/${collection}`);
    return response.success ? response.data || [] : [];
  }

  async getById<T>(collection: string, id: string): Promise<T | null> {
    const response = await this.request<T>(`/api/${collection}/${id}`);
    return response.success ? response.data || null : null;
  }

  async create<T>(collection: string, data: Omit<T, 'id'>): Promise<string | null> {
    const response = await this.request<T>(`/api/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.success && response.data ? (response.data as any).id : null;
  }

  async update<T>(collection: string, id: string, data: Partial<T>): Promise<boolean> {
    const response = await this.request<T>(`/api/${collection}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.success;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const response = await this.request(`/api/${collection}/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // Disease-specific methods
  async searchDiseasesByCrop(cropType: string) {
    const response = await this.request(`/api/diseases/search/${encodeURIComponent(cropType)}`);
    return response.success ? response.data || [] : [];
  }

  async getFeaturedDiseases() {
    const response = await this.request('/api/diseases/featured');
    return response.success ? response.data || [] : [];
  }

  // Chemical-specific methods
  async getChemicalsByType(type: string) {
    const response = await this.request(`/api/chemicals/type/${encodeURIComponent(type)}`);
    return response.success ? response.data || [] : [];
  }

  // Market-specific methods
  async getMarketsByLocation(location: string) {
    const response = await this.request(`/api/markets/location/${encodeURIComponent(location)}`);
    return response.success ? response.data || [] : [];
  }

  async getMarketChemicals(marketId: string) {
    const response = await this.request(`/api/markets/${marketId}/chemicals`);
    return response.success ? response.data || [] : [];
  }

  async updateMarketChemical(marketId: string, chemicalId: string, updates: { price?: number; available?: boolean }) {
    const response = await this.request(`/api/markets/${marketId}/chemicals/${chemicalId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.success;
  }

  // Pending disease methods
  async submitPendingDisease(data: any) {
    const response = await this.request('/api/pending-diseases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.success ? response.data : null;
  }

  async approvePendingDisease(id: string, diseaseData?: any) {
    const response = await this.request(`/api/pending-diseases/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ diseaseData }),
    });
    return response.success;
  }

  async rejectPendingDisease(id: string, reason?: string) {
    const response = await this.request(`/api/pending-diseases/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
    return response.success;
  }

  async getPendingDiseasesByStatus(status: string) {
    const response = await this.request(`/api/pending-diseases/status/${status}`);
    return response.success ? response.data || [] : [];
  }

  // Comment methods
  async submitComment(data: any) {
    const response = await this.request('/api/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.success ? response.data : null;
  }

  async markCommentAsRead(id: string) {
    const response = await this.request(`/api/comments/${id}/read`, {
      method: 'PUT',
    });
    return response.success;
  }

  async replyToComment(id: string, reply: string, repliedBy?: string) {
    const response = await this.request(`/api/comments/${id}/reply`, {
      method: 'PUT',
      body: JSON.stringify({ reply, repliedBy }),
    });
    return response.success;
  }

  async getCommentsByStatus(status: string) {
    const response = await this.request(`/api/comments/status/${status}`);
    return response.success ? response.data || [] : [];
  }

  async getCommentsByCategory(category: string) {
    const response = await this.request(`/api/comments/category/${category}`);
    return response.success ? response.data || [] : [];
  }

  async getCommentsByUser(userId: string) {
    const response = await this.request(`/api/comments/user/${userId}`);
    return response.success ? response.data || [] : [];
  }

  // Health check
  async healthCheck() {
    const response = await this.request('/health');
    return response;
  }
}

// Create and export singleton instance
export const backendService = new BackendService();

// Export types for use in components
export type { ApiResponse };