import { authService } from '../services/auth.service';
import { router } from '../utils/router';
import { leagueService } from '../services/league.service';
import { gameweekService } from '../services/gameweek.service';

/**
 * League Details Page
 * 
 * Displays league information, members, and standings.
 */

interface LeagueDetailsDto {
  id: number;
  owner: number;
  ownerUsername?: string | null;
  type: boolean; // true = private, false = public
  members?: LeagueMemberDto[] | null;
}

interface LeagueMemberDto {
  userId: number;
  username?: string | null;
  school?: string | null;
}

/**
 * Render the League Details page
 * @param leagueId League ID from route
 */
export async function renderLeagueDetailsPage(leagueId?: number) {
  const container = document.querySelector('#app');
  if (!container) return;

  const userId = authService.getCurrentUserId();
  if (!userId) {
    router.navigate('/login');
    return;
  }

  // Get league ID from route if not provided
  if (!leagueId) {
    const route = router.getCurrentRoute();
    const match = route.match(/^\/leagues\/(\d+)$/);
    if (!match) {
      router.navigate('/leagues');
      return;
    }
    leagueId = parseInt(match[1]);
  }

  // Show loading state
  container.innerHTML = `
    <div class="container">
      <div class="flex flex-between flex-center mb-xl">
        <h1 class="mt-0 mb-0">League Details</h1>
        <a href="#/leagues" class="btn btn-secondary btn-sm">Back to Leagues</a>
      </div>
      <div id="loading" class="text-center p-2xl">
        <p>Loading league...</p>
      </div>
      <div id="league-content" class="hidden">
        <!-- League details will be rendered here -->
      </div>
      <div id="error-message" class="alert alert-error hidden"></div>
    </div>
  `;

  try {
    // Fetch league details
    const leagueDetails = await leagueService.getLeagueDetails(leagueId);

    // Hide loading, show content
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    const contentDiv = document.querySelector('#league-content') as HTMLDivElement;
    loadingDiv.classList.add('hidden');
    contentDiv.classList.remove('hidden');

    // Check if user is owner
    const isOwner = leagueDetails.owner === userId;
    
    // Check if user is a member
    // Owner might not be in members array, so check both
    const isMember = isOwner || (leagueDetails.members?.some((m: LeagueMemberDto) => m.userId === userId) || false);
    
    // Calculate member count: include owner if not in members array
    const memberCount = leagueDetails.members?.length || 0;
    const ownerInMembers = leagueDetails.members?.some((m: LeagueMemberDto) => m.userId === leagueDetails.owner) || false;
    const actualMemberCount = ownerInMembers ? memberCount : memberCount + 1;

    // Render league details
    renderLeagueDetails(leagueDetails as LeagueDetailsDto, userId, isOwner, isMember, actualMemberCount);

  } catch (error: any) {
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    loadingDiv.classList.add('hidden');

    const errorDiv = document.querySelector('#error-message') as HTMLDivElement;
    
    if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      errorDiv.textContent = 'You do not have access to this league.';
    } else if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      errorDiv.textContent = 'League not found.';
    } else {
      errorDiv.textContent = error.message || 'Failed to load league. Please try again.';
    }
    errorDiv.classList.remove('hidden');

    console.error('Failed to load league:', error);
  }
}

/**
 * Render league details
 */
