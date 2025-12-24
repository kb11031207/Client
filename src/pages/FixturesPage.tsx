import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import { type FixtureDto, type FixtureDetailsDto } from '../services/fixture.service'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { fetchAllGameweeks } from '../store/slices/gameweekSlice'
import { fetchFixturesByGameweek, fetchFixtureDetails, clearFixtures } from '../store/slices/fixtureSlice'
import { useNotification } from '../hooks/useNotification'

/**
 * Fixtures Page
 * 
 * Displays fixtures for selected gameweeks. Public page - no login required.
 * Uses Redux for state management.
 */
export function FixturesPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { showError } = useNotification()
  
  // Get data from Redux
  const { gameweeks, isLoading: gameweeksLoading } = useAppSelector((state) => state.gameweeks)
  const { fixtures, fixtureDetails, isLoading, isLoadingDetails, error } = useAppSelector((state) => state.fixtures)
  
  // UI state (local - for dialog and dropdown selection)
  const [selectedGameweek, setSelectedGameweek] = useState<number | ''>('')
  const [selectedFixture, setSelectedFixture] = useState<FixtureDto | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Load gameweeks on mount
  useEffect(() => {
    dispatch(fetchAllGameweeks())
  }, [dispatch])

  // Load fixtures when gameweek changes
  useEffect(() => {
    if (selectedGameweek) {
      dispatch(fetchFixturesByGameweek(selectedGameweek as number))
    } else {
      dispatch(clearFixtures())
    }
  }, [selectedGameweek, dispatch])

  // Show error notifications from Redux
  useEffect(() => {
    if (error) {
      showError(error)
    }
  }, [error, showError])


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isFixtureComplete = (fixture: FixtureDto) => {
    return fixture.isComplete || (fixture.homeScore !== null && fixture.awayScore !== null)
  }

  const loadFixtureDetails = (fixture: FixtureDto) => {
    setSelectedFixture(fixture)
    setDetailsOpen(true)
    
    // Check if we already have the details cached
    const cachedDetails = fixtureDetails[fixture.id]
    if (!cachedDetails) {
      // Fetch details if not cached
      dispatch(fetchFixtureDetails(fixture.id))
    }
  }

  // Get fixture details from Redux cache
  const getFixtureDetails = (): FixtureDetailsDto | null => {
    if (!selectedFixture) return null
    return fixtureDetails[selectedFixture.id] || null
  }

  const formatGameweekLabel = (gameweek: { id: number; number?: number; startDate: string; isCurrent?: boolean }) => {
    const gameweekNumber = gameweek.number || gameweek.id
    
    // Validate and format the date
    let dateStr = ''
    if (gameweek.startDate) {
      const date = new Date(gameweek.startDate)
      // Check if the date is valid
      if (!isNaN(date.getTime())) {
        dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    }
    
    // If date is invalid or missing, just show the gameweek number
    if (!dateStr) {
      return gameweek.isCurrent 
        ? `Gameweek ${gameweekNumber} (Current)`
        : `Gameweek ${gameweekNumber}`
    }
    
    return gameweek.isCurrent 
      ? `Gameweek ${gameweekNumber} (Current) - ${dateStr}`
      : `Gameweek ${gameweekNumber} - ${dateStr}`
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Fixtures
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/dashboard')}
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Gameweek Selector */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>Select Gameweek</InputLabel>
            <Select
              value={selectedGameweek}
              onChange={(e) => setSelectedGameweek(e.target.value as number | '')}
              label="Select Gameweek"
              disabled={gameweeksLoading}
            >
              <MenuItem value="">
                <em>Select a gameweek</em>
              </MenuItem>
              {gameweeks.map((gameweek) => (
                <MenuItem key={gameweek.id} value={gameweek.id}>
                  {formatGameweekLabel(gameweek)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Fixtures List */}
      {!isLoading && selectedGameweek && fixtures.length > 0 && (
        <Grid container spacing={2}>
          {fixtures.map((fixture) => {
            const complete = isFixtureComplete(fixture)
            const hasScores = fixture.homeScore !== null && fixture.awayScore !== null
            
            return (
              <Grid item xs={12} sm={6} md={4} key={fixture.id}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => loadFixtureDetails(fixture)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        label={complete ? 'Complete' : 'Upcoming'} 
                        color={complete ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {fixture.homeTeamName || `Team ${fixture.homeTeamId}`}
                      </Typography>
                      {hasScores ? (
                        <Typography variant="h4" component="div" sx={{ my: 1 }}>
                          {fixture.homeScore} - {fixture.awayScore}
                        </Typography>
                      ) : (
                        <Typography variant="h6" component="div" sx={{ my: 1, color: 'text.secondary' }}>
                          vs
                        </Typography>
                      )}
                      <Typography variant="h6" component="div">
                        {fixture.awayTeamName || `Team ${fixture.awayTeamId}`}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      {formatDate(fixture.kickoff)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Empty State */}
      {!isLoading && selectedGameweek && fixtures.length === 0 && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No fixtures found for this gameweek.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* No Selection State */}
      {!selectedGameweek && !isLoading && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              Please select a gameweek to view fixtures.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Fixture Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => {
          setDetailsOpen(false)
          setSelectedFixture(null)
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '400px'
          }
        }}
      >
        <DialogTitle>
          {selectedFixture ? (
            <>
              <Typography variant="h6" component="div">
                {selectedFixture.homeTeamName || `Team ${selectedFixture.homeTeamId}`} vs {selectedFixture.awayTeamName || `Team ${selectedFixture.awayTeamId}`}
              </Typography>
              {(() => {
                const details = getFixtureDetails()
                return details && details.homeScore !== null && details.awayScore !== null && (
                  <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                    {details.homeScore} - {details.awayScore}
                  </Typography>
                )
              })()}
            </>
          ) : (
            <Typography variant="h6">Fixture Details</Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {isLoadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (() => {
            const details = getFixtureDetails()
            return details && selectedFixture ? (
              <>
                {details.playerStats && details.playerStats.length > 0 ? (
                  <Grid container spacing={3}>
                    {/* Home Team Lineup */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        {details.homeTeamName || `Team ${details.homeTeamId}`}
                      </Typography>
                      <List>
                        {details.playerStats
                          .filter((player) => player.teamId === details.homeTeamId)
                          .map((player) => (
                            <ListItem key={player.playerId}>
                              <ListItemText
                                primary={player.playerName || `Player ${player.playerId}`}
                                secondary={
                                  `Goals: ${player.goals}, Assists: ${player.assists}, Minutes: ${player.minutesPlayed}`
                                }
                              />
                            </ListItem>
                          ))}
                        {details.playerStats.filter((p) => p.teamId === details.homeTeamId).length === 0 && (
                          <ListItem>
                            <ListItemText primary="No players found for home team" />
                          </ListItem>
                        )}
                      </List>
                    </Grid>

                    {/* Away Team Lineup */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        {details.awayTeamName || `Team ${details.awayTeamId}`}
                      </Typography>
                      <List>
                        {details.playerStats
                          .filter((player) => player.teamId === details.awayTeamId)
                          .map((player) => (
                            <ListItem key={player.playerId}>
                              <ListItemText
                                primary={player.playerName || `Player ${player.playerId}`}
                                secondary={
                                  `Goals: ${player.goals}, Assists: ${player.assists}, Minutes: ${player.minutesPlayed}`
                                }
                              />
                            </ListItem>
                          ))}
                        {details.playerStats.filter((p) => p.teamId === details.awayTeamId).length === 0 && (
                          <ListItem>
                            <ListItemText primary="No players found for away team" />
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      Player stats not available for this fixture.
                    </Typography>
                  </Box>
                )}
              </>
            ) : selectedFixture ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Loading fixture details...
                </Typography>
              </Box>
            ) : null
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDetailsOpen(false)
            setSelectedFixture(null)
          }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

