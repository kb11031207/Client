/**
 * League Card Component
 * 
 * Reusable component for displaying league information.
 */

export interface LeagueDto {
  id: number;
  owner: number;
  ownerUsername?: string | null;
  type: boolean; // true = private, false = public
  typeDisplay?: string | null;
  memberCount: number;
}

export interface LeagueCardProps {
  league: LeagueDto;
  showActions?: boolean;
  isOwner?: boolean;
  onView?: (leagueId: number) => void;
  onJoin?: (leagueId: number) => void;
  onLeave?: (leagueId: number) => void;
}

/**
 * Render a league card
 * @param props LeagueCardProps
 * @returns HTML string
 */
export function renderLeagueCard(props: LeagueCardProps): string {
  const { 
    league, 
    showActions = true, 
    isOwner = false,
    onView,
    onJoin,
    onLeave,
  } = props;

  // Backend: true = public, false = private
  const leagueType = league.typeDisplay || (league.type ? 'Public' : 'Private');
  const typeBadgeClass = league.type ? 'badge badge-starter' : 'badge'; // Use success color for public

  return `
    <div class="card" data-league-id="${league.id}">
      <div class="card-body">
        <div class="flex flex-between flex-center">
          <div class="flex flex-column" style="flex: 1;">
            <div class="flex flex-center gap-sm mb-sm">
              <h3 class="mt-0 mb-0" style="font-size: var(--font-size-lg);">
                League #${league.id}
              </h3>
              <span class="${typeBadgeClass}">
                ${leagueType}
              </span>
              ${isOwner ? '<span class="badge badge-captain">Owner</span>' : ''}
            </div>
            <div class="text-secondary" style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);">
              ${league.memberCount} member${league.memberCount !== 1 ? 's' : ''}
            </div>
            ${league.ownerUsername ? `
              <div class="text-secondary" style="font-size: var(--font-size-sm);">
                Owner: ${league.ownerUsername}
              </div>
            ` : ''}
          </div>
          ${showActions ? `
            <div class="flex gap-sm">
              ${onView ? `
                <button 
                  class="btn btn-primary btn-sm" 
                  data-view-league="${league.id}"
                  title="View league details"
                >
                  View
                </button>
              ` : `
                <a href="#/leagues/${league.id}" class="btn btn-primary btn-sm">
                  View
                </a>
              `}
              ${onJoin && !isOwner ? `
                <button 
                  class="btn btn-secondary btn-sm" 
                  data-join-league="${league.id}"
                  title="Join league"
                >
                  Join
                </button>
              ` : ''}
              ${onLeave && !isOwner ? `
                <button 
                  class="btn btn-danger btn-sm" 
                  data-leave-league="${league.id}"
                  title="Leave league"
                >
                  Leave
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

