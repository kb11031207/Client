import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
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
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useNotification } from '../hooks/useNotification'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { fetchAllGameweeks, fetchCurrentGameweek } from '../store/slices/gameweekSlice'
import { fetchLeagueDetails, fetchStandings, joinLeague, leaveLeague, deleteLeague, kickMember } from '../store/slices/leagueSlice'
import { type LeagueDetailsDto, type LeagueMemberDto } from '../services/league.service'
import { UserSquadModal } from '../components/UserSquadModal'

/**
 * League Details Page
 * 
 * Displays league information, members, and standings.
 * Uses Redux for state management.
 */

export function LeagueDetailsPage() {
  const { leagueId: leagueIdParam } = useParams<{ leagueId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { showError, showSuccess } = useNotification()
  
  // Redux state
  const auth = useAppSelector((state) => state.auth)
  const { gameweeks, currentGameweek, error: gameweeksError } = useAppSelector((state) => state.gameweeks)
  const { currentLeague, standings, isLoading, isLoadingStandings, error } = useAppSelector((state) => state.leagues)
  
  const userId = auth.user?.id || null
  
  // Local UI state
  const [selectedGameweekId, setSelectedGameweekId] = useState<number | null>(null)
  
  // Dialog states (UI-only, can stay as useState)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [kickDialogOpen, setKickDialogOpen] = useState(false)
  const [memberToKick, setMemberToKick] = useState<number | null>(null)
  
  // Squad modal states (UI-only, can stay as useState)
  const [squadModalOpen, setSquadModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null)

  const leagueId = leagueIdParam ? parseInt(leagueIdParam) : null

  // Get league from Redux (type casting needed)
  const league = currentLeague as LeagueDetailsDto | null

  // Calculate member count and permissions
  const memberCount = league?.members
    ? (league.members.some((m) => m.userId === league.owner) 
        ? league.members.length 
        : league.members.length + 1)
    : 1
  
  const isOwner = league && userId ? league.owner === userId : false
  const isMember = isOwner || (league?.members?.some((m) => m.userId === userId) || false)

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

  // Load league details
  useEffect(() => {
    if (!leagueId || !userId) {
      return
    }

    dispatch(fetchLeagueDetails(leagueId))
  }, [leagueId, userId, dispatch])

  // Auto-select current gameweek when available
  useEffect(() => {
    if (currentGameweek && !selectedGameweekId) {
      setSelectedGameweekId(currentGameweek.id)
    }
  }, [currentGameweek, selectedGameweekId])

  // Load standings when gameweek is selected
  useEffect(() => {
    if (!leagueId || !selectedGameweekId) {
      return
    }

    dispatch(fetchStandings({ leagueId, gameweekId: selectedGameweekId }))
  }, [leagueId, selectedGameweekId, dispatch])

  // Show error notifications from Redux
  useEffect(() => {
    if (error) {
      showError(error)
    }
    if (gameweeksError) {
      showError(gameweeksError)
    }
  }, [error, gameweeksError, showError])

  const loading = isLoading
  const loadingStandings = isLoadingStandings

  const handleGameweekChange = (gameweekId: number | '') => {
    if (gameweekId === '') {
      setSelectedGameweekId(null)
    } else {
      setSelectedGameweekId(gameweekId)
    }
  }

  const handleViewSquad = (userId: number, username?: string | null) => {
    setSelectedUserId(userId)
    setSelectedUsername(username || null)
    setSquadModalOpen(true)
  }

  const handleCloseSquadModal = () => {
    setSquadModalOpen(false)
    setSelectedUserId(null)
    setSelectedUsername(null)
  }

  const handleJoinLeague = async () => {
    if (!leagueId || !userId) return
    
    try {
      const result = await dispatch(joinLeague({ leagueId, userId }))
      
      if (joinLeague.fulfilled.match(result)) {
        showSuccess('Successfully joined the league!')
        setJoinDialogOpen(false)
        // Reload league details
        dispatch(fetchLeagueDetails(leagueId))
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to join league. '
      if (err instanceof Error) {
        if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
          errorMessage += 'You do not have permission to join this league.'
        } else if (err.message?.includes('400') || err.message?.includes('Bad Request')) {
          errorMessage += 'You may already be a member of this league, or the league may be private.'
        } else {
          errorMessage += err.message || 'Please try again.'
        }
      }
      showError(errorMessage)
    }
  }

  const handleLeaveLeague = async () => {
    if (!leagueId || !userId) return
    
    try {
      const result = await dispatch(leaveLeague({ leagueId, userId }))
      
      if (leaveLeague.fulfilled.match(result)) {
        showSuccess('Successfully left the league.')
        setLeaveDialogOpen(false)
        navigate('/leagues')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to leave league. Please try again.'
      showError(message)
    }
  }

  const handleDeleteLeague = async () => {
    if (!leagueId) return
    
    try {
      const result = await dispatch(deleteLeague(leagueId))
      
      if (deleteLeague.fulfilled.match(result)) {
        showSuccess('League deleted successfully.')
        setDeleteDialogOpen(false)
        navigate('/leagues')
      }
    } catch (err: unknown) {
      let errorMessage = 'Failed to delete league. '
      if (err instanceof Error) {
        if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
          errorMessage += 'You do not have permission to delete this league.'
        } else if (err.message?.includes('404') || err.message?.includes('Not Found')) {
          errorMessage += 'League not found.'
        } else {
          errorMessage += err.message || 'Please try again.'
        }
      }
      showError(errorMessage)
    }
  }

  const handleKickMember = async () => {
    if (!leagueId || !memberToKick) return
    
    try {
      const result = await dispatch(kickMember({ leagueId, userId: memberToKick }))
      
      if (kickMember.fulfilled.match(result)) {
        showSuccess('Member removed from league.')
        setKickDialogOpen(false)
        setMemberToKick(null)
        // Reload league details
        dispatch(fetchLeagueDetails(leagueId))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove member. Please try again.'
      showError(message)
    }
  }

  const openKickDialog = (memberId: number) => {
    setMemberToKick(memberId)
    setKickDialogOpen(true)
  }

  if (loading && !league) {
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
            Loading league...
          </Typography>
        </Box>
      </Container>
    )
  }

  if ((error || !league) && !loading) {
    return (
      <Container>
        <Box sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              League Details
            </Typography>
            <Button component={Link} to="/leagues" variant="outlined" color="secondary">
              Back to Leagues
            </Button>
          </Box>
          <Alert severity="error">{error || 'League not found'}</Alert>
        </Box>
      </Container>
    )
  }

  if (!league || !userId) {
    return null
  }

  const leagueType = league.type ? 'Public' : 'Private'

  // Get all members including owner if not in members array
  const allMembers: (LeagueMemberDto & { isOwner: boolean })[] = []
  const ownerInMembers = league.members?.some((m) => m.userId === league.owner) || false
  
  if (!ownerInMembers) {
    allMembers.push({
      userId: league.owner,
      username: league.ownerUsername || null,
      school: null,
      isOwner: true,
    })
  }
  
  league.members?.forEach((member) => {
    allMembers.push({
      ...member,
      isOwner: member.userId === league.owner,
    })
  })

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            League Details
          </Typography>
          <Button component={Link} to="/leagues" variant="outlined" color="secondary">
            Back to Leagues
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* League Info Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  League Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      League ID
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      League #{league.id}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Type
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={leagueType}
                        color={league.type ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Owner
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {league.ownerUsername || `User #${league.owner}`}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Members
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {memberCount}
                    </Typography>
                  </Box>
                  {!league.type && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: 'action.hover',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Share League ID
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          userSelect: 'all',
                          mt: 0.5,
                        }}
                      >
                        {league.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Share this ID with others so they can join your private league.
                      </Typography>
                    </Paper>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {isOwner ? (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={isLoading}
                      >
                        Delete League
                      </Button>
                    ) : isMember ? (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => setLeaveDialogOpen(true)}
                        disabled={isLoading}
                      >
                        Leave League
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => setJoinDialogOpen(true)}
                        disabled={isLoading}
                      >
                        Join League
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* League Members Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Members ({memberCount})
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {allMembers.map((member) => (
                    <Paper
                      key={member.userId}
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {member.username || `User #${member.userId}`}
                          </Typography>
                          {member.isOwner && (
                            <Chip label="Owner" color="primary" size="small" />
                          )}
                        </Box>
                        {member.school && (
                          <Typography variant="caption" color="text.secondary">
                            {member.school}
                          </Typography>
                        )}
                      </Box>
                      {isOwner && member.userId !== userId && !member.isOwner && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => openKickDialog(member.userId)}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      )}
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Standings Section */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">
                Standings
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
                      Gameweek {gw.id}{(gw as { isComplete?: boolean }).isComplete ? ' (Complete)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {loadingStandings ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading standings...
                </Typography>
              </Box>
            ) : !selectedGameweekId ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Select a gameweek to view standings.
                </Typography>
              </Box>
            ) : !standings || standings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No standings available for this gameweek.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Rank</strong></TableCell>
                      <TableCell><strong>Username</strong></TableCell>
                      <TableCell align="right"><strong>Total Points</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {standings.map((entry) => (
                      <TableRow 
                        key={entry.userId}
                        onClick={() => handleViewSquad(entry.userId, entry.username)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight="bold">{entry.rank}</Typography>
                        </TableCell>
                        <TableCell>{entry.username || `User #${entry.userId}`}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="semibold">{entry.totalPoints}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Join League Dialog */}
      <Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)}>
        <DialogTitle>Join League</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to join this league?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleJoinLeague} color="primary" variant="contained" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave League Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)}>
        <DialogTitle>Leave League</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to leave this league?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleLeaveLeague} color="error" variant="contained" disabled={isLoading}>
            {isLoading ? 'Leaving...' : 'Leave'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete League Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete League</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this league? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteLeague} color="error" variant="contained" disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kick Member Dialog */}
      <Dialog open={kickDialogOpen} onClose={() => setKickDialogOpen(false)}>
        <DialogTitle>Remove Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this member from the league?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKickDialogOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleKickMember} color="error" variant="contained" disabled={isLoading}>
            {isLoading ? 'Removing...' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Squad Modal */}
      {selectedUserId && selectedGameweekId && (
        <UserSquadModal
          open={squadModalOpen}
          userId={selectedUserId}
          username={selectedUsername}
          gameweekId={selectedGameweekId}
          onClose={handleCloseSquadModal}
        />
      )}
    </Container>
  )
}


