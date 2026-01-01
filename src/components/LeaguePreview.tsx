import { Link, useNavigate } from 'react-router-dom'
import { type LeagueDto } from '../services/league.service'

/**
 * League Preview Component
 * 
 * Displays a preview of user's leagues.
 */

export interface LeaguePreviewProps {
  leagues: LeagueDto[]
}

export function LeaguePreview({ leagues }: LeaguePreviewProps) {
  const navigate = useNavigate()

  if (leagues.length === 0) {
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
            My Leagues
          </h2>
        </div>
        <p style={{
          color: 'var(--color-text-secondary)',
          marginBottom: '1rem'
        }}>
          You&apos;re not part of any leagues yet.
        </p>
        <Link
          to="/leagues"
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
          Browse Leagues
        </Link>
      </div>
    )
  }

  const leagueType = (league: LeagueDto) => league.typeDisplay || (league.type ? 'Public' : 'Private')

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
          My Leagues
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to="/leagues"
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
            View All
          </Link>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {leagues.slice(0, 3).map(league => (
          <div
            key={league.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              border: '1px solid var(--color-border)',
              transition: 'all var(--transition-fast)'
            }}
            onClick={() => navigate(`/leagues/${league.id}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <div style={{
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-text-primary)'
              }}>
                League #{league.id}
              </div>
              <div style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                {leagueType(league)} • {league.memberCount} member{league.memberCount !== 1 ? 's' : ''}
              </div>
              {league.ownerUsername && (
                <div style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  Owner: {league.ownerUsername}
                </div>
              )}
            </div>
            <Link
              to={`/leagues/${league.id}`}
              onClick={(e) => e.stopPropagation()}
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
              View
            </Link>
          </div>
        ))}
        {leagues.length > 3 && (
          <div style={{ textAlign: 'center' }}>
            <Link
              to="/leagues"
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                textDecoration: 'none'
              }}
            >
              View {leagues.length - 3} more league{leagues.length - 3 !== 1 ? 's' : ''}...
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}