function renderLeagueDetails(
  league: LeagueDetailsDto,
  userId: number,
  isOwner: boolean,
  isMember: boolean,
  memberCount: number
) {
  const contentDiv = document.querySelector('#league-content');
  if (!contentDiv) return;

  // Backend: true = public, false = private
  const leagueType = league.type ? 'Public' : 'Private';
  const typeBadgeClass = league.type ? 'badge badge-starter' : 'badge'; // Use success color for public

  contentDiv.innerHTML = `
    <div class="dashboard-grid">
      <!-- League Info -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">League Information</h2>
        </div>
        <div class="card-body">
          <div class="flex flex-column gap-md">
            <div>
              <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                League ID
              </div>
              <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                League #${league.id}
              </div>
            </div>
            <div>
              <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                Type
              </div>
              <div>
                <span class="${typeBadgeClass}">${leagueType}</span>
              </div>
            </div>
            <div>
              <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                Owner
              </div>
              <div style="font-weight: var(--font-weight-medium);">
                ${league.ownerUsername || `User #${league.owner}`}
              </div>
            </div>
            <div>
              <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                Members
              </div>
              <div style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold);">
                ${memberCount}
              </div>
            </div>
            ${!league.type ? `
              <div style="padding: var(--spacing-md); background: var(--color-surface); border-radius: var(--radius-sm); border: 1px solid var(--color-border);">
                <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
                  Share League ID
                </div>
                <div style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); font-family: monospace; word-break: break-all; user-select: all;">
                  ${league.id}
                </div>
                <div class="text-secondary" style="font-size: var(--font-size-xs); margin-top: var(--spacing-xs);">
                  Share this ID with others so they can join your private league.
                </div>
              </div>
            ` : ''}
            ${isOwner ? `
              <div class="flex gap-sm" style="margin-top: var(--spacing-md);">
                <button id="delete-league-btn" class="btn btn-danger btn-sm">
                  Delete League
                </button>
              </div>
            ` : isMember ? `
              <div class="flex gap-sm" style="margin-top: var(--spacing-md);">
                <button id="leave-league-btn" class="btn btn-danger btn-sm">
                  Leave League
                </button>
              </div>
            ` : `
              <div class="flex gap-sm" style="margin-top: var(--spacing-md);">
                <button id="join-league-btn" class="btn btn-primary btn-sm">
                  Join League
                </button>
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- League Members -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Members (${memberCount})</h2>
        </div>
        <div class="card-body">
          ${league.members && league.members.length > 0 ? `
            <div class="flex flex-column gap-sm">
              ${league.members.map(member => `
                <div 
                  class="flex flex-between flex-center" 
                  style="padding: var(--spacing-md); background: var(--color-surface); border-radius: var(--radius-sm);"
                >
                  <div class="flex flex-column">
                    <div style="font-weight: var(--font-weight-medium);">
                      ${member.username || `User #${member.userId}`}
                      ${member.userId === league.owner ? '<span class="badge badge-captain" style="margin-left: var(--spacing-xs);">Owner</span>' : ''}
                    </div>
                    ${member.school ? `
                      <div class="text-secondary" style="font-size: var(--font-size-sm);">
                        ${member.school}
                      </div>
                    ` : ''}
                  </div>
                  ${isOwner && member.userId !== userId && member.userId !== league.owner ? `
                    <button 
                      class="btn btn-danger btn-sm" 
                      data-kick-member="${member.userId}"
                      title="Remove member"
                    >
                      Remove
                    </button>
                  ` : ''}
                </div>
              `).join('')}
              ${!league.members.some((m: LeagueMemberDto) => m.userId === league.owner) ? `
                <div 
                  class="flex flex-between flex-center" 
                  style="padding: var(--spacing-md); background: var(--color-surface); border-radius: var(--radius-sm);"
                >
                  <div class="flex flex-column">
                    <div style="font-weight: var(--font-weight-medium);">
                      ${league.ownerUsername || `User #${league.owner}`}
                      <span class="badge badge-captain" style="margin-left: var(--spacing-xs);">Owner</span>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : `
            <div class="flex flex-column gap-sm">
              <div 
                class="flex flex-between flex-center" 
                style="padding: var(--spacing-md); background: var(--color-surface); border-radius: var(--radius-sm);"
              >
                <div class="flex flex-column">
                  <div style="font-weight: var(--font-weight-medium);">
                    ${league.ownerUsername || `User #${league.owner}`}
                    <span class="badge badge-captain" style="margin-left: var(--spacing-xs);">Owner</span>
                  </div>
                </div>
              </div>
            </div>
          `}
        </div>
      </div>
    </div>

    <!-- Standings Section -->
    <div class="card mt-lg">
      <div class="card-header">
        <h2 class="card-title">Standings</h2>
        <div class="flex gap-sm">
          <select id="gameweek-select" class="form-input" style="min-width: 200px;">
            <option value="">Loading gameweeks...</option>
          </select>
        </div>
      </div>
      <div class="card-body">
        <div id="standings-container">
          <p class="text-secondary text-center">Select a gameweek to view standings.</p>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  attachEventListeners(league.id, userId);
  
  // Load gameweeks for standings
  loadGameweeksForStandings(league.id);
}

/**
 * Attach event listeners
 */
function attachEventListeners(leagueId: number, userId: number) {
  // Join league button
  const joinBtn = document.querySelector('#join-league-btn') as HTMLButtonElement;
  if (joinBtn) {
    joinBtn.addEventListener('click', async () => {
      await handleJoinLeague(leagueId, userId);
    });
  }

  // Leave league button
  const leaveBtn = document.querySelector('#leave-league-btn') as HTMLButtonElement;
  if (leaveBtn) {
    leaveBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to leave this league?')) {
        await handleLeaveLeague(leagueId, userId);
      }
    });
  }

  // Delete league button
  const deleteBtn = document.querySelector('#delete-league-btn') as HTMLButtonElement;
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this league? This action cannot be undone.')) {
        await handleDeleteLeague(leagueId);
      }
    });
  }

  // Kick member buttons
  document.querySelectorAll('[data-kick-member]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const memberId = parseInt(btn.getAttribute('data-kick-member') || '0');
      if (confirm(`Are you sure you want to remove this member from the league?`)) {
        await handleKickMember(leagueId, memberId);
      }
    });
  });

  // Gameweek select for standings
  const gameweekSelect = document.querySelector('#gameweek-select') as HTMLSelectElement;
  if (gameweekSelect) {
    gameweekSelect.addEventListener('change', async (e) => {
      const gameweekId = parseInt((e.target as HTMLSelectElement).value);
      if (gameweekId) {
        await loadStandings(leagueId, gameweekId);
      } else {
        const standingsContainer = document.querySelector('#standings-container');
        if (standingsContainer) {
          standingsContainer.innerHTML = '<p class="text-secondary text-center">Select a gameweek to view standings.</p>';
        }
      }
    });
  }
}

/**
 * Load gameweeks for standings dropdown
 */
async function loadGameweeksForStandings(leagueId: number) {
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

    // If current gameweek exists, load its standings
    if (currentGameweekId) {
      await loadStandings(leagueId, currentGameweekId);
    }
  } catch (error: any) {
    console.error('Failed to load gameweeks:', error);
    gameweekSelect.innerHTML = '<option value="">Failed to load gameweeks</option>';
  }
}

/**
 * Load standings for a gameweek
 */
async function loadStandings(leagueId: number, gameweekId: number) {
  const standingsContainer = document.querySelector('#standings-container');
  if (!standingsContainer) return;

  standingsContainer.innerHTML = '<p class="text-center">Loading standings...</p>';

  try {
    const standings = await leagueService.getStandings(leagueId, gameweekId);

    if (!standings.standings || standings.standings.length === 0) {
      standingsContainer.innerHTML = '<p class="text-secondary text-center">No standings available for this gameweek.</p>';
      return;
    }

    // Render standings table
    standingsContainer.innerHTML = `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            ${standings.standings.map((entry: any) => `
              <tr>
                <td style="font-weight: var(--font-weight-bold);">${entry.rank}</td>
                <td>${entry.username || `User #${entry.userId}`}</td>
                <td style="font-weight: var(--font-weight-semibold);">${entry.totalPoints}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error: any) {
    console.error('Failed to load standings:', error);
    standingsContainer.innerHTML = '<p class="text-secondary text-center text-error">Failed to load standings. Please try again.</p>';
  }
}

/**
 * Handle joining a league
 */
async function handleJoinLeague(leagueId: number, userId: number) {
  const joinBtn = document.querySelector('#join-league-btn') as HTMLButtonElement;
  if (!joinBtn) return;

  const originalText = joinBtn.textContent;
  joinBtn.disabled = true;
  joinBtn.textContent = 'Joining...';

  try {
    await leagueService.joinLeague(leagueId, userId);
    // Success - reload the page to show updated member count
    await renderLeagueDetailsPage(leagueId);
  } catch (error: any) {
    joinBtn.disabled = false;
    joinBtn.textContent = originalText;
    
    // Provide more specific error message
    let errorMessage = 'Failed to join league. ';
    if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      errorMessage += 'You do not have permission to join this league.';
    } else if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
      errorMessage += 'You may already be a member of this league, or the league may be private.';
    } else {
      errorMessage += error.message || 'Please try again.';
    }
    
    alert(errorMessage);
    console.error('Failed to join league:', error);
  }
}

/**
 * Handle leaving a league
 */
async function handleLeaveLeague(leagueId: number, userId: number) {
  const leaveBtn = document.querySelector('#leave-league-btn') as HTMLButtonElement;
  if (!leaveBtn) return;

  const originalText = leaveBtn.textContent;
  leaveBtn.disabled = true;
  leaveBtn.textContent = 'Leaving...';

  try {
    await leagueService.leaveLeague(leagueId, userId);
    // Success - redirect to leagues page
    router.navigate('/leagues');
  } catch (error: any) {
    leaveBtn.disabled = false;
    leaveBtn.textContent = originalText;
    alert(error.message || 'Failed to leave league. Please try again.');
    console.error('Failed to leave league:', error);
  }
}

/**
 * Handle deleting a league
 */
async function handleDeleteLeague(leagueId: number) {
  const deleteBtn = document.querySelector('#delete-league-btn') as HTMLButtonElement;
  if (!deleteBtn) return;

  const originalText = deleteBtn.textContent;
  deleteBtn.disabled = true;
  deleteBtn.textContent = 'Deleting...';

  try {
    await leagueService.deleteLeague(leagueId);
    // Success - redirect to leagues page
    router.navigate('/leagues');
  } catch (error: any) {
    deleteBtn.disabled = false;
    deleteBtn.textContent = originalText;
    
    // Provide more specific error message
    let errorMessage = 'Failed to delete league. ';
    if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      errorMessage += 'You do not have permission to delete this league.';
    } else if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      errorMessage += 'League not found.';
    } else {
      errorMessage += error.message || 'Please try again.';
    }
    
    alert(errorMessage);
    console.error('Failed to delete league:', error);
  }
}

/**
 * Handle kicking a member from league
 */
async function handleKickMember(leagueId: number, memberId: number) {
  try {
    await leagueService.kickMember(leagueId, memberId);
    // Reload the page to show updated members
    await renderLeagueDetailsPage(leagueId);
  } catch (error: any) {
    alert(error.message || 'Failed to remove member. Please try again.');
    console.error('Failed to kick member:', error);
  }
}

