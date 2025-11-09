/**
 * Squad Preview Component
 * 
 * Displays a preview of user's squads, particularly for the current gameweek.
 */

export interface SquadDto {
  id: number;
  userId: number;
  gameweekId: number;
  createdAt: string;
  updatedAt: string;
  players?: SquadPlayerDto[] | null;
  totalCost: number;
  totalPoints: number;
}

export interface SquadPlayerDto {
  playerId: number;
  playerName?: string | null;
  position: number;
  teamName?: string | null;
  isStarter: boolean;
  isCaptain: boolean;
  isVice: boolean;
  playerCost: number;
  points?: number | null;
}

/**
 * Render squad preview card
 * @param squad SquadDto or null
 * @param gameweekId Current gameweek ID
 * @returns HTML string
 */
export function renderSquadPreview(squad: SquadDto | null, gameweekId: number): string {
  if (!squad) {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">My Squad</h2>
        </div>
        <div class="card-body">
          <p class="text-secondary mb-md">
            You don't have a squad for Gameweek ${gameweekId} yet.
          </p>
          <a href="#/squad/${gameweekId}" class="btn btn-primary">
            Create Squad
          </a>
        </div>
      </div>
    `;
  }

  const starters = squad.players?.filter(p => p.isStarter) || [];
  const captain = squad.players?.find(p => p.isCaptain);
  
  const positionNames: { [key: number]: string } = {
    1: 'GK',
    2: 'DEF',
    3: 'MID',
    4: 'FWD'
  };

  return `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">My Squad - Gameweek ${squad.gameweekId}</h2>
        <a href="#/squad/${squad.gameweekId}" class="btn btn-secondary btn-sm">
          View/Edit
        </a>
      </div>
      <div class="card-body">
        <div class="flex flex-between mb-md" style="border-bottom: 1px solid var(--color-border); padding-bottom: var(--spacing-md);">
          <div>
            <div class="text-secondary" style="font-size: var(--font-size-sm);">Total Points</div>
            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);">
              ${squad.totalPoints || 0}
            </div>
          </div>
          <div>
            <div class="text-secondary" style="font-size: var(--font-size-sm);">Squad Value</div>
            <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold);">
              £${squad.totalCost.toFixed(1)}m
            </div>
          </div>
        </div>
        ${starters.length > 0 ? `
          <div class="mb-md">
            <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-sm);">Starting XI</h3>
            <div class="flex flex-column gap-sm">
              ${starters.map(player => `
                <div class="flex flex-between flex-center" style="padding: var(--spacing-xs); background: var(--color-surface); border-radius: var(--radius-sm);">
                  <div class="flex flex-center gap-sm">
                    <span style="font-weight: var(--font-weight-medium); min-width: 30px;">${positionNames[player.position] || '?'}</span>
                    <span>${player.playerName || 'Unknown'}</span>
                    ${player.isCaptain ? '<span style="background: var(--color-primary); color: white; padding: 2px 6px; border-radius: var(--radius-sm); font-size: var(--font-size-xs);">C</span>' : ''}
                    ${player.isVice ? '<span style="background: var(--color-secondary); color: white; padding: 2px 6px; border-radius: var(--radius-sm); font-size: var(--font-size-xs);">V</span>' : ''}
                  </div>
                  <div class="text-secondary" style="font-size: var(--font-size-sm);">
                    ${player.points !== null && player.points !== undefined ? `${player.points} pts` : '—'}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        ${captain ? `
          <div class="text-secondary" style="font-size: var(--font-size-sm);">
            Captain: ${captain.playerName || 'Unknown'}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}


