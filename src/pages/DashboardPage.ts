import { authService } from '../services/auth.service';
import { router } from '../utils/router';
import { gameweekService } from '../services/gameweek.service';
import { squadService } from '../services/squad.service';
import { leagueService } from '../services/league.service';
import { renderGameweekCard } from '../components/GameweekCard';
import { renderSquadPreview } from '../components/SquadPreview';
import { renderLeaguesPreview } from '../components/LeaguePreview';

/**
 * Render the Dashboard Page
 * 
 * Displays gameweek info, squad preview, and league preview.
 */
export async function renderDashboardPage() {
  const container = document.querySelector('#app');
  if (!container) return;

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate('/login');
    return;
  }

  const userId = authService.getCurrentUserId();
  if (!userId) {
    router.navigate('/login');
    return;
  }

  // Show loading state
  container.innerHTML = `
    <div class="container">
      <div class="flex flex-between flex-center mb-xl">
        <h1 class="mt-0 mb-0">Dashboard</h1>
        <button id="logout-button" class="btn btn-danger btn-sm">
          Logout
        </button>
      </div>
      <div id="loading" class="text-center p-2xl">
        <p>Loading dashboard...</p>
      </div>
      <div id="dashboard-content" class="hidden">
        <div id="gameweek-info" class="dashboard-section"></div>
        <div id="squad-preview" class="dashboard-section"></div>
        <div id="leagues-preview" class="dashboard-section"></div>
      </div>
      <div id="error-message" class="alert alert-error hidden"></div>
    </div>
  `;

  // Setup logout button
  const logoutButton = document.querySelector('#logout-button') as HTMLButtonElement;
  logoutButton.addEventListener('click', () => {
    authService.logout();
    router.navigate('/login');
  });

  // Fetch dashboard data
  try {
    const [currentGameweek, squads, leagues] = await Promise.all([
      gameweekService.getCurrentGameweek().catch(() => null),
      squadService.getUserSquads(userId).catch(() => []),
      leagueService.getUserLeagues(userId).catch(() => []),
    ]);

    // Hide loading, show content
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    const contentDiv = document.querySelector('#dashboard-content') as HTMLDivElement;
    loadingDiv.classList.add('hidden');
    contentDiv.classList.remove('hidden');

    // Render gameweek info
    if (currentGameweek) {
      const gameweekContainer = document.querySelector('#gameweek-info');
      if (gameweekContainer) {
        gameweekContainer.innerHTML = renderGameweekCard(currentGameweek);
      }
    } else {
      const gameweekContainer = document.querySelector('#gameweek-info');
      if (gameweekContainer) {
        gameweekContainer.innerHTML = `
          <div class="card">
            <div class="card-body">
              <p class="text-secondary">No current gameweek found.</p>
            </div>
          </div>
        `;
      }
    }

    // Render squad preview
    const gameweekId = currentGameweek?.id || 1; // Default to gameweek 1 if no current gameweek
    const currentSquad = squads.find((s: any) => s.gameweekId === gameweekId) || null;
    const squadContainer = document.querySelector('#squad-preview');
    if (squadContainer) {
      squadContainer.innerHTML = renderSquadPreview(currentSquad, gameweekId);
    }

    // Render leagues preview
    const leaguesContainer = document.querySelector('#leagues-preview');
    if (leaguesContainer) {
      leaguesContainer.innerHTML = renderLeaguesPreview(leagues);
    }

  } catch (error: any) {
    // Hide loading
    const loadingDiv = document.querySelector('#loading') as HTMLDivElement;
    loadingDiv.classList.add('hidden');

    // Show error
    const errorDiv = document.querySelector('#error-message') as HTMLDivElement;
    errorDiv.textContent = error.message || 'Failed to load dashboard data. Please try again.';
    errorDiv.classList.remove('hidden');
    
    console.error('Failed to load dashboard:', error);
  }
}
