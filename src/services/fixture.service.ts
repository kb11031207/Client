import { apiClient } from './api-client';

export interface FixtureDto {
  id: number
  gameweekId: number
  homeTeamId: number
  homeTeamName?: string | null
  awayTeamId: number
  awayTeamName?: string | null
  homeScore?: number | null
  awayScore?: number | null
  kickoff: string
  isComplete?: boolean
}

export interface PlayerFixtureStatsDto {
  playerId: number
  playerName?: string | null
  teamId: number
  minutesPlayed: number
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  cleanSheet: boolean
  goalsConceded: number
  saves: number
}

export interface FixtureDetailsDto extends FixtureDto {
  playerStats?: PlayerFixtureStatsDto[] | null
}

/**
 * Fixture Service
 * 
 * Handles all API calls related to fixtures.
 */
export class FixtureService {
  /**
   * Get fixtures for a specific gameweek
   * @param gameweekId Gameweek ID
   * @returns Array of FixtureDto
   */
  async getFixturesByGameweek(gameweekId: number): Promise<FixtureDto[]> {
    return apiClient.get(`/api/Fixtures/gameweek/${gameweekId}`) as Promise<FixtureDto[]>
  }

  /**
   * Get all fixtures
   * @returns Array of FixtureDto
   */
  async getAllFixtures(): Promise<FixtureDto[]> {
    return apiClient.get('/api/Fixtures') as Promise<FixtureDto[]>
  }

  /**
   * Get fixture details with player stats
   * @param fixtureId Fixture ID
   * @returns FixtureDetailsDto
   */
  async getFixtureDetails(fixtureId: number): Promise<FixtureDetailsDto> {
    return apiClient.get(`/api/Fixtures/${fixtureId}/details`) as Promise<FixtureDetailsDto>
  }
}

export const fixtureService = new FixtureService();

