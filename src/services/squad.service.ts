import { apiClient } from './api-client';

/**
 * Squad Service
 * 
 * Handles all API calls related to squads.
 */

// Squad DTOs (matching backend API responses)
export interface SquadPlayerDto {
  id: number
  playerId: number
  position: number
  isStarter?: boolean
  isCaptain?: boolean
  isVice?: boolean
  [key: string]: unknown
}

export interface SquadDto {
  id: number
  userId: number
  gameweekId: number
  players: SquadPlayerDto[]
  captainId?: number
  viceCaptainId?: number
  totalCost?: number
  totalPoints?: number
}

// CreateSquadDto interface for creating/updating squads
export interface CreateSquadDto {
  gameweekId: number
  playerIds: number[]
  starterIds: number[]
  captainId: number
  viceCaptainId: number
}

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
  async createSquad(userId: number, squadData: Record<string, unknown>) {
    return apiClient.post(`/api/Squads/user/${userId}`, squadData);
  }
  
  /**
   * Update an existing squad
   * @param id Squad ID
   * @param squadData UpdateSquadDto
   * @returns SquadDto
   */
  async updateSquad(id: number, squadData: Record<string, unknown>) {
    return apiClient.put(`/api/Squads/${id}`, squadData);
  }
  
  /**
   * Delete a squad
   * @param id Squad ID
   */
  async deleteSquad(id: number) {
    return apiClient.delete(`/api/Squads/${id}`);
  }
  
  /**
   * Generate a random squad for a gameweek
   * @param userId User ID
   * @param gameweekId Gameweek ID
   * @returns CreateSquadDto with randomly selected players
   */
  async generateRandomSquad(userId: number, gameweekId: number): Promise<CreateSquadDto> {
    return apiClient.post(`/api/Squads/user/${userId}/random/gameweek/${gameweekId}`, {}) as Promise<CreateSquadDto>;
  }
}

export const squadService = new SquadService();


