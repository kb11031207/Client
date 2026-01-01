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
 * 
 * Network Access:
 * - Set VITE_API_BASE_URL environment variable to your backend server's network IP
 * - Example: VITE_API_BASE_URL=https://192.168.1.100:7010
 * - Defaults to https://localhost:7010 for local development
 */
class ApiClient {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7010';
  private isRefreshing = false;
  
  async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    // BUT: Skip token refresh for login/register endpoints (they don't have tokens)
    const isAuthEndpoint = endpoint.includes('/Users/login') || 
                          endpoint.includes('/Users/register') ||
                          endpoint.includes('/users/login') ||
                          endpoint.includes('/users/register');
    
    if (response.status === 401 && !this.isRefreshing && !isAuthEndpoint && token) {
      // Only try to refresh if we have a token and it's not an auth endpoint
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
    
    // Handle empty responses (204 No Content) before checking ok status
    if (response.status === 204) {
      return null as T;
    }
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const error = await response.json();
        // Try multiple possible error message fields
        errorMessage = error.error || 
                      error.message || 
                      error.detail || 
                      error.title ||
                      (Array.isArray(error.errors) ? error.errors.join(', ') : null) ||
                      errorMessage;
      } catch {
        // If response is not JSON, use status text or default message
        errorMessage = response.statusText || errorMessage;
      }
      
      // Provide user-friendly messages for common status codes
      if (response.status === 404) {
        // Only show "Season has ended" for specific endpoints, not for player stats
        // Player stats 404s should pass through so they can be handled as "no stats available"
        const isPlayerStatsEndpoint = endpoint.includes('/stats');
        if (!isPlayerStatsEndpoint) {
          errorMessage = 'Season has ended';
        } else {
          // For player stats endpoints, ensure the error message includes "404" so playerSlice can detect it
          if (!errorMessage.toLowerCase().includes('404') && !errorMessage.toLowerCase().includes('not found')) {
            errorMessage = `HTTP 404: ${errorMessage}`;
          }
        }
      } else if (response.status === 401 && isAuthEndpoint) {
        errorMessage = errorMessage.includes('HTTP') 
          ? 'Invalid email or password. Please try again.' 
          : errorMessage;
      } else if (response.status === 400) {
        errorMessage = errorMessage.includes('HTTP') 
          ? 'Invalid request. Please check your input.' 
          : errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json() as T;
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
  
  get<T = unknown>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  post<T = unknown>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  put<T = unknown>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  delete<T = unknown>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

