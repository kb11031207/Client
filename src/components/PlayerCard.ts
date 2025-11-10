import type { PlayerDto } from '../services/player.service';
import { getPositionAbbr } from '../utils/squad-validator';

/**
 * Player Card Component
 * 
 * Displays a player card that can be clicked to add to squad.
 */

export interface PlayerCardProps {
  player: PlayerDto;
  isInSquad?: boolean;
  isStarter?: boolean;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  onClick?: (player: PlayerDto) => void;
  onRemove?: (player: PlayerDto) => void;
  onViewStats?: (player: PlayerDto) => void;
  showRemoveButton?: boolean;
  showStatsButton?: boolean;
}

/**
 * Render a player card
 * @param props PlayerCardProps
 * @returns HTML string
 */
export function renderPlayerCard(props: PlayerCardProps): string {
  const { 
    player, 
    isInSquad = false, 
    isStarter = false, 
    isCaptain = false, 
    isViceCaptain = false, 
    onClick,
    onRemove,
    onViewStats,
    showRemoveButton = false,
    showStatsButton = false
  } = props;
  
  const cardClasses = [
    'card',
    isInSquad ? 'player-card-in-squad' : '',
    isStarter ? 'player-card-starter' : '',
    onClick && !isInSquad ? 'player-card-clickable' : '',
  ].filter(Boolean).join(' ');
  
  const badges = [];
  if (isCaptain) badges.push('<span class="badge badge-captain">C</span>');
  if (isViceCaptain) badges.push('<span class="badge badge-vice">V</span>');
  if (isStarter) badges.push('<span class="badge badge-starter">ST</span>');
  
  // Add cursor pointer if card is clickable (either has onClick prop or will have click listener)
  const cursorStyle = (onClick && !isInSquad) || (!isInSquad && !showRemoveButton) ? 'cursor: pointer;' : '';
  
  return `
    <div class="${cardClasses}" data-player-id="${player.id}" ${cursorStyle ? `style="${cursorStyle}"` : ''}>
      <div class="flex flex-between flex-center">
        <div class="flex flex-center gap-sm" style="flex: 1;">
          ${player.pictureUrl ? `
            <img src="${player.pictureUrl}" alt="${player.name || 'Player'}" style="width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover;">
          ` : `
            <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--color-surface); display: flex; align-items: center; justify-content: center; font-weight: var(--font-weight-bold);">
              ${getPositionAbbr(player.position)}
            </div>
          `}
          <div class="flex flex-column">
            <div style="font-weight: var(--font-weight-medium);">${player.name || 'Unknown Player'}</div>
            <div class="text-secondary" style="font-size: var(--font-size-sm);">
              ${player.teamName || 'Unknown Team'} • ${getPositionAbbr(player.position)}
            </div>
          </div>
        </div>
        <div class="flex flex-center gap-sm">
          ${badges.join('')}
          <div style="font-weight: var(--font-weight-semibold);">
            £${player.cost.toFixed(1)}m
          </div>
          ${showStatsButton && onViewStats ? `
            <button 
              class="btn btn-secondary btn-sm" 
              data-view-stats-player-id="${player.id}"
              style="margin-left: var(--spacing-xs); min-width: 28px; padding: 4px 8px; font-size: 0.9em; line-height: 1;"
              title="View player stats"
              onclick="event.stopPropagation();"
            >
              ℹ️
            </button>
          ` : ''}
          ${showRemoveButton && onRemove ? `
            <button 
              class="btn btn-danger btn-sm" 
              data-remove-player-id="${player.id}"
              style="margin-left: var(--spacing-xs); min-width: 28px; padding: 2px 8px; font-size: 1.2em; line-height: 1;"
              title="Remove from squad"
              onclick="event.stopPropagation();"
            >
              ×
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}


