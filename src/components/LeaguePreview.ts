import { router } from '../utils/router';

/**
 * League Preview Component
 * 
 * Displays a preview of user's leagues.
 */

export interface LeagueDto {
  id: number;
  owner: number;
  ownerUsername?: string | null;
  type: boolean; // true = private, false = public
  typeDisplay?: string | null;
  memberCount: number;
}

/**
 * Render leagues preview
 * @param leagues Array of LeagueDto
 * @returns HTML string
 */
export function renderLeaguesPreview(leagues: LeagueDto[]): string {
  if (leagues.length === 0) {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">My Leagues</h2>
          <a href="#/leagues/create" class="btn btn-primary btn-sm">
            Create League
          </a>
        </div>
        <div class="card-body">
          <p class="text-secondary mb-md">
            You're not part of any leagues yet.
          </p>
          <a href="#/leagues" class="btn btn-primary">
            Browse Leagues
          </a>
        </div>
      </div>
    `;
  }

  return `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">My Leagues</h2>
        <div class="flex gap-sm">
          <a href="#/leagues" class="btn btn-secondary btn-sm">
            View All
          </a>
          <a href="#/leagues/create" class="btn btn-primary btn-sm">
            Create League
          </a>
        </div>
      </div>
      <div class="card-body">
        <div class="flex flex-column gap-md">
          ${leagues.slice(0, 3).map(league => `
            <div 
              class="flex flex-between flex-center" 
              style="padding: var(--spacing-md); background: var(--color-surface); border-radius: var(--radius-sm); cursor: pointer; border: 1px solid var(--color-border);"
              data-league-id="${league.id}"
            >
              <div class="flex flex-column gap-xs">
                <div style="font-weight: var(--font-weight-medium);">
                  League #${league.id}
                </div>
                <div class="text-secondary" style="font-size: var(--font-size-sm);">
                  ${league.typeDisplay || (league.type ? 'Public' : 'Private')} • ${league.memberCount} member${league.memberCount !== 1 ? 's' : ''}
                </div>
                ${league.ownerUsername ? `
                  <div class="text-secondary" style="font-size: var(--font-size-sm);">
                    Owner: ${league.ownerUsername}
                  </div>
                ` : ''}
              </div>
              <a href="#/leagues/${league.id}" class="btn btn-secondary btn-sm">
                View
              </a>
            </div>
          `).join('')}
          ${leagues.length > 3 ? `
            <div class="text-center">
              <a href="#/leagues" class="text-secondary" style="font-size: var(--font-size-sm);">
                View ${leagues.length - 3} more league${leagues.length - 3 !== 1 ? 's' : ''}...
              </a>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}


