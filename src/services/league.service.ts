import { apiClient } from './api-client';

/**
 * League Service
 * 
 * Handles all API calls related to leagues.
 */

// League DTOs (matching backend API responses)
export interface LeagueDto {
  id: number
  owner: number
  ownerUsername?: string | null
  type: boolean // true = public, false = private (backend convention)
  typeDisplay?: string | null
  memberCount: number
}

export interface LeagueMemberDto {
  userId: number
  username?: string | null
  school?: string | null
}

export interface LeagueDetailsDto {
  id: number
  owner: number
  ownerUsername?: string | null
  type: boolean // true = public, false = private (backend convention)
  members?: LeagueMemberDto[] | null
}

export interface StandingsEntry {
  rank: number
  userId: number
  username?: string | null
  totalPoints: number
}

export class LeagueService {
  /**
   * Get all leagues for a user
   * @param userId User ID
   * @returns Array of LeagueDto
   */
  async getUserLeagues(userId: number) {
    return apiClient.get(`/api/Leagues/user/${userId}`);
  }
  
  /**
   * Get all public leagues
   * @returns Array of LeagueDto
   */
  async getPublicLeagues() {
    return apiClient.get('/api/Leagues/public');
  }
  
  /**
   * Get a specific league by ID
   * @param id League ID
   * @returns LeagueDto
   */
  async getLeague(id: number) {
    return apiClient.get(`/api/Leagues/${id}`);
  }
  
  /**
   * Get league details with members
   * @param id League ID
   * @returns LeagueDetailsDto
   */
  async getLeagueDetails(id: number) {
    return apiClient.get(`/api/Leagues/${id}/details`);
  }
  
  /**
   * Create a new league
   * @param userId User ID
   * @param leagueData CreateLeagueDto
   * @returns LeagueDto
   */
  async createLeague(userId: number, leagueData: Record<string, unknown>) {
    return apiClient.post(`/api/Leagues/user/${userId}`, leagueData);
  }
  
  /**
   * Update a league
   * @param id League ID
   * @param leagueData UpdateLeagueDto
   * @returns LeagueDto
   */
  async updateLeague(id: number, leagueData: Record<string, unknown>) {
    return apiClient.put(`/api/Leagues/${id}`, leagueData);
  }
  
  /**
   * Delete a league
   * @param id League ID
   */
  async deleteLeague(id: number) {
    return apiClient.delete(`/api/Leagues/${id}`);
  }
  
  /**
   * Join a league
   * @param leagueId League ID
   * @param userId User ID
   */
  async joinLeague(leagueId: number, userId: number) {
    return apiClient.post(`/api/Leagues/${leagueId}/join/${userId}`, {});
  }
  
  /**
   * Leave a league
   * @param leagueId League ID
   * @param userId User ID
   */
  async leaveLeague(leagueId: number, userId: number) {
    return apiClient.post(`/api/Leagues/${leagueId}/leave/${userId}`, {});
  }
  
  /**
   * Get league standings for a gameweek
   * @param leagueId League ID
   * @param gameweekId Gameweek ID
   * @returns LeagueStandingsDto
   */
  async getStandings(leagueId: number, gameweekId: number) {
    return apiClient.get(`/api/Leagues/${leagueId}/standings/gameweek/${gameweekId}`);
  }

  /**
   * Kick/remove a member from league (only owner can do this)
   * @param leagueId League ID
   * @param userId User ID to kick
   */
  async kickMember(leagueId: number, userId: number) {
    return apiClient.post(`/api/Leagues/${leagueId}/kick/${userId}`, {});
  }
}

export const leagueService = new LeagueService();


