import { authService } from '../../services/auth.service';
import { router } from '../../utils/router';
import { playerService, type PlayerDto } from '../../services/player.service';
import { gameweekService } from '../../services/gameweek.service';
import { getPositionName, getPositionAbbr } from '../../utils/squad-validator';

/**
 * Player Details Page
 * 
 * Displays player information and stats for different gameweeks.
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
 * Render the Player Details page
 * @param playerId Player ID from route
 */
export async function renderPlayerDetailsPage(playerId?: number) {
  const container = document.querySelector('#app');
  if (!container) return;

  const userId = authService.getCurrentUserId();
  if (!userId) {
    router.navigate('/login');
    return;
  }

  // Get player ID from route if not provided
  if (!playerId) {
    const route = router.getCurrentRoute();
    const match = route.match(/^\/players\/(\d+)$/);
    if (!match) {
      router.navigate('/players');
      return;
    }
    playerId = parseInt(match[1]);
  }

  // Show loading state
  container.innerHTML = `
    <div class="container">
      <div class="flex flex-between flex-center mb-xl">
        <h1 class="mt-0 mb-0">Player Details</h1>
        <a href="#/players" class="btn btn-secondary btn-sm">Back to Players</a>
      </div>
      <div id="loading" class="text-center p-2xl">
        <p>Loading player...</p>
      </div>
      <div id="player-content" class="hidden">
        <!-- Player details will be rendered here -->
      </div>
      <div id="error-message" class="alert alert-error hidden"></div>
    </div>
  `;

  try {
    // Fetch player details
    const player = await playerService.getPlayer(playerId);

    // Hide loading, show content
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    const contentDiv = document.querySelector('#player-content') as HTMLDivElement;
    loadingDiv.classList.add('hidden');
    contentDiv.classList.remove('hidden');

    // Render player details
    renderPlayerDetails(player);

    // Load gameweeks for stats selector
    loadGameweeksForStats(playerId);

  } catch (error: any) {
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    loadingDiv.classList.add('hidden');

    const errorDiv = document.querySelector('#error-message') as HTMLDivElement;
    
    if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      errorDiv.textContent = 'You do not have access to this player.';
    } else if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      errorDiv.textContent = 'Player not found.';
    } else {
      errorDiv.textContent = error.message || 'Failed to load player. Please try again.';
    }
    errorDiv.classList.remove('hidden');

    console.error('Failed to load player:', error);
  }
}

/**
 * Render player details
 */
