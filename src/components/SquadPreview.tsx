import { Link } from 'react-router-dom'

/**
 * Squad Preview Component
 * 
 * Displays a preview of user's squads, particularly for the current gameweek.
 */
export interface SquadDto {
  id: number
  userId: number
  gameweekId: number
  createdAt: string
  updatedAt: string
  players?: SquadPlayerDto[] | null
  totalCost: number
  totalPoints: number
}

export interface SquadPlayerDto {
  playerId: number
  playerName?: string | null
  position: number
  teamName?: string | null
  isStarter: boolean
  isCaptain: boolean
  isVice: boolean
  playerCost: number
  points?: number | null
}

export interface SquadPreviewProps {
  squad: SquadDto | null
  gameweekId: number
}

export function SquadPreview({ squad, gameweekId }: SquadPreviewProps) {
  const positionNames: { [key: number]: string } = {
    1: 'GK',
    2: 'DEF',
    3: 'MID',
    4: 'FWD'
  }

  if (!squad) {
    return (
      <div style={{
        background: 'var(--color-surface-elevated)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <h2 style={{
          margin: '0 0 1rem 0',
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-text-primary)'
        }}>
          My Squad
        </h2>
        <p style={{
          color: 'var(--color-text-secondary)',
          marginBottom: '1rem'
        }}>
          You don&apos;t have a squad for Gameweek {gameweekId} yet.
        </p>
        <Link
          to={`/squad/${gameweekId}`}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--color-primary)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            display: 'inline-block'
          }}
        >
          Create Squad
        </Link>
      </div>
    )
  }

  const starters = squad.players?.filter(p => p.isStarter) || []
  const captain = squad.players?.find(p => p.isCaptain)

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
          My Squad - Gameweek {squad.gameweekId}
        </h2>
        <Link
          to={`/squad/${squad.gameweekId}`}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--color-secondary)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)'
          }}
        >
          View/Edit
        </Link>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)'
          }}>
            Total Points
          </div>
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)'
          }}>
            {squad.totalPoints || 0}
          </div>
        </div>
        <div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)'
          }}>
            Squad Value
          </div>
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)'
          }}>
            £{squad.totalCost.toFixed(1)}m
          </div>
        </div>
      </div>

      {starters.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            marginBottom: '0.5rem',
            color: 'var(--color-text-primary)'
          }}>
            Starting XI
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {starters.map((player, index) => (
              <div
                key={player.playerId || index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{
                    fontWeight: 'var(--font-weight-medium)',
                    minWidth: '30px'
                  }}>
                    {positionNames[player.position] || '?'}
                  </span>
                  <span>{player.playerName || 'Unknown'}</span>
                  {player.isCaptain && (
                    <span style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                      padding: '0.125rem 0.375rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-bold)'
                    }}>
                      C
                    </span>
                  )}
                  {player.isVice && (
                    <span style={{
                      background: 'var(--color-secondary)',
                      color: 'white',
                      padding: '0.125rem 0.375rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-bold)'
                    }}>
                      V
                    </span>
                  )}
                </div>
                <div style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  {player.points !== null && player.points !== undefined ? `${player.points} pts` : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {captain && (
        <div style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)'
        }}>
          Captain: {captain.playerName || 'Unknown'}
        </div>
      )}
    </div>
  )
}




