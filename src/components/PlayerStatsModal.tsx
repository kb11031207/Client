import { useState, useEffect, useCallback } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import type { PlayerDto, PlayerStatsDto, PlayerFixtureStatsDto } from '../services/player.service'
import type { FixtureDto } from '../services/fixture.service'
import { playerService } from '../services/player.service'
import { gameweekService } from '../services/gameweek.service'
import { apiClient } from '../services/api-client'
import { getPositionName, getPositionAbbr } from '../utils/squad-validator'

/**
 * Player Stats Modal Component
 * 
 * Material UI Dialog for viewing player stats.
 */
export interface PlayerStatsModalProps {
  open: boolean
  player: PlayerDto | null
  gameweekId: number
  onClose: () => void
}

export function PlayerStatsModal({ open, player, gameweekId, onClose }: PlayerStatsModalProps) {
  const [stats, setStats] = useState<PlayerStatsDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teamFixtures, setTeamFixtures] = useState<FixtureDto[]>([])
  const [loadingFixtures, setLoadingFixtures] = useState(false)

  const loadTeamFixtures = useCallback(async () => {
    if (!player?.teamId) return

    try {
      setLoadingFixtures(true)
      // Use the fixtures API endpoint which should include scores
      const allFixtures = await apiClient.get(`/api/Fixtures/gameweek/${gameweekId}`) as FixtureDto[]
      
      // Filter fixtures where player's team is playing
      const fixtures = allFixtures.filter(
        (fixture: FixtureDto) => 
          fixture.homeTeamId === player.teamId || fixture.awayTeamId === player.teamId
      )
      
      setTeamFixtures(fixtures)
    } catch (err: unknown) {
      console.error('Failed to load fixtures:', err)
      // Don't set error, just leave fixtures empty
    } finally {
      setLoadingFixtures(false)
    }
  }, [player?.teamId, gameweekId])

  const loadStats = useCallback(async () => {
    if (!player) return

    setLoading(true)
    setError(null)
    setTeamFixtures([])

    try {
      const playerStats = await playerService.getPlayerStats(player.id, gameweekId) as PlayerStatsDto
      setStats(playerStats)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load player stats.'
      
      // If 404, try to load team fixtures instead
      if (err instanceof Error && (err.message?.includes('404') || err.message?.includes('Not Found'))) {
        setError(null) // Don't show error, we'll show fixtures instead
        await loadTeamFixtures()
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }, [player, gameweekId, loadTeamFixtures])

  useEffect(() => {
    if (open && player) {
      loadStats()
    } else {
      setStats(null)
      setError(null)
      setTeamFixtures([])
    }
  }, [open, player, gameweekId, loadStats])

  if (!player) return null

  const positionName = player.positionDisplay || getPositionName(player.position)
  const positionAbbr = getPositionAbbr(player.position)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Player Stats</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Player Info */}
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          mb={3}
          p={2}
          sx={{
            backgroundColor: 'background.default',
            borderRadius: 1,
          }}
        >
          {player.pictureUrl ? (
            <Box
              component="img"
              src={player.pictureUrl}
              alt={player.name || 'Player'}
              sx={{
                width: 60,
                height: 60,
                borderRadius: 1,
                objectFit: 'cover',
                border: '2px solid',
                borderColor: 'divider',
              }}
            />
          ) : (
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 1,
                backgroundColor: 'background.default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem',
                border: '2px solid',
                borderColor: 'divider',
              }}
            >
              {positionAbbr}
            </Box>
          )}
          <Box>
            <Typography variant="h6">{player.name || 'Unknown Player'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {player.teamName || 'Unknown Team'} • {positionName} • £{player.cost.toFixed(1)}m
            </Typography>
          </Box>
        </Box>

        {loading || loadingFixtures ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" p={2}>
            {error}
          </Typography>
        ) : teamFixtures.length > 0 ? (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              This player did not play in Gameweek {gameweekId}, but here are their team&apos;s fixtures:
            </Alert>
            
            <Typography variant="h6" gutterBottom>
              Team Fixtures
            </Typography>
            {teamFixtures.map((fixture) => {
              const isHome = fixture.homeTeamId === player.teamId
              const opponentName = isHome ? fixture.awayTeamName : fixture.homeTeamName
              const teamScore = isHome ? fixture.homeScore : fixture.awayScore
              const opponentScore = isHome ? fixture.awayScore : fixture.homeScore
              
              // Check if fixture has scores (show scores if they exist, regardless of isComplete flag)
              const hasScores = teamScore !== null && teamScore !== undefined && 
                opponentScore !== null && opponentScore !== undefined
              
              // Also check if kickoff is in the past as additional indicator for completion
              const kickoffDate = new Date(fixture.kickoff)
              const isPast = kickoffDate < new Date()
              const isComplete = fixture.isComplete || (isPast && hasScores)
              
              return (
                <Paper
                  key={fixture.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 1,
                    backgroundColor: 'background.default',
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    {hasScores
                      ? `${player.teamName} ${teamScore} - ${opponentScore} ${opponentName}`
                      : `${player.teamName} vs ${opponentName}`
                    }
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(fixture.kickoff).toLocaleDateString()} at {new Date(fixture.kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isComplete ? ' • Complete' : ' • Scheduled'}
                  </Typography>
                </Paper>
              )
            })}
          </Box>
        ) : stats ? (
          <Box>
            {/* Points Earned */}
            <Box
              p={3}
              mb={2}
              sx={{
                backgroundColor: 'primary.light',
                borderRadius: 1,
                border: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Points Earned (Gameweek {gameweekId})
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.pointsEarned}
              </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={6} sm={4}>
                <Box p={2} sx={{ backgroundColor: 'background.default', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Goals
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.goals}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box p={2} sx={{ backgroundColor: 'background.default', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Assists
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.assists}
                  </Typography>
                </Box>
              </Grid>
              {stats.cleanSheet && (
                <Grid item xs={6} sm={4}>
                  <Box p={2} sx={{ backgroundColor: 'background.default', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Clean Sheet
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      ✓
                    </Typography>
                  </Box>
                </Grid>
              )}
              {stats.saves > 0 && (
                <Grid item xs={6} sm={4}>
                  <Box p={2} sx={{ backgroundColor: 'background.default', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Saves
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stats.saves}
                    </Typography>
                  </Box>
                </Grid>
              )}
              <Grid item xs={6} sm={4}>
                <Box p={2} sx={{ backgroundColor: 'background.default', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Minutes Played
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats.minutesPlayed}
                  </Typography>
                </Box>
              </Grid>
              {stats.shots > 0 && (
                <Grid item xs={6} sm={4}>
                  <Box p={2} sx={{ backgroundColor: 'background.default', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Shots
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stats.shots}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Fixtures */}
            {stats.fixtures && stats.fixtures.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Fixtures
                </Typography>
                {stats.fixtures.map((fixture, index) => (
                  <Box
                    key={fixture.fixtureId || index}
                    p={2}
                    mb={1}
                    sx={{
                      backgroundColor: 'background.default',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {fixture.homeTeamName} {fixture.homeScore} - {fixture.awayScore} {fixture.awayTeamName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(fixture.kickoff).toLocaleDateString()} • {fixture.pointsEarned} pts
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary" align="center" p={2}>
            No stats available for this gameweek.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}




