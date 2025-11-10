import { authService } from '../services/auth.service';
import { router } from '../utils/router';
import { playerService, type PlayerDto, type PlayerFilterDto } from '../services/player.service';
import { renderPlayerCard } from '../components/PlayerCard';

/**
 * Players Page
 * 
 * Displays all players with filtering options.
 */

let allPlayers: PlayerDto[] = [];
let filteredPlayers: PlayerDto[] = [];
let allTeams: { id: number; name: string }[] = [];

/**
 * Render the Players page
 */
export async function renderPlayersPage() {
  const container = document.querySelector('#app');
  if (!container) return;

  const userId = authService.getCurrentUserId();
  if (!userId) {
    router.navigate('/login');
    return;
  }

  // Show loading state
  container.innerHTML = `
    <div class="container">
      <div class="flex flex-between flex-center mb-xl">
        <h1 class="mt-0 mb-0">Players</h1>
        <a href="#/dashboard" class="btn btn-secondary btn-sm">Back to Dashboard</a>
      </div>
      <div id="loading" class="text-center p-2xl">
        <p>Loading players...</p>
      </div>
      <div id="players-content" class="hidden">
        <!-- Filters -->
        <div class="card mb-lg">
          <div class="card-header">
            <h2 class="card-title">Filters</h2>
          </div>
          <div class="card-body">
            <div class="flex flex-wrap gap-md" style="align-items: flex-end;">
              <div class="form-group" style="flex: 1; min-width: 150px;">
                <label for="search-input" class="form-label">Search by Name</label>
                <input 
                  type="text" 
                  id="search-input" 
                  class="form-input" 
                  placeholder="Player name..."
                />
              </div>
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
                  <!-- Teams will be populated -->
                </select>
              </div>
              <div class="form-group" style="flex: 1; min-width: 120px;">
                <label for="min-cost" class="form-label">Min Cost (£m)</label>
                <input 
                  type="number" 
                  id="min-cost" 
                  class="form-input" 
                  placeholder="0.0" 
                  step="0.1" 
                  min="0"
                />
              </div>
              <div class="form-group" style="flex: 1; min-width: 120px;">
                <label for="max-cost" class="form-label">Max Cost (£m)</label>
                <input 
                  type="number" 
                  id="max-cost" 
                  class="form-input" 
                  placeholder="100.0" 
                  step="0.1" 
                  min="0"
                />
              </div>
              <div class="form-group" style="flex: 0 0 auto;">
                <button id="apply-filters-btn" class="btn btn-primary">
                  Apply Filters
                </button>
              </div>
              <div class="form-group" style="flex: 0 0 auto;">
                <button id="clear-filters-btn" class="btn btn-secondary">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Players List -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">
              Players 
              <span id="player-count" class="text-secondary" style="font-size: var(--font-size-base); font-weight: var(--font-weight-normal);">
                (${filteredPlayers.length})
              </span>
            </h2>
          </div>
          <div class="card-body">
            <div id="players-list" class="flex flex-column gap-sm">
              <!-- Players will be rendered here -->
            </div>
            <div id="players-empty" class="hidden text-center p-xl">
              <p class="text-secondary">No players found matching your filters.</p>
            </div>
          </div>
        </div>
      </div>
      <div id="error-message" class="alert alert-error hidden"></div>
    </div>
  `;

  try {
    // Fetch all players
    allPlayers = await playerService.getAllPlayers();
    filteredPlayers = allPlayers;

    // Extract unique teams for filter
    const teamMap = new Map<number, string>();
    allPlayers.forEach(player => {
      if (player.teamId && player.teamName && !teamMap.has(player.teamId)) {
        teamMap.set(player.teamId, player.teamName);
      }
    });
    allTeams = Array.from(teamMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Hide loading, show content
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    const contentDiv = document.querySelector('#players-content') as HTMLDivElement;
    loadingDiv.classList.add('hidden');
    contentDiv.classList.remove('hidden');

    // Populate team filter
    populateTeamFilter();

    // Render initial player list
    renderPlayerList();

    // Attach event listeners
    attachEventListeners();

  } catch (error: any) {
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    loadingDiv.classList.add('hidden');

    const errorDiv = document.querySelector('#error-message') as HTMLDivElement;
    errorDiv.textContent = error.message || 'Failed to load players. Please try again.';
    errorDiv.classList.remove('hidden');

    console.error('Failed to load players:', error);
  }
}

/**
 * Populate team filter dropdown
 */
function populateTeamFilter() {
  const teamFilter = document.querySelector('#team-filter') as HTMLSelectElement;
  if (!teamFilter) return;

  teamFilter.innerHTML = '<option value="">All Teams</option>' +
    allTeams.map(team => `<option value="${team.id}">${team.name}</option>`).join('');
}

/**
 * Render player list
 */
function renderPlayerList() {
  const playersList = document.querySelector('#players-list') as HTMLDivElement;
  const playersEmpty = document.querySelector('#players-empty') as HTMLDivElement;
  const playerCount = document.querySelector('#player-count') as HTMLSpanElement;

  if (!playersList || !playersEmpty || !playerCount) return;

  // Update count
  playerCount.textContent = `(${filteredPlayers.length})`;

  if (filteredPlayers.length === 0) {
    playersList.classList.add('hidden');
    playersEmpty.classList.remove('hidden');
    return;
  }

  playersList.classList.remove('hidden');
  playersEmpty.classList.add('hidden');

  // Render players using PlayerCard component
  // Note: onClick is not needed here since we'll attach click listeners separately
  playersList.innerHTML = filteredPlayers.map(player => 
    renderPlayerCard({
      player,
      isInSquad: false,
      isStarter: false,
      isCaptain: false,
      isViceCaptain: false,
      showRemoveButton: false,
      // Don't pass onClick - we'll handle navigation via event listeners
    })
  ).join('');

  // Attach click listeners to player cards (for future navigation to player details)
  attachPlayerCardListeners();
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
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

  // Allow Enter key to apply filters
  const searchInput = document.querySelector('#search-input') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        applyFilters();
      }
    });
  }
}

