import { authService } from '../services/auth.service';
import { router } from '../utils/router';
import { gameweekService } from '../services/gameweek.service';
import { playerService } from '../services/player.service';
import type { PlayerDto } from '../services/player.service';
import { squadService } from '../services/squad.service';
import { validateSquad, getPositionName } from '../utils/squad-validator';
import { renderPlayerCard } from '../components/PlayerCard';

/**
 * Squad Builder Page
 * 
 * Allows users to create and edit their squad for a specific gameweek.
 */

interface SquadState {
  players: PlayerDto[];
  starterIds: number[];
  captainId: number | null;
  viceCaptainId: number | null;
  gameweekId: number;
  budget: number;
}

let squadState: SquadState = {
  players: [],
  starterIds: [],
  captainId: null,
  viceCaptainId: null,
  gameweekId: 1,
  budget: 100,
};

let allPlayers: PlayerDto[] = [];
let filteredPlayers: PlayerDto[] = [];
let allTeams: { id: number; name: string }[] = [];

/**
 * Render the Squad Builder page
 * @param gameweekId Optional gameweek ID (defaults to current gameweek)
 */
export async function renderSquadPage(gameweekId?: number) {
  const container = document.querySelector('#app');
  if (!container) return;

  const userId = authService.getCurrentUserId();
  if (!userId) {
    router.navigate('/login');
    return;
  }

  // Get gameweek ID
  if (!gameweekId) {
    try {
      const currentGameweek = await gameweekService.getCurrentGameweek();
      gameweekId = currentGameweek.id;
    } catch {
      gameweekId = 1; // Fallback
    }
  }

  // Ensure gameweekId is always a number (TypeScript guard)
  const resolvedGameweekId: number = gameweekId ?? 1;
  squadState.gameweekId = resolvedGameweekId;

  // Show loading state
  container.innerHTML = `
    <div class="container">
      <div class="flex flex-between flex-center mb-xl">
        <h1 class="mt-0 mb-0">Squad Builder - Gameweek ${resolvedGameweekId}</h1>
        <a href="#/dashboard" class="btn btn-secondary btn-sm">Back to Dashboard</a>
      </div>
      <div id="loading" class="text-center p-2xl">
        <p>Loading players...</p>
      </div>
      <div id="squad-content" class="hidden"></div>
    </div>
  `;

  try {
    // Fetch players and existing squad
    const [players, existingSquad] = await Promise.all([
      playerService.getAllPlayers(),
      squadService.getUserSquadForGameweek(userId, resolvedGameweekId).catch(() => null),
    ]);

    allPlayers = players;
    filteredPlayers = players;
    
    // Extract unique teams for filter
    const teamMap = new Map<number, string>();
    players.forEach(player => {
      if (player.teamId && player.teamName && !teamMap.has(player.teamId)) {
        teamMap.set(player.teamId, player.teamName);
      }
    });
    allTeams = Array.from(teamMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Initialize squad state from existing squad or empty
    if (existingSquad && existingSquad.players) {
      squadState.players = existingSquad.players.map((sp: any) => {
        const player = players.find(p => p.id === sp.playerId);
        return player!;
      }).filter(Boolean);
      squadState.starterIds = existingSquad.players
        .filter((sp: any) => sp.isStarter)
        .map((sp: any) => sp.playerId);
      const captain = existingSquad.players.find((sp: any) => sp.isCaptain);
      const vice = existingSquad.players.find((sp: any) => sp.isVice);
      squadState.captainId = captain?.playerId || null;
      squadState.viceCaptainId = vice?.playerId || null;
    } else {
      squadState.players = [];
      squadState.starterIds = [];
      squadState.captainId = null;
      squadState.viceCaptainId = null;
    }

    // Hide loading, show content
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    const contentDiv = document.querySelector('#squad-content') as HTMLDivElement;
    loadingDiv.classList.add('hidden');
    contentDiv.classList.remove('hidden');

    renderSquadBuilder();
  } catch (error: any) {
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    loadingDiv.classList.add('hidden');
    
    const contentDiv = document.querySelector('#squad-content') as HTMLDivElement;
    contentDiv.innerHTML = `
      <div class="alert alert-error">
        Failed to load squad builder: ${error.message || 'Unknown error'}
      </div>
    `;
  }
}

/**
 * Render the squad builder interface
 */
function renderSquadBuilder() {
  const contentDiv = document.querySelector('#squad-content');
  if (!contentDiv) return;

  const totalCost = squadState.players.reduce((sum, p) => sum + p.cost, 0);
  const remainingBudget = squadState.budget - totalCost;

  // Group players by position
  const squadByPosition = {
    1: squadState.players.filter(p => p.position === 1),
    2: squadState.players.filter(p => p.position === 2),
    3: squadState.players.filter(p => p.position === 3),
    4: squadState.players.filter(p => p.position === 4),
  };

  contentDiv.innerHTML = `
    <div class="dashboard-grid">
      <!-- Squad Summary -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Squad Summary</h2>
        </div>
        <div class="card-body">
          <div class="flex flex-column gap-md">
            <div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">Budget</div>
              <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                £${remainingBudget.toFixed(1)}m / £${squadState.budget}m
              </div>
            </div>
            <div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">Players</div>
              <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                ${squadState.players.length} / 15
              </div>
            </div>
            <div>
              <div class="text-secondary" style="font-size: var(--font-size-sm);">Starters</div>
              <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                ${squadState.starterIds.length} / 11
              </div>
            </div>
            <div id="validation-errors" class="alert alert-error hidden"></div>
            ${squadState.starterIds.length > 0 ? `
              <div class="mb-md">
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Starters (${squadState.starterIds.length}/11):
                </div>
                <div class="flex flex-column gap-xs">
                  ${squadState.starterIds.map(playerId => {
                    const player = squadState.players.find(p => p.id === playerId);
                    if (!player) return '';
                    const isCaptain = squadState.captainId === playerId;
                    const isVice = squadState.viceCaptainId === playerId;
                    return `
                      <div class="flex flex-between flex-center" style="padding: var(--spacing-xs) var(--spacing-sm); background: var(--color-surface); border-radius: var(--radius-sm);">
                        <div class="flex flex-center gap-sm">
                          <span>${player.name || 'Unknown'}</span>
                          ${isCaptain ? '<span class="badge badge-captain">C</span>' : ''}
                          ${isVice ? '<span class="badge badge-vice">V</span>' : ''}
                        </div>
                        <div class="flex gap-xs">
                          <button 
                            class="btn btn-secondary btn-sm" 
                            data-set-captain="${playerId}"
                            title="Set as captain"
                            ${isCaptain ? 'disabled' : ''}
                          >
                            C
                          </button>
                          <button 
                            class="btn btn-secondary btn-sm" 
                            data-set-vice="${playerId}"
                            title="Set as vice-captain"
                            ${isVice ? 'disabled' : ''}
                          >
                            V
                          </button>
                          <button 
                            class="btn btn-danger btn-sm" 
                            data-remove-starter="${playerId}"
                            title="Remove from starters"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}
            <div class="text-secondary" style="font-size: var(--font-size-sm); margin-top: var(--spacing-md); padding: var(--spacing-sm); background: var(--color-surface); border-radius: var(--radius-sm);">
              <strong>How to use:</strong><br>
              • Click a player to add to squad<br>
              • Click × button on squad player to remove<br>
              • Click a squad player to add to starters<br>
              • Use buttons to set captain/vice-captain or remove from starters
            </div>
            <button id="save-squad-btn" class="btn btn-primary">
              Save Squad
            </button>
          </div>
        </div>
      </div>

      <!-- Squad Formation -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">My Squad</h2>
        </div>
        <div class="card-body">
          <div class="flex flex-column gap-md">
            ${[1, 2, 3, 4].map(position => `
              <div>
                <h3 style="font-size: var(--font-size-lg); margin-bottom: var(--spacing-sm);">
                  ${getPositionName(position)} (${squadByPosition[position as keyof typeof squadByPosition].length})
                </h3>
                <div id="squad-position-${position}" class="flex flex-column gap-sm">
                  ${squadByPosition[position as keyof typeof squadByPosition].map(player => {
                    const isStarter = squadState.starterIds.includes(player.id);
                    const isCaptain = squadState.captainId === player.id;
                    const isVice = squadState.viceCaptainId === player.id;
                    return renderPlayerCard({
                      player,
                      isInSquad: true,
                      isStarter,
                      isCaptain,
                      isViceCaptain: isVice,
                      showRemoveButton: true,
                      onRemove: () => removePlayerFromSquad(player.id),
                    });
                  }).join('')}
                </div>
              </div>
            `).join('')}
            ${squadState.players.length === 0 ? `
              <p class="text-secondary text-center">No players in squad yet. Add players from the list below.</p>
            ` : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Player Search and List -->
    <div class="card mt-lg">
      <div class="card-header">
        <h2 class="card-title">Available Players</h2>
      </div>
      <div class="card-body">
        <div class="form" style="margin-bottom: var(--spacing-lg);">
          <div class="form-group">
            <label for="player-search" class="form-label">Search</label>
            <input 
              type="text" 
              id="player-search" 
              class="form-input"
              placeholder="Search players by name..."
            >
          </div>
          <div class="flex gap-md" style="flex-wrap: wrap;">
            <div class="form-group" style="flex: 1; min-width: 150px;">
              <label for="position-filter" class="form-label">Position</label>
              <select id="position-filter" class="form-input">
                <option value="">All Positions</option>
                <option value="1">Goalkeeper</option>
                <option value="2">Defender</option>
                <option value="3">Midfielder</option>
                <option value="4">Forward</option>
              </select>
            </div>
            <div class="form-group" style="flex: 1; min-width: 150px;">
              <label for="team-filter" class="form-label">Team</label>
              <select id="team-filter" class="form-input">
                <option value="">All Teams</option>
                ${allTeams.map(team => `
                  <option value="${team.id}">${team.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group" style="flex: 1; min-width: 120px;">
              <label for="min-cost-filter" class="form-label">Min Cost (£m)</label>
              <input 
                type="number" 
                id="min-cost-filter" 
                class="form-input"
                placeholder="Min"
                step="0.1"
                min="0"
              >
            </div>
            <div class="form-group" style="flex: 1; min-width: 120px;">
              <label for="max-cost-filter" class="form-label">Max Cost (£m)</label>
              <input 
                type="number" 
                id="max-cost-filter" 
                class="form-input"
                placeholder="Max"
                step="0.1"
                min="0"
              >
            </div>
          </div>
          <button id="apply-filters-btn" class="btn btn-primary btn-sm">
            Apply Filters
          </button>
          <button id="clear-filters-btn" class="btn btn-secondary btn-sm" style="margin-left: var(--spacing-sm);">
            Clear Filters
          </button>
        </div>
        <div id="player-list" class="flex flex-column gap-sm">
          ${filteredPlayers.map(player => {
            const isInSquad = squadState.players.some(p => p.id === player.id);
            return renderPlayerCard({
              player,
              isInSquad,
              onClick: isInSquad ? undefined : () => addPlayerToSquad(player),
            });
          }).join('')}
          ${filteredPlayers.length === 0 ? `
            <p class="text-secondary text-center">No players found matching your filters.</p>
          ` : ''}
        </div>
        <div id="filter-loading" class="hidden text-center" style="padding: var(--spacing-md);">
          <p>Filtering players...</p>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  attachSquadBuilderEvents();
  
  // Initialize player list listeners
  attachPlayerCardListeners();
}

/**
 * Attach event listeners to squad builder
 */
function attachSquadBuilderEvents() {
  // Apply filters button
  const applyFiltersBtn = document.querySelector('#apply-filters-btn') as HTMLButtonElement;
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }

  // Clear filters button
  const clearFiltersBtn = document.querySelector('#clear-filters-btn') as HTMLButtonElement;
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearFilters);
  }

  // Remove player buttons
  document.querySelectorAll('[data-remove-player-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const playerId = parseInt(btn.getAttribute('data-remove-player-id') || '0');
      removePlayerFromSquad(playerId);
    });
  });

  // Starter management buttons
  document.querySelectorAll('[data-remove-starter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const playerId = parseInt(btn.getAttribute('data-remove-starter') || '0');
      removeFromStarters(playerId);
    });
  });

  document.querySelectorAll('[data-set-captain]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const playerId = parseInt(btn.getAttribute('data-set-captain') || '0');
      setCaptain(playerId);
    });
  });

  document.querySelectorAll('[data-set-vice]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const playerId = parseInt(btn.getAttribute('data-set-vice') || '0');
      setViceCaptain(playerId);
    });
  });

  // Player cards - add to squad (only for available players, not in squad)
  document.querySelectorAll('[data-player-id]').forEach(card => {
    const playerId = parseInt(card.getAttribute('data-player-id') || '0');
    const player = allPlayers.find(p => p.id === playerId);
    const isInSquad = squadState.players.some(p => p.id === playerId);
    
    // Only attach click handler for players not in squad
    if (player && !isInSquad) {
      card.addEventListener('click', () => addPlayerToSquad(player));
    }
    
    // Squad players can be clicked to add to starters
    if (player && isInSquad) {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking on remove button
        if ((e.target as HTMLElement).closest('[data-remove-player-id]')) {
          return;
        }
        const isStarter = squadState.starterIds.includes(playerId);
        if (!isStarter && squadState.starterIds.length < 11) {
          squadState.starterIds.push(playerId);
          renderSquadBuilder();
        }
      });
    }
  });

  // Save squad button
  const saveBtn = document.querySelector('#save-squad-btn') as HTMLButtonElement;
  if (saveBtn) {
    saveBtn.addEventListener('click', saveSquad);
  }
}

