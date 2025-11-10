import type { PlayerDto } from '../services/player.service';

/**
 * Squad Validator
 * 
 * Validates squad composition according to fantasy football rules.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate a squad
 * 
 * Rules:
 * - Must have exactly 15 players
 * - Must have exactly 11 starters
 * - Total cost must not exceed budget (default £100m)
 * - Must have at least 2 goalkeepers
 * - Must have at least 5 defenders
 * - Must have at least 5 midfielders
 * - Must have at least 3 forwards
 * - Maximum 3 players from the same team
 * 
 * @param players Array of PlayerDto in the squad
 * @param starterIds Array of player IDs that are starters
 * @param budget Maximum budget in millions (default 100)
 * @returns ValidationResult
 */
export function validateSquad(
  players: PlayerDto[], 
  starterIds: number[], 
  budget: number = 100
): ValidationResult {
  const errors: string[] = [];
  
  // Check player count
  if (players.length !== 15) {
    errors.push('Squad must have exactly 15 players');
  }
  
  // Check starter count
  if (starterIds.length !== 11) {
    errors.push('Must have exactly 11 starters');
  }
  
  // Check that all starter IDs are in the squad
  const playerIds = new Set(players.map(p => p.id));
  const invalidStarters = starterIds.filter(id => !playerIds.has(id));
  if (invalidStarters.length > 0) {
    errors.push('Some starter IDs are not in the squad');
  }
  
  // Check budget
  const totalCost = players.reduce((sum, p) => sum + p.cost, 0);
  if (totalCost > budget) {
    errors.push(`Squad cost (£${totalCost.toFixed(1)}m) exceeds budget (£${budget}m)`);
  }
  
  // Check position limits (2 GK, 5 DEF, 5 MID, 3 FWD minimum)
  const positions = players.map(p => p.position);
  const gkCount = positions.filter(p => p === 1).length;
  const defCount = positions.filter(p => p === 2).length;
  const midCount = positions.filter(p => p === 3).length;
  const fwdCount = positions.filter(p => p === 4).length;
  
  if (gkCount < 2) {
    errors.push('Must have at least 2 goalkeepers');
  }
  if (defCount < 5) {
    errors.push('Must have at least 5 defenders');
  }
  if (midCount < 5) {
    errors.push('Must have at least 5 midfielders');
  }
  if (fwdCount < 3) {
    errors.push('Must have at least 3 forwards');
  }
  
  // Check team limits (max 3 players per team)
  const teamCounts = new Map<number, number>();
  players.forEach(p => {
    teamCounts.set(p.teamId, (teamCounts.get(p.teamId) || 0) + 1);
  });
  
  for (const [teamId, count] of teamCounts.entries()) {
    if (count > 3) {
      const teamName = players.find(p => p.teamId === teamId)?.teamName || `Team ${teamId}`;
      errors.push(`Cannot have more than 3 players from ${teamName} (you have ${count})`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get position name from position ID
 * @param position Position ID (1=GK, 2=DEF, 3=MID, 4=FWD)
 * @returns Position name
 */
export function getPositionName(position: number): string {
  const positionMap: { [key: number]: string } = {
    1: 'Goalkeeper',
    2: 'Defender',
    3: 'Midfielder',
    4: 'Forward',
  };
  return positionMap[position] || 'Unknown';
}

/**
 * Get position abbreviation from position ID
 * @param position Position ID (1=GK, 2=DEF, 3=MID, 4=FWD)
 * @returns Position abbreviation
 */
export function getPositionAbbr(position: number): string {
  const positionMap: { [key: number]: string } = {
    1: 'GK',
    2: 'DEF',
    3: 'MID',
    4: 'FWD',
  };
  return positionMap[position] || '?';
}


