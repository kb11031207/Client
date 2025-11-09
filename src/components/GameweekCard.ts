/**
 * Gameweek Card Component
 * 
 * Displays information about a gameweek.
 */

export interface GameweekDto {
  id: number;
  startTime: string;
  endTime?: string | null;
  isComplete: boolean;
  isCurrent?: boolean;
}

/**
 * Render a gameweek card
 * @param gameweek GameweekDto data
 * @returns HTML string
 */
export function renderGameweekCard(gameweek: GameweekDto): string {
  const startDate = new Date(gameweek.startTime);
  const endDate = gameweek.endTime ? new Date(gameweek.endTime) : null;
  
  const statusClass = gameweek.isComplete 
    ? 'alert-success' 
    : gameweek.isCurrent 
    ? 'alert-info' 
    : 'alert-warning';
  
  const statusText = gameweek.isComplete 
    ? 'Complete' 
    : gameweek.isCurrent 
    ? 'In Progress' 
    : 'Upcoming';
  
  return `
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Gameweek ${gameweek.id}</h2>
        <span class="alert ${statusClass}" style="padding: var(--spacing-xs) var(--spacing-sm); font-size: var(--font-size-sm);">
          ${statusText}
        </span>
      </div>
      <div class="card-body">
        <div class="flex flex-column gap-md">
          <div>
            <strong>Start:</strong> ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          ${endDate ? `
            <div>
              <strong>End:</strong> ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          ` : ''}
          ${gameweek.isCurrent && !gameweek.isComplete ? `
            <div class="text-secondary">
              This gameweek is currently active.
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}