/**
 * Apply filters and search players using API
 */
async function applyFilters() {
  const searchInput = document.querySelector('#player-search') as HTMLInputElement;
  const positionFilter = document.querySelector('#position-filter') as HTMLSelectElement;
  const teamFilter = document.querySelector('#team-filter') as HTMLSelectElement;
  const minCostFilter = document.querySelector('#min-cost-filter') as HTMLInputElement;
  const maxCostFilter = document.querySelector('#max-cost-filter') as HTMLInputElement;
  const filterLoading = document.querySelector('#filter-loading') as HTMLDivElement;
  const playerList = document.querySelector('#player-list') as HTMLDivElement;

  const searchQuery = searchInput?.value || '';
  const position = positionFilter?.value ? parseInt(positionFilter.value) : null;
  const teamId = teamFilter?.value ? parseInt(teamFilter.value) : null;
  const minCost = minCostFilter?.value ? parseFloat(minCostFilter.value) : null;
  const maxCost = maxCostFilter?.value ? parseFloat(maxCostFilter.value) : null;

  // Show loading state
  if (filterLoading) filterLoading.classList.remove('hidden');
  if (playerList) playerList.classList.add('hidden');

  // Build filter object
  const filters: any = {};
  if (position !== null) filters.position = position;
  if (teamId !== null) filters.teamId = teamId;
  if (minCost !== null) filters.minCost = minCost;
  if (maxCost !== null) filters.maxCost = maxCost;

  try {
    // Use API search if we have filters, otherwise filter locally
    if (Object.keys(filters).length > 0) {
      filteredPlayers = await playerService.searchPlayers(filters);
    } else {
      filteredPlayers = allPlayers;
    }

    // Apply search query filter locally (name search)
    if (searchQuery) {
      filteredPlayers = filteredPlayers.filter(player => 
        player.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Hide loading, show results
    if (filterLoading) filterLoading.classList.add('hidden');
    if (playerList) playerList.classList.remove('hidden');

    // Re-render player list
    renderPlayerList();
  } catch (error: any) {
    console.error('Failed to filter players:', error);
    // Fallback to local filtering
    filteredPlayers = allPlayers.filter(player => {
      const matchesQuery = !searchQuery || player.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition = !position || player.position === position;
      const matchesTeam = !teamId || player.teamId === teamId;
      const matchesMinCost = !minCost || player.cost >= minCost;
      const matchesMaxCost = !maxCost || player.cost <= maxCost;
      return matchesQuery && matchesPosition && matchesTeam && matchesMinCost && matchesMaxCost;
    });
    
    // Hide loading, show results
    if (filterLoading) filterLoading.classList.add('hidden');
    if (playerList) playerList.classList.remove('hidden');
    
    renderPlayerList();
  }
}

/**
 * Clear all filters
 */
function clearFilters() {
  const searchInput = document.querySelector('#player-search') as HTMLInputElement;
  const positionFilter = document.querySelector('#position-filter') as HTMLSelectElement;
  const teamFilter = document.querySelector('#team-filter') as HTMLSelectElement;
  const minCostFilter = document.querySelector('#min-cost-filter') as HTMLInputElement;
  const maxCostFilter = document.querySelector('#max-cost-filter') as HTMLInputElement;

  if (searchInput) searchInput.value = '';
  if (positionFilter) positionFilter.value = '';
  if (teamFilter) teamFilter.value = '';
  if (minCostFilter) minCostFilter.value = '';
  if (maxCostFilter) maxCostFilter.value = '';

  filteredPlayers = allPlayers;
  renderPlayerList();
}

/**
 * Render the player list
 */
function renderPlayerList() {
  const playerList = document.querySelector('#player-list');
  if (playerList) {
    playerList.innerHTML = filteredPlayers.map(player => {
      const isInSquad = squadState.players.some(p => p.id === player.id);
      return renderPlayerCard({
        player,
        isInSquad,
        onClick: isInSquad ? undefined : () => addPlayerToSquad(player),
      });
    }).join('') || '<p class="text-secondary text-center">No players found matching your filters.</p>';

    // Re-attach click handlers
    attachPlayerCardListeners();
  }
}

/**
 * Attach event listeners to player cards
 */
function attachPlayerCardListeners() {
  document.querySelectorAll('[data-player-id]').forEach(card => {
    const playerId = parseInt(card.getAttribute('data-player-id') || '0');
    const player = allPlayers.find(p => p.id === playerId);
    const isInSquad = squadState.players.some(p => p.id === playerId);
    
    if (player && !isInSquad) {
      card.addEventListener('click', () => addPlayerToSquad(player));
    } else if (player && isInSquad) {
      // Squad players can be clicked to add to starters
      card.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('[data-remove-player-id]')) {
          return;
        }
        const isStarter = squadState.starterIds.includes(playerId);
        if (!isStarter && squadState.starterIds.length < 11) {
          squadState.starterIds.push(playerId);
          renderSquadBuilder();
        }
      });
    }
  });
}

