import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Paper,
  Avatar,
} from '@mui/material'
import { type PlayerDto, type PlayerWithStatsDto, type PlayerFilterDto } from '../services/player.service'
import { getPositionAbbr } from '../utils/squad-validator'
import { useNotification } from '../hooks/useNotification'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchAllPlayers, searchPlayers, extractTeams, setFilteredPlayers } from '../store/slices/playerSlice'
import { fetchAllGameweeks } from '../store/slices/gameweekSlice'

/**
 * Players Page
 * 
 * Displays all players with filtering and performance sorting options.
 */
export function PlayersPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { showError } = useNotification()
  
  // Redux state
  const { players, filteredPlayers, teams, isLoading: playersLoading, error: playersError } = useAppSelector((state) => state.players)
  const { gameweeks, isLoading: gameweeksLoading } = useAppSelector((state) => state.gameweeks)
  
  const loading = playersLoading || gameweeksLoading

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [position, setPosition] = useState<string>('')
  const [teamId, setTeamId] = useState<string>('')
  const [minCost, setMinCost] = useState<string>('')
  const [maxCost, setMaxCost] = useState<string>('')
  const [gameweekId, setGameweekId] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [includeStats, setIncludeStats] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchAllPlayers()),
          dispatch(fetchAllGameweeks()),
        ])
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load data. Please try again.'
        showError(message)
      }
    }

    loadData()
  }, [dispatch, showError])

  // Extract teams when players are loaded
  useEffect(() => {
    if (players.length > 0 && teams.length === 0) {
      dispatch(extractTeams())
    }
  }, [players, teams.length, dispatch])

  // Show error notifications
  useEffect(() => {
    if (playersError) {
      showError(playersError)
    }
  }, [playersError, showError])

  const applyFilters = async () => {
    try {
      // Build filters for API
      const filters: PlayerFilterDto = {}
      
      if (position) filters.position = parseInt(position)
      if (teamId) filters.teamId = parseInt(teamId)
      if (minCost) filters.minCost = parseFloat(minCost)
      if (maxCost) filters.maxCost = parseFloat(maxCost)
      if (gameweekId) filters.gameweekId = parseInt(gameweekId)
      if (sortBy) {
        filters.sortBy = sortBy
        filters.sortOrder = sortOrder
      }
      if (includeStats) {
        filters.includeStats = true
      }

      // Determine if we should use API or client-side filtering
      const hasApiFilters = Object.keys(filters).length > 0
      
      if (hasApiFilters) {
        // Use API search with all filters
        const result = await dispatch(searchPlayers(filters))
        if (searchTerm && result.payload) {
          // Apply client-side name search if provided
          const filtered = (result.payload as (PlayerDto | PlayerWithStatsDto)[]).filter(player => 
            player.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          dispatch(setFilteredPlayers(filtered))
        }
      } else {
        // Use all players (no filters, no sorting)
        let filtered = players
        // Apply client-side name search if provided
        if (searchTerm) {
          filtered = players.filter(player => 
            player.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        dispatch(setFilteredPlayers(filtered))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to apply filters. Please try again.'
      showError(message)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setPosition('')
    setTeamId('')
    setMinCost('')
    setMaxCost('')
    setGameweekId('')
    setSortBy('')
    setSortOrder('desc')
    setIncludeStats(false)
    dispatch(setFilteredPlayers(players))
  }

  const handlePlayerClick = (playerId: number) => {
    navigate(`/players/${playerId}`)
  }

  if (loading && players.length === 0) {
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
            Loading players...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Players
          </Typography>
          <Button component={Link} to="/dashboard" variant="outlined" color="secondary">
            Back to Dashboard
          </Button>
        </Box>


        {/* Filters Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Search by Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  placeholder="Player name..."
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Position</InputLabel>
                  <Select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    label="Position"
                  >
                    <MenuItem value="">All Positions</MenuItem>
                    <MenuItem value="1">Goalkeeper</MenuItem>
                    <MenuItem value="2">Defender</MenuItem>
                    <MenuItem value="3">Midfielder</MenuItem>
                    <MenuItem value="4">Forward</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Team</InputLabel>
                  <Select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    label="Team"
                  >
                    <MenuItem value="">All Teams</MenuItem>
                    {teams.map(team => (
                      <MenuItem key={team.id} value={team.id.toString()}>{team.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Min Cost (£m)"
                  type="number"
                  value={minCost}
                  onChange={(e) => setMinCost(e.target.value)}
                  placeholder="0.0"
                  inputProps={{ step: 0.1, min: 0 }}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Max Cost (£m)"
                  type="number"
                  value={maxCost}
                  onChange={(e) => setMaxCost(e.target.value)}
                  placeholder="100.0"
                  inputProps={{ step: 0.1, min: 0 }}
                  fullWidth
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gameweek (for stats)</InputLabel>
                  <Select
                    value={gameweekId}
                    onChange={(e) => setGameweekId(e.target.value)}
                    label="Gameweek (for stats)"
                  >
                    <MenuItem value="">Overall Season</MenuItem>
                    {gameweeks.map((gw: { id: number; number: number; startDate: string; endDate: string; isComplete?: boolean }) => (
                      <MenuItem key={gw.id} value={gw.id.toString()}>
                        Gameweek {gw.id}{gw.isComplete ? ' (Complete)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                onClick={applyFilters}
                disabled={loading}
                variant="contained"
                color="primary"
              >
                {loading ? 'Applying...' : 'Apply Filters'}
              </Button>
              <Button
                onClick={clearFilters}
                disabled={loading}
                variant="outlined"
                color="secondary"
              >
                Clear
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Performance Sorting Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sort by Performance
            </Typography>
            
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="">No Sorting</MenuItem>
                    <MenuItem value="points">Points</MenuItem>
                    <MenuItem value="goals">Goals</MenuItem>
                    <MenuItem value="assists">Assists</MenuItem>
                    <MenuItem value="cleanSheets">Clean Sheets</MenuItem>
                    <MenuItem value="saves">Saves</MenuItem>
                    <MenuItem value="cost">Cost</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    label="Order"
                  >
                    <MenuItem value="desc">Highest First</MenuItem>
                    <MenuItem value="asc">Lowest First</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeStats}
                      onChange={(e) => setIncludeStats(e.target.checked)}
                    />
                  }
                  label="Show Performance Stats"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Players List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Players ({filteredPlayers.length})
            </Typography>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">Loading players...</Typography>
              </Box>
            ) : filteredPlayers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No players found matching your filters.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredPlayers.map((player) => {
                  const playerWithStats = player as PlayerWithStatsDto
                  const hasStats = playerWithStats.stats !== null && playerWithStats.stats !== undefined
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={player.id}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: 3,
                            borderColor: 'primary.main',
                          },
                          border: 1,
                          borderColor: 'divider',
                        }}
                        onClick={() => handlePlayerClick(player.id)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {player.pictureUrl ? (
                              <Avatar src={player.pictureUrl} alt={player.name || 'Player'} sx={{ width: 40, height: 40 }} />
                            ) : (
                              <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                                {getPositionAbbr(player.position)}
                              </Avatar>
                            )}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" fontWeight="medium">
                                {player.name || 'Unknown Player'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {player.teamName || 'Unknown Team'} • {getPositionAbbr(player.position)}
                              </Typography>
                            </Box>
                            <Typography variant="h6" color="primary" fontWeight="semibold">
                              £{player.cost.toFixed(1)}m
                            </Typography>
                          </Box>

                          {hasStats && playerWithStats.stats && (
                            <Paper
                              variant="outlined"
                              sx={{
                                mt: 1,
                                p: 1,
                                borderLeft: 3,
                                borderLeftColor: 'primary.main',
                                bgcolor: 'action.hover',
                              }}
                            >
                              <Grid container spacing={1}>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="caption" component="div">
                                    <strong>Points:</strong>{' '}
                                    <Typography component="span" color="primary" fontWeight="bold">
                                      {playerWithStats.stats.totalPoints}
                                    </Typography>
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="caption" component="div">
                                    <strong>Goals:</strong> {playerWithStats.stats.totalGoals}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="caption" component="div">
                                    <strong>Assists:</strong> {playerWithStats.stats.totalAssists}
                                  </Typography>
                                </Grid>
                                {playerWithStats.stats.totalCleanSheets > 0 && (
                                  <Grid item xs={6} sm={4}>
                                    <Typography variant="caption" component="div">
                                      <strong>CS:</strong> {playerWithStats.stats.totalCleanSheets}
                                    </Typography>
                                  </Grid>
                                )}
                                {playerWithStats.stats.totalSaves > 0 && (
                                  <Grid item xs={6} sm={4}>
                                    <Typography variant="caption" component="div">
                                      <strong>Saves:</strong> {playerWithStats.stats.totalSaves}
                                    </Typography>
                                  </Grid>
                                )}
                                <Grid item xs={6} sm={4}>
                                  <Typography variant="caption" color="text.secondary" component="div">
                                    <strong>Games:</strong> {playerWithStats.stats.gamesPlayed}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Paper>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
