import { type LeagueDto } from '../services/league.service'

/**
 * League Card Component
 * 
 * Reusable component for displaying league information.
 */

export interface LeagueCardProps {
  league: LeagueDto
  showActions?: boolean
  isOwner?: boolean
  onView?: (leagueId: number) => void
  onJoin?: (leagueId: number) => void
  onLeave?: (leagueId: number) => void
}

export function LeagueCard({
  league,
  showActions = true,
  isOwner = false,
  onView,
  onJoin,
  onLeave,
}: LeagueCardProps) {
  const leagueType = league.typeDisplay || (league.type ? 'Public' : 'Private')
  const typeColor = league.type ? 'var(--color-success)' : 'var(--color-secondary)'

  return (
    <div style={{
      background: 'var(--color-surface-elevated)',
      padding: '1.5rem',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: showActions ? '1rem' : '0'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}>
              League #{league.id}
            </h3>
            <span style={{
              padding: '0.25rem 0.5rem',
              background: typeColor,
              color: 'white',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)'
            }}>
              {leagueType}
            </span>
            {isOwner && (
              <span style={{
                padding: '0.25rem 0.5rem',
                background: 'var(--color-primary)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-bold)'
              }}>
                Owner
              </span>
            )}
          </div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: '0.25rem'
          }}>
            {league.memberCount} member{league.memberCount !== 1 ? 's' : ''}
          </div>
          {league.ownerUsername && (
            <div style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              Owner: {league.ownerUsername}
            </div>
          )}
        </div>
      </div>
      {showActions && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onView && (
            <button
              onClick={() => onView(league.id)}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer'
              }}
            >
              View
            </button>
          )}
          {onJoin && !isOwner && (
            <button
              onClick={() => onJoin(league.id)}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--color-secondary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer'
              }}
            >
              Join
            </button>
          )}
          {onLeave && !isOwner && (
            <button
              onClick={() => onLeave(league.id)}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--color-error)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer'
              }}
            >
              Leave
            </button>
          )}
        </div>
      )}
    </div>
  )
}




