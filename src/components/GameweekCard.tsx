
/**
 * Gameweek Card Component
 * 
 * Displays information about a gameweek.
 */
export interface GameweekDto {
  id: number
  startTime: string
  endTime?: string | null
  isComplete: boolean
  isCurrent?: boolean
}

export interface GameweekCardProps {
  gameweek: GameweekDto
}

export function GameweekCard({ gameweek }: GameweekCardProps) {
  const startDate = new Date(gameweek.startTime)
  const endDate = gameweek.endTime ? new Date(gameweek.endTime) : null

  const statusText = gameweek.isComplete
    ? 'Complete'
    : gameweek.isCurrent
    ? 'In Progress'
    : 'Upcoming'

  const statusColor = gameweek.isComplete
    ? 'var(--color-success)'
    : gameweek.isCurrent
    ? 'var(--color-info)'
    : 'var(--color-warning)'

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
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)'
        }}>
          Gameweek {gameweek.id}
        </h2>
        <span style={{
          padding: '0.25rem 0.5rem',
          background: statusColor,
          color: 'white',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)'
        }}>
          {statusText}
        </span>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div>
          <strong style={{ color: 'var(--color-text-primary)' }}>Start:</strong>{' '}
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {endDate && (
          <div>
            <strong style={{ color: 'var(--color-text-primary)' }}>End:</strong>{' '}
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {endDate.toLocaleDateString()} {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        {gameweek.isCurrent && !gameweek.isComplete && (
          <div style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}>
            This gameweek is currently active.
          </div>
        )}
      </div>
    </div>
  )
}




