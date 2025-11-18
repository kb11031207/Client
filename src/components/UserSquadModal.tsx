import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material'
import { squadService } from '../services/squad.service'
import { playerService, type PlayerDto } from '../services/player.service'
import { useNotification } from '../hooks/useNotification'
import { PlayerStatsModal } from './PlayerStatsModal'

interface SquadPlayerDto {
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

interface SquadDto {
  id: number
  userId: number
  gameweekId: number
  players?: SquadPlayerDto[] | null
  totalCost?: number
  totalPoints?: number
}

interface UserSquadModalProps {
  open: boolean
  userId: number
  username?: string | null
  gameweekId: number
  onClose: () => void
}

export function UserSquadModal({ open, userId, username, gameweekId, onClose }: UserSquadModalProps) {
  const [squad, setSquad] = useState<SquadDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDto | null>(null)
  const [loadingPlayer, setLoadingPlayer] = useState(false)
  const { showError } = useNotification()

  const loadSquad = async () => {
    try {
      setLoading(true)
      setError(null)
      const squadData = await squadService.getUserSquadForGameweek(userId, gameweekId) as SquadDto
      setSquad(squadData)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load squad.'
      setError(message)
      showError(message)
      setSquad(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && userId && gameweekId) {
      loadSquad()
    } else {
      setSquad(null)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId, gameweekId])

  const handlePlayerClick = async (playerId: number) => {
    try {
      setLoadingPlayer(true)
      const player = await playerService.getPlayer(playerId) as PlayerDto
      setSelectedPlayer(player)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load player details.'
      showError(message)
    } finally {
      setLoadingPlayer(false)
    }
  }

  const handleClosePlayerStats = () => {
    setSelectedPlayer(null)
  }

  const positionNames: { [key: number]: string } = {
    1: 'GK',
    2: 'DEF',
    3: 'MID',
    4: 'FWD'
  }

  const getPositionName = (position: number): string => {
    const names: { [key: number]: string } = {
      1: 'Goalkeeper',
      2: 'Defender',
      3: 'Midfielder',
      4: 'Forward'
    }
    return names[position] || 'Unknown'
  }

  // Group players by position
  const starters = squad?.players?.filter(p => p.isStarter) || []
  const bench = squad?.players?.filter(p => !p.isStarter) || []
  const captain = squad?.players?.find(p => p.isCaptain)
  const viceCaptain = squad?.players?.find(p => p.isVice)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {username || `User #${userId}`}&apos;s Squad - Gameweek {gameweekId}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Loading squad...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : !squad ? (
          <Alert severity="info">
            This user doesn&apos;t have a squad for Gameweek {gameweekId}.
          </Alert>
        ) : (
          <Box>
            {/* Squad Summary */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Total Points
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {squad.totalPoints || 0}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Squad Value
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    £{squad.totalCost?.toFixed(1) || '0.0'}m
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Players
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {squad.players?.length || 0} / 15
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Starting XI */}
            {starters.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Starting XI
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {[1, 2, 3, 4].map(position => {
                    const positionPlayers = starters.filter(p => p.position === position)
                    if (positionPlayers.length === 0) return null

                    return (
                      <Box key={position} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          {getPositionName(position)} ({positionPlayers.length})
                        </Typography>
                        {positionPlayers.map((player) => (
                          <Box
                            key={player.playerId}
                            onClick={() => handlePlayerClick(player.playerId)}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 0.75,
                              px: 1,
                              mb: 0.5,
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'action.selected',
                                transform: 'translateX(4px)',
                                transition: 'all 0.2s ease',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ minWidth: 40, fontWeight: 'medium' }}>
                                {positionNames[player.position]}
                              </Typography>
                              <Typography variant="body2">
                                {player.playerName || 'Unknown'}
                              </Typography>
                              {player.isCaptain && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    px: 0.5,
                                    py: 0.25,
                                    borderRadius: 0.5,
                                    fontWeight: 'bold',
                                  }}
                                >
                                  C
                                </Typography>
                              )}
                              {player.isVice && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    bgcolor: 'secondary.main',
                                    color: 'white',
                                    px: 0.5,
                                    py: 0.25,
                                    borderRadius: 0.5,
                                    fontWeight: 'bold',
                                  }}
                                >
                                  V
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {player.teamName || 'Unknown'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                £{player.playerCost.toFixed(1)}m
                              </Typography>
                              <Typography 
                                variant="body2" 
                                fontWeight="medium" 
                                color={player.points !== null && player.points !== undefined && player.points > 0 ? 'primary.main' : 'text.secondary'}
                              >
                                {player.points !== null && player.points !== undefined ? `${player.points} pts` : '0 pts'}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )
                  })}
                </Paper>
              </Box>
            )}

            {/* Bench */}
            {bench.length > 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Bench ({bench.length})
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {bench.map((player) => (
                    <Box
                      key={player.playerId}
                      onClick={() => handlePlayerClick(player.playerId)}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 0.75,
                        px: 1,
                        mb: 0.5,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.selected',
                          transform: 'translateX(4px)',
                          transition: 'all 0.2s ease',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ minWidth: 40, fontWeight: 'medium' }}>
                          {positionNames[player.position]}
                        </Typography>
                        <Typography variant="body2">
                          {player.playerName || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {player.teamName || 'Unknown'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          £{player.playerCost.toFixed(1)}m
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium" 
                          color={player.points !== null && player.points !== undefined && player.points > 0 ? 'primary.main' : 'text.secondary'}
                        >
                          {player.points !== null && player.points !== undefined ? `${player.points} pts` : '0 pts'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Box>
            )}

            {/* Captain/Vice Info */}
            {(captain || viceCaptain) && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                {captain && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Captain:</strong> {captain.playerName || 'Unknown'}
                  </Typography>
                )}
                {viceCaptain && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Vice-Captain:</strong> {viceCaptain.playerName || 'Unknown'}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

      {/* Player Stats Modal */}
      {selectedPlayer && (
        <PlayerStatsModal
          open={!!selectedPlayer}
          player={selectedPlayer}
          gameweekId={gameweekId}
          onClose={handleClosePlayerStats}
        />
      )}
    </Dialog>
  )
}

