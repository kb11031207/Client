import { apiClient } from './api-client';

/**
 * Gameweek Service
 * 
 * Handles all API calls related to gameweeks.
 */
export class GameweekService {
  /**
   * Get the current gameweek
   * @returns GameweekDto
   */
  async getCurrentGameweek() {
    return apiClient.get('/api/Gameweeks/current');
  }
  
  /**
   * Get a specific gameweek by ID
   * @param id Gameweek ID
   * @returns GameweekDto
   */
  async getGameweek(id: number) {
    return apiClient.get(`/api/Gameweeks/${id}`);
  }
  
  /**
   * Get all gameweeks
   * @returns Array of GameweekDto
   */
  async getAllGameweeks() {
    return apiClient.get('/api/Gameweeks');
  }
  
  /**
   * Get gameweek details with fixtures
   * @param id Gameweek ID
   * @returns GameweekDetailsDto
   */
  async getGameweekDetails(id: number) {
    return apiClient.get(`/api/Gameweeks/${id}/details`);
  }
}

export const gameweekService = new GameweekService();