function renderPlayerDetails(player: PlayerDto) {
  const contentDiv = document.querySelector('#player-content');
  if (!contentDiv) return;

  const positionName = player.positionDisplay || getPositionName(player.position);
  const positionAbbr = getPositionAbbr(player.position);

  contentDiv.innerHTML = `
    <div class="dashboard-grid">
      <!-- Player Info -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Player Information</h2>
        </div>
        <div class="card-body">
          <div class="flex flex-column gap-md">
            <div class="flex flex-center gap-md">
              ${player.pictureUrl ? `
                <img 
                  src="${player.pictureUrl}" 
                  alt="${player.name || 'Player'}" 
                  style="width: 80px; height: 80px; border-radius: var(--radius-md); object-fit: cover; border: 2px solid var(--color-border);"
                >
              ` : `
                <div 
                  style="width: 80px; height: 80px; border-radius: var(--radius-md); background: var(--color-surface); display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold); font-size: var(--font-size-2xl); border: 2px solid var(--color-border);"
                >
                  ${positionAbbr}
                </div>
              `}
              <div class="flex flex-column" style="flex: 1;">
                <h2 class="mt-0 mb-sm" style="font-size: var(--font-size-2xl);">
                  ${player.name || 'Unknown Player'}
                </h2>
                <div class="text-secondary" style="font-size: var(--font-size-lg);">
                  ${player.teamName || 'Unknown Team'} • ${positionName}
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-md" style="margin-top: var(--spacing-md);">
              <div style="flex: 1; min-width: 150px;">
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Player Number
                </div>
                <div style="font-weight: var(--font-weight-medium); font-size: var(--font-size-lg);">
                  #${player.playerNum}
                </div>
              </div>
              <div style="flex: 1; min-width: 150px;">
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Cost
                </div>
                <div style="font-weight: var(--font-weight-bold); font-size: var(--font-size-xl);">
                  £${player.cost.toFixed(1)}m
                </div>
              </div>
              ${player.school ? `
                <div style="flex: 1; min-width: 150px;">
                  <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                    School
                  </div>
                  <div style="font-weight: var(--font-weight-medium);">
                    ${player.school}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="card mt-lg">
      <div class="card-header">
        <h2 class="card-title">Gameweek Stats</h2>
        <div class="flex gap-sm">
          <select id="gameweek-select" class="form-input" style="min-width: 200px;">
            <option value="">Loading gameweeks...</option>
          </select>
        </div>
      </div>
      <div class="card-body">
        <div id="stats-container">
          <p class="text-secondary text-center">Select a gameweek to view stats.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Load gameweeks for stats dropdown
 */
async function loadGameweeksForStats(playerId: number) {
  const gameweekSelect = document.querySelector('#gameweek-select') as HTMLSelectElement;
  if (!gameweekSelect) return;

  try {
    const gameweeks = await gameweekService.getAllGameweeks();
    
    if (gameweeks.length === 0) {
      gameweekSelect.innerHTML = '<option value="">No gameweeks available</option>';
      return;
    }

    // Get current gameweek
    let currentGameweekId: number | null = null;
    try {
      const currentGameweek = await gameweekService.getCurrentGameweek();
      currentGameweekId = currentGameweek.id;
    } catch {
      // No current gameweek
    }

    // Populate dropdown
    gameweekSelect.innerHTML = '<option value="">Select a gameweek...</option>' +
      gameweeks.map((gw: any) => `
        <option value="${gw.id}" ${gw.id === currentGameweekId ? 'selected' : ''}>
          Gameweek ${gw.id}${gw.isComplete ? ' (Complete)' : ''}
        </option>
      `).join('');

    // If current gameweek exists, load its stats
    if (currentGameweekId) {
      await loadPlayerStats(playerId, currentGameweekId);
    }
  } catch (error: any) {
    console.error('Failed to load gameweeks:', error);
    gameweekSelect.innerHTML = '<option value="">Failed to load gameweeks</option>';
  }

  // Attach event listener for gameweek selection
  gameweekSelect.addEventListener('change', async (e) => {
    const selectedGameweekId = parseInt((e.target as HTMLSelectElement).value);
    if (selectedGameweekId) {
      await loadPlayerStats(playerId, selectedGameweekId);
    } else {
      const statsContainer = document.querySelector('#stats-container');
      if (statsContainer) {
        statsContainer.innerHTML = '<p class="text-secondary text-center">Select a gameweek to view stats.</p>';
      }
    }
  });
}

/**
 * Load player stats for a gameweek
 */
async function loadPlayerStats(playerId: number, gameweekId: number) {
  const statsContainer = document.querySelector('#stats-container');
  if (!statsContainer) return;

  statsContainer.innerHTML = '<p class="text-center">Loading stats...</p>';

  try {
    const stats = await playerService.getPlayerStats(playerId, gameweekId) as PlayerStatsDto;

    // Determine player position context (for conditional stats display)
    // We'll show all stats, but style them appropriately based on relevance
    
    // Render stats
    statsContainer.innerHTML = `
      <div class="flex flex-column gap-md">
        <!-- Points Earned (Highlighted) -->
        <div style="padding: var(--spacing-lg); background: var(--color-surface); border-radius: var(--radius-md); border: 2px solid var(--color-primary);">
          <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
            Points Earned (Gameweek ${gameweekId})
          </div>
          <div style="font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--color-primary);">
            ${stats.pointsEarned}
          </div>
        </div>

        <!-- Main Stats Grid -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="font-size: var(--font-size-lg);">Overall Stats</h3>
          </div>
          <div class="card-body">
            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md);">
              <div>
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Minutes Played
                </div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                  ${stats.minutesPlayed}
                </div>
              </div>

              <div>
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Goals
                </div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-success);">
                  ${stats.goals}
                </div>
              </div>

              <div>
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Assists
                </div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-success);">
                  ${stats.assists}
                </div>
              </div>

              <div style="${stats.cleanSheet ? 'border: 2px solid var(--color-success); border-radius: var(--radius-sm); padding: var(--spacing-sm);' : ''}">
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Clean Sheet
                </div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); ${stats.cleanSheet ? 'color: var(--color-success);' : ''}">
                  ${stats.cleanSheet ? '✓' : '✗'}
                </div>
              </div>

              <div>
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Goals Conceded
                </div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); ${stats.goalsConceded > 0 ? 'color: var(--color-error);' : ''}">
                  ${stats.goalsConceded}
                </div>
              </div>

              <div>
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Saves
                </div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                  ${stats.saves}
                </div>
              </div>

              <div>
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Shots
                </div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                  ${stats.shots || 0}
                </div>
              </div>

              <div>
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Shots on Target
                </div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                  ${stats.shotsOnGoal || 0}
                </div>
              </div>

              <div>
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Yellow Cards
                </div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); ${stats.yellowCards > 0 ? 'color: var(--color-warning);' : ''}">
                  ${stats.yellowCards}
                </div>
              </div>

              <div>
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Red Cards
                </div>
                <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); ${stats.redCards > 0 ? 'color: var(--color-error);' : ''}">
                  ${stats.redCards}
                </div>
              </div>
            </div>
          </div>
        </div>

        ${stats.fixtures && stats.fixtures.length > 0 ? `
          <!-- Fixtures Breakdown -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="font-size: var(--font-size-lg);">Fixture Breakdown</h3>
            </div>
            <div class="card-body">
              <div class="flex flex-column gap-md">
                ${stats.fixtures.map((fixture: PlayerFixtureStatsDto) => `
                  <div style="padding: var(--spacing-md); background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
                    <div class="flex flex-between flex-center mb-md" style="flex-wrap: wrap; gap: var(--spacing-sm);">
                      <div style="flex: 1; min-width: 200px;">
                        <div style="font-weight: var(--font-weight-bold); font-size: var(--font-size-lg); margin-bottom: var(--spacing-xs);">
                          ${fixture.homeTeamName || 'Home'} ${fixture.homeScore} - ${fixture.awayScore} ${fixture.awayTeamName || 'Away'}
                        </div>
                        <div class="text-secondary" style="font-size: var(--font-size-sm);">
                          ${new Date(fixture.kickoff).toLocaleDateString()} ${new Date(fixture.kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div style="font-weight: var(--font-weight-bold); font-size: var(--font-size-xl); color: var(--color-primary);">
                        ${fixture.pointsEarned} pts
                      </div>
                    </div>
                    <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--spacing-sm); margin-top: var(--spacing-md);">
                      <div>
                        <div class="text-secondary" style="font-size: var(--font-size-xs);">Min</div>
                        <div style="font-weight: var(--font-weight-semibold);">${fixture.minutesPlayed}</div>
                      </div>
                      <div>
                        <div class="text-secondary" style="font-size: var(--font-size-xs);">Goals</div>
                        <div style="font-weight: var(--font-weight-semibold); color: var(--color-success);">${fixture.goals}</div>
                      </div>
                      <div>
                        <div class="text-secondary" style="font-size: var(--font-size-xs);">Assists</div>
                        <div style="font-weight: var(--font-weight-semibold); color: var(--color-success);">${fixture.assists}</div>
                      </div>
                      <div>
                        <div class="text-secondary" style="font-size: var(--font-size-xs);">Shots</div>
                        <div style="font-weight: var(--font-weight-semibold);">${fixture.shots || 0}</div>
                      </div>
                      <div>
                        <div class="text-secondary" style="font-size: var(--font-size-xs);">On Target</div>
                        <div style="font-weight: var(--font-weight-semibold);">${fixture.shotsOnGoal || 0}</div>
                      </div>
                      ${fixture.cleanSheet ? `
                        <div>
                          <div class="text-secondary" style="font-size: var(--font-size-xs);">Clean Sheet</div>
                          <div style="font-weight: var(--font-weight-semibold); color: var(--color-success);">✓</div>
                        </div>
                      ` : ''}
                      ${fixture.goalsConceded > 0 ? `
                        <div>
                          <div class="text-secondary" style="font-size: var(--font-size-xs);">Goals Against</div>
                          <div style="font-weight: var(--font-weight-semibold); color: var(--color-error);">${fixture.goalsConceded}</div>
                        </div>
                      ` : ''}
                      ${fixture.saves > 0 ? `
                        <div>
                          <div class="text-secondary" style="font-size: var(--font-size-xs);">Saves</div>
                          <div style="font-weight: var(--font-weight-semibold);">${fixture.saves}</div>
                        </div>
                      ` : ''}
                      ${fixture.yellowCards > 0 ? `
                        <div>
                          <div class="text-secondary" style="font-size: var(--font-size-xs);">Yellow</div>
                          <div style="font-weight: var(--font-weight-semibold); color: var(--color-warning);">${fixture.yellowCards}</div>
                        </div>
                      ` : ''}
                      ${fixture.redCards > 0 ? `
                        <div>
                          <div class="text-secondary" style="font-size: var(--font-size-xs);">Red</div>
                          <div style="font-weight: var(--font-weight-semibold); color: var(--color-error);">${fixture.redCards}</div>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } catch (error: any) {
    console.error('Failed to load player stats:', error);
    
    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      statsContainer.innerHTML = '<p class="text-secondary text-center">No stats available for this gameweek.</p>';
    } else {
      statsContainer.innerHTML = '<p class="text-secondary text-center text-error">Failed to load stats. Please try again.</p>';
    }
  }
}

