import { apiClient } from './api-client';

/**
 * Player Service
 * 
 * Handles all API calls related to players.
 */

export interface PlayerDto {
  id: number;
  position: number;
  positionDisplay?: string | null;
  name?: string | null;
  playerNum: number;
  teamId: number;
  teamName?: string | null;
  school?: string | null;
  cost: number;
  pictureUrl?: string | null;
}

export interface PlayerFilterDto {
  teamId?: number | null;
  position?: number | null;
  minCost?: number | null;
  maxCost?: number | null;
}

/**
 * Player Service Class
 */
export class PlayerService {
  /**
   * Get all players
   * @returns Array of PlayerDto
   */
  async getAllPlayers(): Promise<PlayerDto[]> {
    return apiClient.get('/api/Players');
  }
  
  /**
   * Get a specific player by ID
   * @param id Player ID
   * @returns PlayerDto
   */
  async getPlayer(id: number): Promise<PlayerDto> {
    return apiClient.get(`/api/Players/${id}`);
  }
  
  /**
   * Get players by position
   * @param position Position ID (1=GK, 2=DEF, 3=MID, 4=FWD)
   * @returns Array of PlayerDto
   */
  async getPlayersByPosition(position: number): Promise<PlayerDto[]> {
    return apiClient.get(`/api/Players/position/${position}`);
  }
  
  /**
   * Get players by team
   * @param teamId Team ID
   * @returns Array of PlayerDto
   */
  async getPlayersByTeam(teamId: number): Promise<PlayerDto[]> {
    return apiClient.get(`/api/Players/team/${teamId}`);
  }
  
  /**
   * Search players with filters
   * @param filters PlayerFilterDto
   * @returns Array of PlayerDto
   */
  async searchPlayers(filters: PlayerFilterDto): Promise<PlayerDto[]> {
    return apiClient.post('/api/Players/search', filters);
  }
  
  /**
   * Get player stats for a specific gameweek
   * @param playerId Player ID
   * @param gameweekId Gameweek ID
   * @returns PlayerStatsDto
   */
  async getPlayerStats(playerId: number, gameweekId: number) {
    return apiClient.get(`/api/Players/${playerId}/gameweek/${gameweekId}/stats`);
  }
}

export const playerService = new PlayerService();


