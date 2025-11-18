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

// Stats summary interface (matches backend)
export interface PlayerStatsSummaryDto {
  totalPoints: number;
  totalGoals: number;
  totalAssists: number;
  totalCleanSheets: number;
  totalSaves: number;
  gamesPlayed: number;
}

// Player with stats (matches backend response)
export interface PlayerWithStatsDto extends PlayerDto {
  stats: PlayerStatsSummaryDto | null;  // null if includeStats is false
}

// Extended filter interface (matches backend)
export interface PlayerFilterDto {
  teamId?: number | null;
  position?: number | null;
  minCost?: number | null;
  maxCost?: number | null;
  // Performance filtering options
  gameweekId?: number | null;
  sortBy?: string | null;  // "points" | "goals" | "assists" | "cleanSheets" | "saves" | "cost" | "name"
  sortOrder?: 'asc' | 'desc' | null;
  includeStats?: boolean;
}

// Player stats interfaces (matching backend API responses)
export interface PlayerFixtureStatsDto {
  fixtureId: number
  homeTeamName?: string | null
  awayTeamName?: string | null
  homeScore: number
  awayScore: number
  kickoff: string
  minutesPlayed: number
  goals: number
  assists: number
  cleanSheet: boolean
  goalsConceded: number
  yellowCards: number
  redCards: number
  saves: number
  shots: number
  shotsOnGoal: number
  pointsEarned: number
}

export interface PlayerStatsDto {
  playerId: number
  playerName?: string | null
  gameweekId: number
  minutesPlayed: number
  goals: number
  assists: number
  cleanSheet: boolean
  goalsConceded: number
  yellowCards: number
  redCards: number
  saves: number
  shots: number
  shotsOnGoal: number
  pointsEarned: number
  fixtures?: PlayerFixtureStatsDto[] | null
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
   * @returns Array of PlayerWithStatsDto (stats may be null if includeStats is false)
   */
  async searchPlayers(filters: PlayerFilterDto): Promise<PlayerWithStatsDto[]> {
    return apiClient.post('/api/Players/search', filters);
  }
  
  /**
   * Get player stats for a specific gameweek
   * @param playerId Player ID
   * @param gameweekId Gameweek ID
   * @returns PlayerStatsDto
   */
  async getPlayerStats(playerId: number, gameweekId: number): Promise<PlayerStatsDto> {
    return apiClient.get(`/api/Players/${playerId}/gameweek/${gameweekId}/stats`) as Promise<PlayerStatsDto>;
  }
}

export const playerService = new PlayerService();


