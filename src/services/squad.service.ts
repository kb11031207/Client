import { apiClient } from './api-client';

/**
 * Squad Service
 * 
 * Handles all API calls related to squads.
 */
export class SquadService {
  /**
   * Get all squads for a user
   * @param userId User ID
   * @returns Array of SquadDto
   */
  async getUserSquads(userId: number) {
    return apiClient.get(`/api/Squads/user/${userId}`);
  }
  
  /**
   * Get user's squad for a specific gameweek
   * @param userId User ID
   * @param gameweekId Gameweek ID
   * @returns SquadDto
   */
  async getUserSquadForGameweek(userId: number, gameweekId: number) {
    return apiClient.get(`/api/Squads/user/${userId}/gameweek/${gameweekId}`);
  }
  
  /**
   * Get a specific squad by ID
   * @param id Squad ID
   * @returns SquadDto
   */
  async getSquad(id: number) {
    return apiClient.get(`/api/Squads/${id}`);
  }
  
  /**
   * Create a new squad
   * @param userId User ID
   * @param squadData CreateSquadDto
   * @returns SquadDto
   */
  async createSquad(userId: number, squadData: any) {
    return apiClient.post(`/api/Squads/user/${userId}`, squadData);
  }
  
  /**
   * Update an existing squad
   * @param id Squad ID
   * @param squadData UpdateSquadDto
   * @returns SquadDto
   */
  async updateSquad(id: number, squadData: any) {
    return apiClient.put(`/api/Squads/${id}`, squadData);
  }
  
  /**
   * Delete a squad
   * @param id Squad ID
   */
  async deleteSquad(id: number) {
    return apiClient.delete(`/api/Squads/${id}`);
  }
}

export const squadService = new SquadService();