/**
 * Add a player to the squad
 */
function addPlayerToSquad(player: PlayerDto) {
  if (squadState.players.length >= 15) {
    alert('Squad is full! Remove a player first.');
    return;
  }

  if (squadState.players.some(p => p.id === player.id)) {
    return; // Already in squad
  }

  squadState.players.push(player);
  renderSquadBuilder();
}

/**
 * Remove a player from the squad
 */
function removePlayerFromSquad(playerId: number) {
  squadState.players = squadState.players.filter(p => p.id !== playerId);
  squadState.starterIds = squadState.starterIds.filter(id => id !== playerId);
  if (squadState.captainId === playerId) {
    squadState.captainId = null;
  }
  if (squadState.viceCaptainId === playerId) {
    squadState.viceCaptainId = null;
  }
  renderSquadBuilder();
}

/**
 * Remove a player from starters
 */
function removeFromStarters(playerId: number) {
  squadState.starterIds = squadState.starterIds.filter(id => id !== playerId);
  if (squadState.captainId === playerId) {
    squadState.captainId = null;
  }
  if (squadState.viceCaptainId === playerId) {
    squadState.viceCaptainId = null;
  }
  renderSquadBuilder();
}

/**
 * Set captain
 */
function setCaptain(playerId: number) {
  if (!squadState.starterIds.includes(playerId)) {
    alert('Captain must be a starter!');
    return;
  }
  squadState.captainId = playerId;
  // If this player was vice-captain, clear it
  if (squadState.viceCaptainId === playerId) {
    squadState.viceCaptainId = null;
  }
  renderSquadBuilder();
}