/**
 * Attach click listeners to player cards
 */
function attachPlayerCardListeners() {
  // Make player cards clickable to navigate to player details
  document.querySelectorAll('[data-player-id]').forEach(card => {
    card.addEventListener('click', () => {
      const playerId = parseInt(card.getAttribute('data-player-id') || '0');
      if (playerId) {
        router.navigate(`/players/${playerId}`);
      }
    });
    
    // Add hover effect to indicate clickability
    card.style.cursor = 'pointer';
    card.addEventListener('mouseenter', () => {
      (card as HTMLElement).style.opacity = '0.8';
    });
    card.addEventListener('mouseleave', () => {
      (card as HTMLElement).style.opacity = '1';
    });
  });
}

/**
 * Apply filters
 */
async function applyFilters() {
  const searchInput = document.querySelector('#search-input') as HTMLInputElement;
  const positionFilter = document.querySelector('#position-filter') as HTMLSelectElement;
  const teamFilter = document.querySelector('#team-filter') as HTMLSelectElement;
  const minCostInput = document.querySelector('#min-cost') as HTMLInputElement;
  const maxCostInput = document.querySelector('#max-cost') as HTMLInputElement;
  const applyBtn = document.querySelector('#apply-filters-btn') as HTMLButtonElement;

  if (!applyBtn) return;

  // Show loading state
  applyBtn.disabled = true;
  applyBtn.textContent = 'Applying...';

  try {
    // Get filter values
    const searchTerm = searchInput?.value.trim().toLowerCase() || '';
    const position = positionFilter?.value ? parseInt(positionFilter.value) : null;
    const teamId = teamFilter?.value ? parseInt(teamFilter.value) : null;
    const minCost = minCostInput?.value ? parseFloat(minCostInput.value) : null;
    const maxCost = maxCostInput?.value ? parseFloat(maxCostInput.value) : null;

    // Build filters for API
    const filters: PlayerFilterDto = {};
    if (position !== null) filters.position = position;
    if (teamId !== null) filters.teamId = teamId;
    if (minCost !== null) filters.minCost = minCost;
    if (maxCost !== null) filters.maxCost = maxCost;

    // If we have API filters, use search endpoint, otherwise filter client-side
    let players: PlayerDto[] = [];
    
    if (Object.keys(filters).length > 0) {
      // Use API search
      players = await playerService.searchPlayers(filters);
    } else {
      // Use all players
      players = allPlayers;
    }

    // Apply client-side name search if provided
    if (searchTerm) {
      players = players.filter(player => 
        player.name?.toLowerCase().includes(searchTerm)
      );
    }

    filteredPlayers = players;
    renderPlayerList();

  } catch (error: any) {
    console.error('Failed to apply filters:', error);
    alert(error.message || 'Failed to apply filters. Please try again.');
  } finally {
    applyBtn.disabled = false;
    applyBtn.textContent = 'Apply Filters';
  }
}

/**
 * Clear filters
 */
function clearFilters() {
  const searchInput = document.querySelector('#search-input') as HTMLInputElement;
  const positionFilter = document.querySelector('#position-filter') as HTMLSelectElement;
  const teamFilter = document.querySelector('#team-filter') as HTMLSelectElement;
  const minCostInput = document.querySelector('#min-cost') as HTMLInputElement;
  const maxCostInput = document.querySelector('#max-cost') as HTMLInputElement;

  if (searchInput) searchInput.value = '';
  if (positionFilter) positionFilter.value = '';
  if (teamFilter) teamFilter.value = '';
  if (minCostInput) minCostInput.value = '';
  if (maxCostInput) maxCostInput.value = '';

  // Reset to all players
  filteredPlayers = allPlayers;
  renderPlayerList();
}

