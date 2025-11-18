import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Box, Card, CardContent, Typography, Button, Grid, Container } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutThunk } from '../store/slices/authSlice'
import { fetchCurrentGameweek } from '../store/slices/gameweekSlice'
import { fetchUserSquads } from '../store/slices/squadSlice'
import { fetchUserLeagues } from '../store/slices/leagueSlice'
import { useNotification } from '../hooks/useNotification'

/**
 * Dashboard Page
 * 
 * Displays gameweek info, squad preview, and league preview.
 * Uses Redux for state management.
 */
export function DashboardPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const auth = useAppSelector((state) => state.auth)
  const { showError } = useNotification()
  
  // Get data from Redux state
  const currentGameweek = useAppSelector((state) => state.gameweeks.currentGameweek)
  const squads = useAppSelector((state) => state.squads.userSquads)
  const leagues = useAppSelector((state) => state.leagues.userLeagues)
  
  // Combine loading states from all slices
  const isLoading = useAppSelector((state) => 
    state.gameweeks.isLoading || state.squads.isLoading || state.leagues.isLoading
  )
  
  // Get errors from Redux (optional - for better error handling)
  const gameweekError = useAppSelector((state) => state.gameweeks.error)
  const squadError = useAppSelector((state) => state.squads.error)
  const leagueError = useAppSelector((state) => state.leagues.error)

  useEffect(() => {
    if (!auth.user?.id) {
      showError('User ID not found')
      return
    }

    // Dispatch Redux thunks to fetch data
    dispatch(fetchCurrentGameweek())
    dispatch(fetchUserSquads(auth.user.id))
    dispatch(fetchUserLeagues(auth.user.id))
  }, [auth.user?.id, dispatch, showError])

  // Show error notifications if any Redux errors occur
  useEffect(() => {
    if (gameweekError) {
      showError(gameweekError)
    }
  }, [gameweekError, showError])

  useEffect(() => {
    if (squadError) {
      showError(squadError)
    }
  }, [squadError, showError])

  useEffect(() => {
    if (leagueError) {
      showError(leagueError)
    }
  }, [leagueError, showError])

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    navigate('/login', { replace: true })
  }

  if (isLoading) {
    return (
      <Container>
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Loading dashboard...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Dashboard
            </Typography>
            {auth.user?.username && (
              <Typography variant="body1" color="text.secondary">
                Welcome, {auth.user.username}!
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button component={Link} to="/players" variant="outlined" color="secondary">
              Browse Players
            </Button>
            <Button onClick={handleLogout} variant="contained" color="error">
              Logout
            </Button>
          </Box>
        </Box>

        {/* Content Grid */}
        <Grid container spacing={3}>
          {/* Gameweek Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Gameweek
                </Typography>
                {currentGameweek ? (
                  <Box>
                    <Typography variant="h5" color="primary" gutterBottom>
                      Gameweek {currentGameweek.number || currentGameweek.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentGameweek.isCurrent ? 'In Progress' : 'Upcoming'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No current gameweek found.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Squad Preview */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Squads
                </Typography>
                {squads.length > 0 ? (
                  <Box>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {squads.length} Squad{squads.length !== 1 ? 's' : ''}
                    </Typography>
                    <Button component={Link} to="/squad" variant="text" color="primary" size="small">
                      View Squads →
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      No squads yet.
                    </Typography>
                    <Button component={Link} to="/squad" variant="text" color="primary" size="small">
                      Create Squad →
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Leagues Preview */}
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  My Leagues
                </Typography>
                {leagues.length > 0 ? (
                  <Box>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {leagues.length} League{leagues.length !== 1 ? 's' : ''}
                    </Typography>
                    <Button component={Link} to="/leagues" variant="text" color="primary" size="small">
                      View Leagues →
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      No leagues yet.
                    </Typography>
                    <Button component={Link} to="/leagues" variant="text" color="primary" size="small">
                      Browse Leagues →
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

