import { storage } from '../utils/storage';

/**
 * API Client for SLIAC Fantasy Football API
 * 
 * Base URLs (from FRONTEND_INTEGRATION_GUIDE.md):
 * - HTTPS: https://localhost:7010
 * - HTTP: http://localhost:5237
 * 
 * Endpoint Notes:
 * - Swagger.json shows: /api/Users/... (capital U)
 * - FRONTEND_INTEGRATION_GUIDE shows: /api/users/... (lowercase u)
 * - ASP.NET Core routing is case-insensitive, so both should work
 * - Using capital U to match swagger.json specification
 */
class ApiClient {
  private baseUrl = 'https://localhost:7010';
  private isRefreshing = false;
  
  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = storage.getAccessToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && !this.isRefreshing) {
      try {
        await this.refreshToken();
        // Retry the original request with new token
        return this.request(endpoint, options);
      } catch (refreshError) {
        // Refresh failed, clear storage and redirect to login
        storage.clear();
        if (window.location.hash !== '#/login') {
          window.location.hash = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }
    
    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return null;
    }
    
    return response.json();
  }
  
  async refreshToken() {
    if (this.isRefreshing) {
      // Already refreshing, wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 100));
      return;
    }
    
    this.isRefreshing = true;
    
    try {
      const accessToken = storage.getAccessToken();
      const refreshToken = storage.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await fetch(`${this.baseUrl}/api/Users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, refreshToken }),
      });
      
      if (!response.ok) {
        storage.clear();
        throw new Error('Session expired');
      }
      
      const data = await response.json();
      storage.setAccessToken(data.accessToken);
      storage.setRefreshToken(data.refreshToken);
    } finally {
      this.isRefreshing = false;
    }
  }
  
  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }
  
  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

