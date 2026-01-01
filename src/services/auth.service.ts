import { apiClient } from './api-client';
import { storage } from '../utils/storage';

/**
 * Authentication Service
 * 
 * Handles user authentication including login, registration, and logout.
 * Uses the API client to communicate with the backend.
 */
export class AuthService {
  /**
   * Login with email and password
   * Stores tokens and user ID in storage upon successful login
   * 
   * @param email User email
   * @param password User password
   * @returns AuthResponseDto with user data and tokens
   */
  async login(email: string, password: string) {
    const data = await apiClient.post<{ accessToken: string; refreshToken: string; id: number; username: string; email: string }>('/api/Users/login', { email, password });
    
    // Store tokens and user ID
    if (data.accessToken) {
      storage.setAccessToken(data.accessToken);
    }
    if (data.refreshToken) {
      storage.setRefreshToken(data.refreshToken);
    }
    if (data.id) {
      storage.setUserId(data.id);
    }
    
    return data;
  }
  
  /**
   * Register a new user
   * Note: Registration does not automatically log the user in.
   * User must call login() after successful registration.
   * 
   * @param username Username (3-50 characters)
   * @param email User email
   * @param password User password (min 8 characters)
   * @param school Optional school name (max 100 characters)
   * @returns UserDto with user data (no tokens)
   */
  async register(username: string, email: string, password: string, school?: string) {
    const data = await apiClient.post('/api/Users/register', {
      username,
      email,
      password,
      school: school || undefined,
    });
    
    // Registration doesn't return tokens, so we don't store them
    // User needs to login separately after registration
    return data;
  }
  
  /**
   * Logout the current user
   * Clears all authentication data from storage
   */
  logout() {
    storage.clear();
  }
  
  /**
   * Get the current user's ID from storage
   * @returns User ID or null if not authenticated
   */
  getCurrentUserId(): number | null {
    return storage.getUserId();
  }
  
  /**
   * Check if the user is currently authenticated
   * @returns true if user has a valid access token
   */
  isAuthenticated(): boolean {
    return storage.isAuthenticated();
  }
}

export const authService = new AuthService();

