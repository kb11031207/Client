import { authService } from '../services/auth.service';
import { router } from '../utils/router';
import { leagueService } from '../services/league.service';
import { renderLeagueCard, type LeagueDto } from '../components/LeagueCard';
import { showCreateLeagueModal } from '../components/CreateLeagueModal';
import { showJoinPrivateLeagueModal } from '../components/JoinPrivateLeagueModal';

/**
 * Leagues Page
 * 
 * Displays user's leagues and public leagues, allows creating and joining leagues.
 */

/**
 * Render the Leagues page
 */
export async function renderLeaguesPage() {
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
        <h1 class="mt-0 mb-0">Leagues</h1>
        <a href="#/dashboard" class="btn btn-secondary btn-sm">Back to Dashboard</a>
      </div>
      <div id="loading" class="text-center p-2xl">
        <p>Loading leagues...</p>
      </div>
      <div id="leagues-content" class="hidden">
        <div class="mb-xl">
          <div class="flex flex-between flex-center mb-md">
            <h2 class="mt-0 mb-0">My Leagues</h2>
            <button id="create-league-btn" class="btn btn-primary btn-sm">
              Create League
            </button>
          </div>
          <div id="user-leagues-list" class="dashboard-grid">
            <!-- User leagues will be rendered here -->
          </div>
          <div id="user-leagues-empty" class="hidden">
            <div class="card">
              <div class="card-body text-center">
                <p class="text-secondary mb-md">
                  You're not part of any leagues yet.
                </p>
                <button id="create-league-empty-btn" class="btn btn-primary">
                  Create Your First League
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex flex-between flex-center mb-md">
            <h2 class="mt-0 mb-0">Public Leagues</h2>
            <button id="join-private-league-btn" class="btn btn-secondary btn-sm">
              Join Private League
            </button>
          </div>
          <div id="public-leagues-list" class="dashboard-grid">
            <!-- Public leagues will be rendered here -->
          </div>
          <div id="public-leagues-empty" class="hidden">
            <div class="card">
              <div class="card-body text-center">
                <p class="text-secondary">No public leagues available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="error-message" class="alert alert-error hidden"></div>
    </div>
  `;

  try {
    // Fetch user leagues and public leagues
    const [userLeagues, publicLeagues] = await Promise.all([
      leagueService.getUserLeagues(userId).catch(() => []),
      leagueService.getPublicLeagues().catch(() => []),
    ]);

    // Hide loading, show content
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    const contentDiv = document.querySelector('#leagues-content') as HTMLDivElement;
    loadingDiv.classList.add('hidden');
    contentDiv.classList.remove('hidden');

    // Render user leagues
    const userLeaguesContainer = document.querySelector('#user-leagues-list') as HTMLDivElement;
    const userLeaguesEmpty = document.querySelector('#user-leagues-empty') as HTMLDivElement;
    
    if (userLeagues.length === 0) {
      userLeaguesContainer.classList.add('hidden');
      userLeaguesEmpty.classList.remove('hidden');
    } else {
      userLeaguesContainer.classList.remove('hidden');
      userLeaguesEmpty.classList.add('hidden');
      userLeaguesContainer.innerHTML = userLeagues.map((league: LeagueDto) => {
        const isOwner = league.owner === userId;
        return renderLeagueCard({
          league,
          showActions: true,
          isOwner,
          onView: (leagueId) => router.navigate(`/leagues/${leagueId}`),
        });
      }).join('');
    }

    // Render public leagues (exclude user's leagues)
    const userLeagueIds = new Set(userLeagues.map((l: LeagueDto) => l.id));
    const filteredPublicLeagues = publicLeagues.filter((league: LeagueDto) => !userLeagueIds.has(league.id));
    
    const publicLeaguesContainer = document.querySelector('#public-leagues-list') as HTMLDivElement;
    const publicLeaguesEmpty = document.querySelector('#public-leagues-empty') as HTMLDivElement;
    
    if (filteredPublicLeagues.length === 0) {
      publicLeaguesContainer.classList.add('hidden');
      publicLeaguesEmpty.classList.remove('hidden');
    } else {
      publicLeaguesContainer.classList.remove('hidden');
      publicLeaguesEmpty.classList.add('hidden');
      publicLeaguesContainer.innerHTML = filteredPublicLeagues.map((league: LeagueDto) => {
        return renderLeagueCard({
          league,
          showActions: true,
          isOwner: false,
          onView: (leagueId) => router.navigate(`/leagues/${leagueId}`),
          onJoin: (leagueId) => handleJoinLeague(leagueId, userId),
        });
      }).join('');
    }

    // Attach event listeners
    attachEventListeners(userId);

  } catch (error: any) {
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    loadingDiv.classList.add('hidden');

    const errorDiv = document.querySelector('#error-message') as HTMLDivElement;
    errorDiv.textContent = error.message || 'Failed to load leagues. Please try again.';
    errorDiv.classList.remove('hidden');

    console.error('Failed to load leagues:', error);
  }
}

/**
 * Attach event listeners
 */
function attachEventListeners(userId: number) {
  // Create league buttons
  const createLeagueBtn = document.querySelector('#create-league-btn') as HTMLButtonElement;
  const createLeagueEmptyBtn = document.querySelector('#create-league-empty-btn') as HTMLButtonElement;
  
  const handleCreateLeague = async (isPublic: boolean) => {
    try {
      // Backend: true = public, false = private
      const newLeague = await leagueService.createLeague(userId, { type: isPublic });
      // Success - navigate to the new league details page
      router.navigate(`/leagues/${newLeague.id}`);
    } catch (error: any) {
      throw error; // Re-throw to be handled by modal
    }
  };

  if (createLeagueBtn) {
    createLeagueBtn.addEventListener('click', () => {
      showCreateLeagueModal(handleCreateLeague);
    });
  }
  if (createLeagueEmptyBtn) {
    createLeagueEmptyBtn.addEventListener('click', () => {
      showCreateLeagueModal(handleCreateLeague);
    });
  }

  // Join private league button
  const joinPrivateLeagueBtn = document.querySelector('#join-private-league-btn') as HTMLButtonElement;
  if (joinPrivateLeagueBtn) {
    joinPrivateLeagueBtn.addEventListener('click', () => {
      const handleJoinPrivateLeague = async (leagueId: number) => {
        try {
          await leagueService.joinLeague(leagueId, userId);
          // Success - reload the page to show updated leagues
          await renderLeaguesPage();
        } catch (error: any) {
          throw error; // Re-throw to be handled by modal
        }
      };
      showJoinPrivateLeagueModal(handleJoinPrivateLeague);
    });
  }

  // View league buttons
  document.querySelectorAll('[data-view-league]').forEach(btn => {
    btn.addEventListener('click', () => {
      const leagueId = parseInt(btn.getAttribute('data-view-league') || '0');
      router.navigate(`/leagues/${leagueId}`);
    });
  });

  // Join league buttons
  document.querySelectorAll('[data-join-league]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const leagueId = parseInt(btn.getAttribute('data-join-league') || '0');
      if (leagueId) {
        await handleJoinLeague(leagueId, userId);
      }
    });
  });
}

/**
 * Handle joining a league
 */
async function handleJoinLeague(leagueId: number, userId: number) {
  const joinBtn = document.querySelector(`[data-join-league="${leagueId}"]`) as HTMLButtonElement;
  if (!joinBtn) return;

  const originalText = joinBtn.textContent;
  joinBtn.disabled = true;
  joinBtn.textContent = 'Joining...';

  try {
    await leagueService.joinLeague(leagueId, userId);
    // Success - reload the page to show updated leagues
    await renderLeaguesPage();
  } catch (error: any) {
    joinBtn.disabled = false;
    joinBtn.textContent = originalText;
    alert(error.message || 'Failed to join league. Please try again.');
    console.error('Failed to join league:', error);
  }
}

