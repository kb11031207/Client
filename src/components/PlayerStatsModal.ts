import { playerService, type PlayerDto } from '../services/player.service';
import { gameweekService } from '../services/gameweek.service';
import { router } from '../utils/router';
import { getPositionName, getPositionAbbr } from '../utils/squad-validator';

/**
 * Player Stats Modal Component
 * 
 * Modal for viewing player stats from the squad builder.
 */

interface PlayerFixtureStatsDto {
  fixtureId: number;
  homeTeamName?: string | null;
  awayTeamName?: string | null;
  homeScore: number;
  awayScore: number;
  kickoff: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  goalsConceded: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  shots: number;
  shotsOnGoal: number;
  pointsEarned: number;
}

interface PlayerStatsDto {
  playerId: number;
  playerName?: string | null;
  gameweekId: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  goalsConceded: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  shots: number;
  shotsOnGoal: number;
  pointsEarned: number;
  fixtures?: PlayerFixtureStatsDto[] | null;
}

/**
 * Render the player stats modal
 */
function renderPlayerStatsModal(player: PlayerDto, stats: PlayerStatsDto | null, gameweekId: number, isLoading: boolean): string {
  const positionName = player.positionDisplay || getPositionName(player.position);
  const positionAbbr = getPositionAbbr(player.position);

  return `
    <div id="player-stats-modal" class="modal-overlay">
      <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h2 class="modal-title">Player Stats</h2>
          <button id="close-player-stats-modal" class="modal-close" aria-label="Close modal">
            ×
          </button>
        </div>
        <div class="modal-body">
          <!-- Player Info -->
          <div class="flex flex-center gap-md mb-lg" style="padding: var(--spacing-md); background: var(--color-surface-elevated); border-radius: var(--radius-sm);">
            ${player.pictureUrl ? `
              <img 
                src="${player.pictureUrl}" 
                alt="${player.name || 'Player'}" 
                style="width: 60px; height: 60px; border-radius: var(--radius-md); object-fit: cover; border: 2px solid var(--color-border);"
              >
            ` : `
              <div 
                style="width: 60px; height: 60px; border-radius: var(--radius-md); background: var(--color-surface-elevated); display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold); font-size: var(--font-size-xl); border: 2px solid var(--color-border);"
              >
                ${positionAbbr}
              </div>
            `}
            <div class="flex flex-column" style="flex: 1;">
              <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                ${player.name || 'Unknown Player'}
              </div>
              <div class="text-secondary" style="font-size: var(--font-size-base);">
                ${player.teamName || 'Unknown Team'} • ${positionName} • £${player.cost.toFixed(1)}m
              </div>
            </div>
          </div>

          ${isLoading ? `
            <div class="text-center p-xl">
              <p>Loading stats...</p>
            </div>
          ` : stats ? `
            <!-- Points Earned -->
            <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 2px solid var(--color-primary); margin-bottom: var(--spacing-md);">
              <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                Points Earned (Gameweek ${gameweekId})
              </div>
              <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-primary);">
                ${stats.pointsEarned}
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="card mb-md">
              <div class="card-header">
                <h3 class="card-title" style="font-size: var(--font-size-base);">Stats</h3>
              </div>
              <div class="card-body">
                <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--spacing-sm);">
                  <div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Minutes</div>
                    <div style="font-weight: var(--font-weight-semibold);">${stats.minutesPlayed}</div>
                  </div>
                  <div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Goals</div>
                    <div style="font-weight: var(--font-weight-semibold); color: var(--color-success);">${stats.goals}</div>
                  </div>
                  <div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Assists</div>
                    <div style="font-weight: var(--font-weight-semibold); color: var(--color-success);">${stats.assists}</div>
                  </div>
                  <div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Shots</div>
                    <div style="font-weight: var(--font-weight-semibold);">${stats.shots || 0}</div>
                  </div>
                  <div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">On Target</div>
                    <div style="font-weight: var(--font-weight-semibold);">${stats.shotsOnGoal || 0}</div>
                  </div>
                  <div style="${stats.cleanSheet ? 'border: 2px solid var(--color-success); border-radius: var(--radius-sm); padding: var(--spacing-xs);' : ''}">
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Clean Sheet</div>
                    <div style="font-weight: var(--font-weight-semibold); ${stats.cleanSheet ? 'color: var(--color-success);' : ''}">
                      ${stats.cleanSheet ? '✓' : '✗'}
                    </div>
                  </div>
                  <div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Goals Against</div>
                    <div style="font-weight: var(--font-weight-semibold); ${stats.goalsConceded > 0 ? 'color: var(--color-error);' : ''}">
                      ${stats.goalsConceded}
                    </div>
                  </div>
                  <div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Saves</div>
                    <div style="font-weight: var(--font-weight-semibold);">${stats.saves}</div>
                  </div>
                  <div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Yellow Cards</div>
                    <div style="font-weight: var(--font-weight-semibold); ${stats.yellowCards > 0 ? 'color: var(--color-warning);' : ''}">
                      ${stats.yellowCards}
                    </div>
                  </div>
                  <div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Red Cards</div>
                    <div style="font-weight: var(--font-weight-semibold); ${stats.redCards > 0 ? 'color: var(--color-error);' : ''}">
                      ${stats.redCards}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            ${stats.fixtures && stats.fixtures.length > 0 ? `
              <!-- Fixtures -->
              <div class="card mb-md">
                <div class="card-header">
                  <h3 class="card-title" style="font-size: var(--font-size-base);">Fixtures</h3>
                </div>
                <div class="card-body">
                  <div class="flex flex-column gap-sm">
                    ${stats.fixtures.map((fixture: PlayerFixtureStatsDto) => `
                      <div style="padding: var(--spacing-sm); background: var(--color-surface); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                        <div class="flex flex-between flex-center" style="flex-wrap: wrap; gap: var(--spacing-xs); margin-bottom: var(--spacing-xs);">
                          <div style="font-weight: var(--font-weight-medium); font-size: var(--font-size-sm);">
                            ${fixture.homeTeamName || 'Home'} ${fixture.homeScore} - ${fixture.awayScore} ${fixture.awayTeamName || 'Away'}
                          </div>
                          <div style="font-weight: var(--font-weight-bold); color: var(--color-primary); font-size: var(--font-size-sm);">
                            ${fixture.pointsEarned} pts
                          </div>
                        </div>
                        <div class="text-secondary" style="font-size: var(--font-size-xs);">
                          ${new Date(fixture.kickoff).toLocaleDateString()} • ${fixture.minutesPlayed} min
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            ` : ''}
          ` : `
            <div class="text-center p-xl">
              <p class="text-secondary">No stats available for this gameweek.</p>
            </div>
          `}

          <!-- Actions -->
          <div class="flex gap-sm" style="justify-content: flex-end; margin-top: var(--spacing-md);">
            <a href="#/players/${player.id}" class="btn btn-primary btn-sm" onclick="document.querySelector('#player-stats-modal')?.remove();">
              View Full Details
            </a>
            <button type="button" class="btn btn-secondary btn-sm" id="close-player-stats-modal-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show the player stats modal
 */