/**
 * Set vice-captain
 */
function setViceCaptain(playerId: number) {
  if (!squadState.starterIds.includes(playerId)) {
    alert('Vice-captain must be a starter!');
    return;
  }
  squadState.viceCaptainId = playerId;
  // If this player was captain, clear it and make them vice
  if (squadState.captainId === playerId) {
    squadState.captainId = null;
  }
  renderSquadBuilder();
}

/**
 * Save the squad
 */
async function saveSquad() {
  const userId = authService.getCurrentUserId();
  if (!userId) {
    router.navigate('/login');
    return;
  }

  // Validate squad
  const validation = validateSquad(squadState.players, squadState.starterIds, squadState.budget);
  
  const errorDiv = document.querySelector('#validation-errors') as HTMLDivElement;
  if (!validation.isValid) {
    errorDiv.innerHTML = validation.errors.map(err => `<div>${err}</div>`).join('');
    errorDiv.classList.remove('hidden');
    return;
  }

  errorDiv.classList.add('hidden');

  // Ensure captain and vice are starters
  if (squadState.captainId && !squadState.starterIds.includes(squadState.captainId)) {
    alert('Captain must be a starter!');
    return;
  }
  if (squadState.viceCaptainId && !squadState.starterIds.includes(squadState.viceCaptainId)) {
    alert('Vice-captain must be a starter!');
    return;
  }

  const saveBtn = document.querySelector('#save-squad-btn') as HTMLButtonElement;
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const squadData = {
      gameweekId: squadState.gameweekId,
      playerIds: squadState.players.map(p => p.id),
      starterIds: squadState.starterIds,
      captainId: squadState.captainId!,
      viceCaptainId: squadState.viceCaptainId!,
    };

    // Check if squad exists (update) or create new
    try {
      const existingSquad = await squadService.getUserSquadForGameweek(userId, squadState.gameweekId);
      await squadService.updateSquad(existingSquad.id, squadData);
    } catch {
      // Squad doesn't exist, create new
      await squadService.createSquad(userId, squadData);
    }

    // Success - redirect to dashboard
    alert('Squad saved successfully!');
    router.navigate('/dashboard');
  } catch (error: any) {
    errorDiv.textContent = error.message || 'Failed to save squad. Please try again.';
    errorDiv.classList.remove('hidden');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Squad';
  }
}

