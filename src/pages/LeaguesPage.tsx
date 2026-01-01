import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { CreateLeagueModal } from '../components/CreateLeagueModal.tsx'
import { JoinPrivateLeagueModal } from '../components/JoinPrivateLeagueModal.tsx'
import { useNotification } from '../hooks/useNotification'
import { fetchUserLeagues, fetchPublicLeagues, createLeague, joinLeague } from '../store/slices/leagueSlice'
import { type LeagueDto } from '../services/league.service'

/**
 * Leagues Page
 * 
 * Displays user's leagues and public leagues, allows creating and joining leagues.
 * Uses Redux for state management.
 */
export function LeaguesPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)
  const { userLeagues, publicLeagues, isLoading, error } = useAppSelector((state) => state.leagues)
  const { showError, showSuccess } = useNotification()
  
  // Modal states (UI-only, can stay as useState)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinPrivateModal, setShowJoinPrivateModal] = useState(false)

  // Load leagues
  useEffect(() => {
    if (!auth.user?.id) {
      showError('User ID not found')
      return
    }

    const loadLeagues = async () => {
      if (!auth.user?.id) return
      try {
        await Promise.all([
          dispatch(fetchUserLeagues(auth.user.id)),
          dispatch(fetchPublicLeagues())
        ])
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load leagues. Please try again.'
        showError(message)
      }
    }

    loadLeagues()
  }, [auth.user?.id, dispatch, showError])

  // Show error notifications from Redux
  useEffect(() => {
    if (error) {
      showError(error)
    }
  }, [error, showError])

  // Filter out user's leagues from public leagues
  const filteredPublicLeagues = publicLeagues.filter((league) => {
    return !userLeagues.some((userLeague) => userLeague.id === league.id)
  }) as LeagueDto[]

  const handleCreateLeague = async (isPublic: boolean) => {
    if (!auth.user?.id) {
      throw new Error('User ID not found')
    }

    try {
      // Backend: true = public, false = private
      const result = await dispatch(createLeague({ userId: auth.user.id, leagueData: { type: isPublic } }))
      
      if (createLeague.fulfilled.match(result)) {
        // Success - navigate to the new league details page
        setShowCreateModal(false)
        navigate(`/leagues/${result.payload.id}`)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create league'
      showError(message)
    }
  }

  const handleJoinLeague = async (leagueId: number) => {
    if (!auth.user?.id) {
      showError('User ID not found')
      return
    }

    try {
      const result = await dispatch(joinLeague({ leagueId, userId: auth.user.id }))
      
      if (joinLeague.fulfilled.match(result)) {
        showSuccess('Successfully joined the league!')
        // Reload leagues to show updated lists
        await Promise.all([
          dispatch(fetchUserLeagues(auth.user.id)),
          dispatch(fetchPublicLeagues())
        ])
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join league. Please try again.'
      showError(message)
    }
  }

  const handleJoinPrivateLeague = async (leagueId: number) => {
    if (!auth.user?.id) {
      throw new Error('User not authenticated.')
    }

    try {
      const result = await dispatch(joinLeague({ leagueId, userId: auth.user.id }))
      
      if (joinLeague.fulfilled.match(result)) {
        setShowJoinPrivateModal(false)
        showSuccess('Successfully joined the league!')
        // Refresh leagues after joining
        await Promise.all([
          dispatch(fetchUserLeagues(auth.user.id)),
          dispatch(fetchPublicLeagues())
        ])
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join league'
      showError(message)
    }
  }

  if (isLoading && userLeagues.length === 0 && publicLeagues.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--color-surface)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>
            Loading leagues...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'var(--color-surface)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)'
          }}>
            Leagues
          </h1>
          <Link
            to="/dashboard"
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
            Back to Dashboard
          </Link>
        </div>


        {/* My Leagues Section */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}>
              My Leagues
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
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
              Create League
            </button>
          </div>

          {userLeagues.length === 0 ? (
            <div style={{
              background: 'var(--color-surface-elevated)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center'
            }}>
              <p style={{
                color: 'var(--color-text-secondary)',
                marginBottom: '1rem'
              }}>
                You&apos;re not part of any leagues yet.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  cursor: 'pointer'
                }}
              >
                Create Your First League
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {userLeagues.map((league) => {
                const isOwner = league.owner === auth.user?.id
                const leagueType = league.typeDisplay || (league.type ? 'Public' : 'Private')
                
                return (
                  <div
                    key={league.id}
                    style={{
                      background: 'var(--color-surface-elevated)',
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
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
                            background: league.type ? 'var(--color-success)' : 'var(--color-secondary)',
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => navigate(`/leagues/${league.id}`)}
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
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Public Leagues Section */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}>
              Public Leagues
            </h2>
            <button
              onClick={() => setShowJoinPrivateModal(true)}
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
              Join Private League
            </button>
          </div>

          {filteredPublicLeagues.length === 0 ? (
            <div style={{
              background: 'var(--color-surface-elevated)',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center'
            }}>
              <p style={{
                color: 'var(--color-text-secondary)'
              }}>
                No public leagues available.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {filteredPublicLeagues.map((league) => {
                const leagueType = league.typeDisplay || (league.type ? 'Public' : 'Private')
                
                return (
                  <div
                    key={league.id}
                    style={{
                      background: 'var(--color-surface-elevated)',
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
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
                            background: league.type ? 'var(--color-success)' : 'var(--color-secondary)',
                            color: 'white',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-medium)'
                          }}>
                            {leagueType}
                          </span>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => navigate(`/leagues/${league.id}`)}
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
                      <button
                        onClick={() => handleJoinLeague(league.id)}
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
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create League Modal */}
      <CreateLeagueModal
        open={showCreateModal}
        onCreate={handleCreateLeague}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Join Private League Modal */}
      <JoinPrivateLeagueModal
        open={showJoinPrivateModal}
        onJoin={handleJoinPrivateLeague}
        onClose={() => setShowJoinPrivateModal(false)}
      />
    </div>
  )
}