export async function showPlayerStatsModal(player: PlayerDto, gameweekId: number): Promise<void> {
  const container = document.querySelector('#app');
  if (!container) return;

  // Remove existing modal if any
  const existingModal = document.querySelector('#player-stats-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Show modal with loading state
  const modalHTML = renderPlayerStatsModal(player, null, gameweekId, true);
  container.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.querySelector('#player-stats-modal') as HTMLDivElement;
  if (!modal) return;

  // Show modal with animation
  setTimeout(() => {
    modal.classList.add('modal-show');
  }, 10);

  // Close modal handlers
  const closeModal = () => {
    modal.classList.remove('modal-show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  const closeBtn = document.querySelector('#close-player-stats-modal') as HTMLButtonElement;
  const closeBtn2 = document.querySelector('#close-player-stats-modal-btn') as HTMLButtonElement;
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  if (closeBtn2) {
    closeBtn2.addEventListener('click', closeModal);
  }

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Load player stats
  try {
    const stats = await playerService.getPlayerStats(player.id, gameweekId) as PlayerStatsDto;
    
    // Update modal body with stats
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
      const positionName = player.positionDisplay || getPositionName(player.position);
      const positionAbbr = getPositionAbbr(player.position);
      
      modalBody.innerHTML = `
        <!-- Player Info -->
        <div class="flex flex-center gap-md mb-lg" style="padding: var(--spacing-md); background: var(--color-surface-elevated); border-radius: var(--radius-sm);">
          ${player.pictureUrl ? `
            <img 
              src="${player.pictureUrl}" 
              alt="${player.name || 'Player'}" 
              style="width: 60px; height: 60px; border-radius: var(--radius-md); object-fit: cover; border: 2px solid var(--color-border);"
            >
          ` : `
            <div 
              style="width: 60px; height: 60px; border-radius: var(--radius-md); background: var(--color-surface-elevated); display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold); font-size: var(--font-size-xl); border: 2px solid var(--color-border);"
            >
              ${positionAbbr}
            </div>
          `}
          <div class="flex flex-column" style="flex: 1;">
            <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
              ${player.name || 'Unknown Player'}
            </div>
            <div class="text-secondary" style="font-size: var(--font-size-base);">
              ${player.teamName || 'Unknown Team'} • ${positionName} • £${player.cost.toFixed(1)}m
            </div>
          </div>
        </div>

        <!-- Points Earned -->
        <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 2px solid var(--color-primary); margin-bottom: var(--spacing-md);">
          <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
            Points Earned (Gameweek ${gameweekId})
          </div>
          <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-primary);">
            ${stats.pointsEarned}
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="card mb-md">
          <div class="card-header">
            <h3 class="card-title" style="font-size: var(--font-size-base);">Stats</h3>
          </div>
          <div class="card-body">
            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--spacing-sm);">
              <div>
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Minutes</div>
                <div style="font-weight: var(--font-weight-semibold);">${stats.minutesPlayed}</div>
              </div>
              <div>
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Goals</div>
                <div style="font-weight: var(--font-weight-semibold); color: var(--color-success);">${stats.goals}</div>
              </div>
              <div>
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Assists</div>
                <div style="font-weight: var(--font-weight-semibold); color: var(--color-success);">${stats.assists}</div>
              </div>
              <div>
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Shots</div>
                <div style="font-weight: var(--font-weight-semibold);">${stats.shots || 0}</div>
              </div>
              <div>
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">On Target</div>
                <div style="font-weight: var(--font-weight-semibold);">${stats.shotsOnGoal || 0}</div>
              </div>
              <div style="${stats.cleanSheet ? 'border: 2px solid var(--color-success); border-radius: var(--radius-sm); padding: var(--spacing-xs);' : ''}">
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Clean Sheet</div>
                <div style="font-weight: var(--font-weight-semibold); ${stats.cleanSheet ? 'color: var(--color-success);' : ''}">
                  ${stats.cleanSheet ? '✓' : '✗'}
                </div>
              </div>
              <div>
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Goals Against</div>
                <div style="font-weight: var(--font-weight-semibold); ${stats.goalsConceded > 0 ? 'color: var(--color-error);' : ''}">
                  ${stats.goalsConceded}
                </div>
              </div>
              <div>
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Saves</div>
                <div style="font-weight: var(--font-weight-semibold);">${stats.saves}</div>
              </div>
              <div>
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Yellow Cards</div>
                <div style="font-weight: var(--font-weight-semibold); ${stats.yellowCards > 0 ? 'color: var(--color-warning);' : ''}">
                  ${stats.yellowCards}
                </div>
              </div>
              <div>
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-bottom: var(--spacing-xs);">Red Cards</div>
                <div style="font-weight: var(--font-weight-semibold); ${stats.redCards > 0 ? 'color: var(--color-error);' : ''}">
                  ${stats.redCards}
                </div>
              </div>
            </div>
          </div>
        </div>

        ${stats.fixtures && stats.fixtures.length > 0 ? `
          <!-- Fixtures -->
          <div class="card mb-md">
            <div class="card-header">
              <h3 class="card-title" style="font-size: var(--font-size-base);">Fixtures</h3>
            </div>
            <div class="card-body">
              <div class="flex flex-column gap-sm">
                ${stats.fixtures.map((fixture: PlayerFixtureStatsDto) => `
                  <div style="padding: var(--spacing-sm); background: var(--color-surface); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                    <div class="flex flex-between flex-center" style="flex-wrap: wrap; gap: var(--spacing-xs); margin-bottom: var(--spacing-xs);">
                      <div style="font-weight: var(--font-weight-medium); font-size: var(--font-size-sm);">
                        ${fixture.homeTeamName || 'Home'} ${fixture.homeScore} - ${fixture.awayScore} ${fixture.awayTeamName || 'Away'}
                      </div>
                      <div style="font-weight: var(--font-weight-bold); color: var(--color-primary); font-size: var(--font-size-sm);">
                        ${fixture.pointsEarned} pts
                      </div>
                    </div>
                    <div class="text-secondary" style="font-size: var(--font-size-xs);">
                      ${new Date(fixture.kickoff).toLocaleDateString()} • ${fixture.minutesPlayed} min
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Actions -->
        <div class="flex gap-sm" style="justify-content: flex-end; margin-top: var(--spacing-md);">
          <a href="#/players/${player.id}" class="btn btn-primary btn-sm" onclick="document.querySelector('#player-stats-modal')?.remove();">
            View Full Details
          </a>
          <button type="button" class="btn btn-secondary btn-sm" id="close-player-stats-modal-btn">
            Close
          </button>
        </div>
      `;
      
      // Re-attach close handler for footer close button
      const newCloseBtn2 = modal.querySelector('#close-player-stats-modal-btn') as HTMLButtonElement;
      if (newCloseBtn2) {
        newCloseBtn2.addEventListener('click', closeModal);
      }
    }
  } catch (error: any) {
    console.error('Failed to load player stats:', error);
    
    // Update modal with error state
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
      const positionName = player.positionDisplay || getPositionName(player.position);
      const positionAbbr = getPositionAbbr(player.position);
      
      modalBody.innerHTML = `
        <!-- Player Info -->
        <div class="flex flex-center gap-md mb-lg" style="padding: var(--spacing-md); background: var(--color-surface-elevated); border-radius: var(--radius-sm);">
          ${player.pictureUrl ? `
            <img 
              src="${player.pictureUrl}" 
              alt="${player.name || 'Player'}" 
              style="width: 60px; height: 60px; border-radius: var(--radius-md); object-fit: cover; border: 2px solid var(--color-border);"
            >
          ` : `
            <div 
              style="width: 60px; height: 60px; border-radius: var(--radius-md); background: var(--color-surface-elevated); display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold); font-size: var(--font-size-xl); border: 2px solid var(--color-border);"
            >
              ${positionAbbr}
            </div>
          `}
          <div class="flex flex-column" style="flex: 1;">
            <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
              ${player.name || 'Unknown Player'}
            </div>
            <div class="text-secondary" style="font-size: var(--font-size-base);">
              ${player.teamName || 'Unknown Team'} • ${positionName} • £${player.cost.toFixed(1)}m
            </div>
          </div>
        </div>

        <div class="text-center p-xl">
          <p class="text-secondary">Failed to load stats. ${error.message?.includes('404') ? 'No stats available for this gameweek.' : 'Please try again.'}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-sm" style="justify-content: flex-end; margin-top: var(--spacing-md);">
          <a href="#/players/${player.id}" class="btn btn-primary btn-sm" onclick="document.querySelector('#player-stats-modal')?.remove();">
            View Full Details
          </a>
          <button type="button" class="btn btn-secondary btn-sm" id="close-player-stats-modal-btn">
            Close
          </button>
        </div>
      `;
      
      // Re-attach close handler
      const newCloseBtn2 = modal.querySelector('#close-player-stats-modal-btn') as HTMLButtonElement;
      if (newCloseBtn2) {
        newCloseBtn2.addEventListener('click', closeModal);
      }
    }
  }
}

