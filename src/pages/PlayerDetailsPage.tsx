import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material'
import { getPositionName, getPositionAbbr } from '../utils/squad-validator'
import { useNotification } from '../hooks/useNotification'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { fetchAllGameweeks, fetchCurrentGameweek } from '../store/slices/gameweekSlice'
import { fetchPlayerById, fetchPlayerStats } from '../store/slices/playerSlice'
import { type PlayerFixtureStatsDto } from '../services/player.service'

/**
 * Player Details Page
 * 
 * Displays player information and stats for different gameweeks.
 * Uses Redux for state management.
 */

export function PlayerDetailsPage() {
  const { playerId: playerIdParam } = useParams<{ playerId: string }>()
  const dispatch = useAppDispatch()
  const { showError } = useNotification()
  
  // Redux state
  const { gameweeks, currentGameweek, error: gameweeksError } = useAppSelector((state) => state.gameweeks)
  const { currentPlayer, currentPlayerStats, isLoading: playerLoading, isLoadingStats, error: playerError } = useAppSelector((state) => state.players)
  
  // Local UI state
  const [selectedGameweekId, setSelectedGameweekId] = useState<number | null>(null)

  const playerId = playerIdParam ? parseInt(playerIdParam) : null

  // Load gameweeks and current gameweek
  useEffect(() => {
    const loadGameweeks = async () => {
      try {
        await Promise.all([
          dispatch(fetchAllGameweeks()),
          dispatch(fetchCurrentGameweek())
        ])
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load gameweeks.'
        showError(message)
      }
    }
    
    loadGameweeks()
  }, [dispatch, showError])

  // Load player details - reset selected gameweek when player changes
  useEffect(() => {
    if (!playerId) {
      return
    }

    // Reset selected gameweek when player changes
    setSelectedGameweekId(null)
    
    dispatch(fetchPlayerById(playerId))
  }, [playerId, dispatch])

  // Auto-select current gameweek when it's available
  useEffect(() => {
    if (currentGameweek && !selectedGameweekId) {
      setSelectedGameweekId(currentGameweek.id)
    }
  }, [currentGameweek, selectedGameweekId])

  // Load stats when gameweek is selected
  useEffect(() => {
    if (!playerId || !selectedGameweekId) {
      return
    }

    // Check if we already have stats cached (undefined = not checked, null = checked no stats, PlayerStatsDto = has stats)
    // Only fetch if we haven't checked this gameweek yet (undefined)
    if (!(selectedGameweekId in currentPlayerStats)) {
      dispatch(fetchPlayerStats({ playerId, gameweekId: selectedGameweekId }))
    }
  }, [playerId, selectedGameweekId, dispatch, currentPlayerStats])

  // Show error notifications from Redux (but not for 404s - those are handled in UI)
  useEffect(() => {
    // Only show actual errors, not "no stats available" (404) messages
    if (playerError && !playerError.toLowerCase().includes('404') && !playerError.toLowerCase().includes('not found')) {
      showError(playerError)
    }
    if (gameweeksError) {
      showError(gameweeksError)
    }
  }, [playerError, gameweeksError, showError])

  const loading = playerLoading
  const loadingStats = isLoadingStats
  const error = playerError
  const player = currentPlayer
  // stats will be: undefined (not checked), null (checked, no stats), or PlayerStatsDto (has stats)
  const stats = selectedGameweekId && selectedGameweekId in currentPlayerStats
    ? currentPlayerStats[selectedGameweekId]
    : selectedGameweekId ? undefined : null

  const handleGameweekChange = (gameweekId: number | '') => {
    if (gameweekId === '') {
      setSelectedGameweekId(null)
    } else {
      setSelectedGameweekId(gameweekId)
    }
  }

  if (loading) {
    return (
      <Container>
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="h6" color="text.secondary">
            Loading player...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error || !player) {
    return (
      <Container>
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Player Details
            </Typography>
            <Button component={Link} to="/players" variant="outlined" color="secondary">
              Back to Players
            </Button>
          </Box>
          <Alert severity="error">{error || 'Player not found'}</Alert>
        </Box>
      </Container>
    )
  }

  const positionName = player.positionDisplay || getPositionName(player.position)
  const positionAbbr = getPositionAbbr(player.position)

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Player Details
          </Typography>
          <Button component={Link} to="/players" variant="outlined" color="secondary">
            Back to Players
          </Button>
        </Box>

        {/* Player Info Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Player Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {player.pictureUrl ? (
                  <Avatar
                    src={player.pictureUrl}
                    alt={player.name || 'Player'}
                    sx={{ width: 80, height: 80 }}
                  />
                ) : (
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
                    {positionAbbr}
                  </Avatar>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="bold">
                    {player.name || 'Unknown Player'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {player.teamName || 'Unknown Team'} • {positionName}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Player Number
                  </Typography>
                  <Typography variant="h6" fontWeight="medium">
                    #{player.playerNum}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Cost
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    £{player.cost.toFixed(1)}m
                  </Typography>
                </Grid>
                {player.school && (
                  <Grid item xs={12} sm={4} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      School
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {player.school}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">
                Gameweek Stats
              </Typography>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Gameweek</InputLabel>
                <Select
                  value={selectedGameweekId || ''}
                  onChange={(e) => handleGameweekChange(e.target.value as number | '')}
                  label="Select Gameweek"
                >
                  <MenuItem value="">
                    <em>Select a gameweek...</em>
                  </MenuItem>
                  {gameweeks.map((gw) => (
                    <MenuItem key={gw.id} value={gw.id}>
                      Gameweek {gw.id}{gw.isComplete ? ' (Complete)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {loadingStats ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading stats...
                </Typography>
              </Box>
            ) : !selectedGameweekId ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a gameweek to view stats.
                </Typography>
              </Box>
            ) : !stats ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No stats available for this gameweek.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Points Earned (Highlighted) */}
                <Card sx={{ bgcolor: 'background.default', border: 2, borderColor: 'primary.main' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Points Earned (Gameweek {stats.gameweekId})
                    </Typography>
                    <Typography variant="h3" color="primary" gutterBottom>
                      {stats.pointsEarned}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Overall Stats */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Overall Stats
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="caption" color="text.secondary">
                          Minutes Played
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {stats.minutesPlayed}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="caption" color="text.secondary">
                          Goals
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {stats.goals}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="caption" color="text.secondary">
                          Assists
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          {stats.assists}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="caption" color="text.secondary">
                          Clean Sheet
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={stats.cleanSheet ? 'success.main' : 'text.secondary'}
                        >
                          {stats.cleanSheet ? '✓' : '✗'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="caption" color="text.secondary">
                          Goals Conceded
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={stats.goalsConceded > 0 ? 'error.main' : 'text.primary'}
                        >
                          {stats.goalsConceded}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="caption" color="text.secondary">
                          Saves
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {stats.saves}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="caption" color="text.secondary">
                          Shots
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {stats.shots || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="caption" color="text.secondary">
                          Shots on Target
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {stats.shotsOnGoal || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="caption" color="text.secondary">
                          Yellow Cards
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={stats.yellowCards > 0 ? 'warning.main' : 'text.primary'}
                        >
                          {stats.yellowCards}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="caption" color="text.secondary">
                          Red Cards
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={stats.redCards > 0 ? 'error.main' : 'text.primary'}
                        >
                          {stats.redCards}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Fixture Breakdown */}
                {stats.fixtures && stats.fixtures.length > 0 && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Fixture Breakdown
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {stats.fixtures.map((fixture: PlayerFixtureStatsDto) => (
                          <Card key={fixture.fixtureId} sx={{ bgcolor: 'background.default' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {fixture.homeTeamName || 'Home'} {fixture.homeScore} - {fixture.awayScore} {fixture.awayTeamName || 'Away'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(fixture.kickoff).toLocaleDateString()}{' '}
                                    {new Date(fixture.kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                </Box>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                  {fixture.pointsEarned} pts
                                </Typography>
                              </Box>
                              <Grid container spacing={1} sx={{ mt: 1 }}>
                                <Grid item xs={6} sm={4} md={2}>
                                  <Typography variant="caption" color="text.secondary">
                                    Min
                                  </Typography>
                                  <Typography variant="body2" fontWeight="semibold">
                                    {fixture.minutesPlayed}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4} md={2}>
                                  <Typography variant="caption" color="text.secondary">
                                    Goals
                                  </Typography>
                                  <Typography variant="body2" fontWeight="semibold" color="success.main">
                                    {fixture.goals}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4} md={2}>
                                  <Typography variant="caption" color="text.secondary">
                                    Assists
                                  </Typography>
                                  <Typography variant="body2" fontWeight="semibold" color="success.main">
                                    {fixture.assists}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4} md={2}>
                                  <Typography variant="caption" color="text.secondary">
                                    Shots
                                  </Typography>
                                  <Typography variant="body2" fontWeight="semibold">
                                    {fixture.shots || 0}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4} md={2}>
                                  <Typography variant="caption" color="text.secondary">
                                    On Target
                                  </Typography>
                                  <Typography variant="body2" fontWeight="semibold">
                                    {fixture.shotsOnGoal || 0}
                                  </Typography>
                                </Grid>
                                {fixture.cleanSheet && (
                                  <Grid item xs={6} sm={4} md={2}>
                                    <Typography variant="caption" color="text.secondary">
                                      Clean Sheet
                                    </Typography>
                                    <Typography variant="body2" fontWeight="semibold" color="success.main">
                                      ✓
                                    </Typography>
                                  </Grid>
                                )}
                                {fixture.goalsConceded > 0 && (
                                  <Grid item xs={6} sm={4} md={2}>
                                    <Typography variant="caption" color="text.secondary">
                                      Goals Against
                                    </Typography>
                                    <Typography variant="body2" fontWeight="semibold" color="error.main">
                                      {fixture.goalsConceded}
                                    </Typography>
                                  </Grid>
                                )}
                                {fixture.saves > 0 && (
                                  <Grid item xs={6} sm={4} md={2}>
                                    <Typography variant="caption" color="text.secondary">
                                      Saves
                                    </Typography>
                                    <Typography variant="body2" fontWeight="semibold">
                                      {fixture.saves}
                                    </Typography>
                                  </Grid>
                                )}
                                {fixture.yellowCards > 0 && (
                                  <Grid item xs={6} sm={4} md={2}>
                                    <Typography variant="caption" color="text.secondary">
                                      Yellow
                                    </Typography>
                                    <Typography variant="body2" fontWeight="semibold" color="warning.main">
                                      {fixture.yellowCards}
                                    </Typography>
                                  </Grid>
                                )}
                                {fixture.redCards > 0 && (
                                  <Grid item xs={6} sm={4} md={2}>
                                    <Typography variant="caption" color="text.secondary">
                                      Red
                                    </Typography>
                                    <Typography variant="body2" fontWeight="semibold" color="error.main">
                                      {fixture.redCards}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

