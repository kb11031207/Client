import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Container,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { type PlayerDto } from '../services/player.service'
import { type SquadPlayerDto } from '../services/squad.service'
import { validateSquad, getPositionName, getPositionAbbr } from '../utils/squad-validator'
import { PlayerStatsModal } from '../components/PlayerStatsModal.tsx'
import { useNotification } from '../hooks/useNotification'
import { fetchAllPlayers, searchPlayers, setFilteredPlayers, extractTeams } from '../store/slices/playerSlice'
import { fetchAllGameweeks, fetchCurrentGameweek } from '../store/slices/gameweekSlice'
import { fetchSquadForGameweek, createSquad, updateSquad, generateRandomSquad } from '../store/slices/squadSlice'
import { sanitizeSearchQuery } from '../utils/sanitize'

/**
 * Squad Builder Page
 * 
 * Allows users to create and edit their squad for a specific gameweek.
 * Uses Redux for state management.
 */
interface SquadState {
  players: PlayerDto[]
  starterIds: number[]
  captainId: number | null
  viceCaptainId: number | null
  gameweekId: number
  budget: number
}

// SquadPlayerFromApi is now SquadPlayerDto from squad.service
type SquadPlayerFromApi = SquadPlayerDto

export function SquadPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { gameweekId: gameweekIdParam } = useParams<{ gameweekId?: string }>()
  const auth = useAppSelector((state) => state.auth)
  const { showError, showSuccess } = useNotification()
  
  // Redux state
  const { players, filteredPlayers, teams, isLoading: playersLoading } = useAppSelector((state) => state.players)
  const { gameweeks, currentGameweek, isLoading: gameweeksLoading } = useAppSelector((state) => state.gameweeks)
  const { currentSquad, isLoading: squadLoading } = useAppSelector((state) => state.squads)
  
  // Local UI state - squad draft state (working state until saved)
  const [squadState, setSquadState] = useState<SquadState>({
    players: [],
    starterIds: [],
    captainId: null,
    viceCaptainId: null,
    gameweekId: 1,
    budget: 100,
  })
  
  const [saving, setSaving] = useState(false)
  const [generatingRandom, setGeneratingRandom] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  // Filter state (UI-only, can stay as useState)
  const [searchTerm, setSearchTerm] = useState('')
  const [position, setPosition] = useState<string>('')
  const [teamId, setTeamId] = useState<string>('')
  const [minCost, setMinCost] = useState<string>('')
  const [maxCost, setMaxCost] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [includeStats, setIncludeStats] = useState(false)
  const [statsGameweekId, setStatsGameweekId] = useState<string>('')
  
  // Player stats modal state (UI-only, can stay as useState)
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<PlayerDto | null>(null)
  
  // Selected gameweek state for the selector
  const [selectedGameweekId, setSelectedGameweekId] = useState<number | null>(null)

  const loading = playersLoading || gameweeksLoading || squadLoading

  // Load initial data (players, gameweeks)
  useEffect(() => {
    const loadData = async () => {
      if (!auth.user?.id) {
        showError('User ID not found')
        return
      }

      try {
        await Promise.all([
          dispatch(fetchAllPlayers()),
          dispatch(fetchAllGameweeks()),
          dispatch(fetchCurrentGameweek())
        ])
        
        // Extract teams when players are loaded
        if (players.length > 0 && teams.length === 0) {
          dispatch(extractTeams())
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load data. Please try again.'
        showError(message)
      }
    }

    loadData()
  }, [auth.user?.id, dispatch, showError, players.length, teams.length])

  // Extract teams when players are loaded
  useEffect(() => {
    if (players.length > 0 && teams.length === 0) {
      dispatch(extractTeams())
    }
  }, [players, teams.length, dispatch])

  // Determine gameweek ID from URL or current gameweek
  useEffect(() => {
    let resolvedGameweekId: number | null = null
    
    if (gameweekIdParam) {
      resolvedGameweekId = parseInt(gameweekIdParam)
      if (isNaN(resolvedGameweekId)) {
        resolvedGameweekId = null
      }
    } else if (currentGameweek) {
      resolvedGameweekId = currentGameweek.id
    } else if (gameweeks.length > 0) {
      resolvedGameweekId = gameweeks[0]?.id || null
    }

    if (resolvedGameweekId && resolvedGameweekId !== selectedGameweekId) {
      setSelectedGameweekId(resolvedGameweekId)
    }
  }, [gameweekIdParam, currentGameweek, gameweeks, selectedGameweekId])

  // Load squad when gameweek is selected
  useEffect(() => {
    if (!auth.user?.id || !selectedGameweekId) {
      return
    }

    dispatch(fetchSquadForGameweek({ userId: auth.user.id, gameweekId: selectedGameweekId }))
  }, [auth.user?.id, selectedGameweekId, dispatch])

  // Initialize squad state from Redux when squad is loaded
  useEffect(() => {
    if (!currentSquad || !selectedGameweekId || currentSquad.gameweekId !== selectedGameweekId) {
      // Reset to empty squad if no squad or different gameweek
      if (selectedGameweekId) {
        setSquadState({
          players: [],
          starterIds: [],
          captainId: null,
          viceCaptainId: null,
          gameweekId: selectedGameweekId,
          budget: 100,
        })
      }
      return
    }

    // Initialize from existing squad
    const existingSquad = currentSquad
    if (existingSquad && existingSquad.players) {
      const squadPlayers = existingSquad.players.map((sp: SquadPlayerFromApi) => {
        const player = players.find(p => p.id === sp.playerId)
        return player!
      }).filter(Boolean)
      
      const starterIds = existingSquad.players
        .filter((sp: SquadPlayerFromApi) => sp.isStarter)
        .map((sp: SquadPlayerFromApi) => sp.playerId)
      
      const captain = existingSquad.players.find((sp: SquadPlayerFromApi) => sp.isCaptain)
      const vice = existingSquad.players.find((sp: SquadPlayerFromApi) => sp.isVice)
      
      setSquadState({
        players: squadPlayers,
        starterIds,
        captainId: captain?.playerId || existingSquad.captainId || null,
        viceCaptainId: vice?.playerId || existingSquad.viceCaptainId || null,
        gameweekId: selectedGameweekId,
        budget: 100,
      })
    }
  }, [currentSquad, selectedGameweekId, players])


  // Handler for gameweek selector changes
  const handleGameweekChange = (gameweekId: number | '') => {
    if (gameweekId === '') {
      // Navigate to /squad without gameweekId (will use current or fallback)
      navigate('/squad', { replace: true })
    } else {
      // Navigate to the selected gameweek
      navigate(`/squad/${gameweekId}`, { replace: true })
    }
  }

  const applyFilters = async () => {
    try {
      const filters: Record<string, unknown> = {}
      if (position) filters.position = parseInt(position)
      if (teamId) filters.teamId = parseInt(teamId)
      if (minCost) filters.minCost = parseFloat(minCost)
      if (maxCost) filters.maxCost = parseFloat(maxCost)
      if (statsGameweekId) filters.gameweekId = parseInt(statsGameweekId)
      if (sortBy) {
        filters.sortBy = sortBy
        filters.sortOrder = sortOrder
      }
      if (includeStats) {
        filters.includeStats = true
      }

      // Determine if we should use API or client-side filtering
      const hasApiFilters = Object.keys(filters).length > 0
      
      // Sanitize search term
      const sanitizedSearchTerm = sanitizeSearchQuery(searchTerm)
      
      if (hasApiFilters) {
        // Use API search with all filters (including sorting)
        const result = await dispatch(searchPlayers(filters))
        if (result.payload && sanitizedSearchTerm) {
          // Apply client-side name search if provided
          const filtered = (result.payload as PlayerDto[]).filter(player => 
            player.name?.toLowerCase().includes(sanitizedSearchTerm.toLowerCase())
          )
          dispatch(setFilteredPlayers(filtered))
        }
      } else {
        // Use all players (no filters, no sorting)
        let filtered = players
        // Apply client-side name search if provided
        if (sanitizedSearchTerm) {
          filtered = players.filter(player => 
            player.name?.toLowerCase().includes(sanitizedSearchTerm.toLowerCase())
          )
        }
        dispatch(setFilteredPlayers(filtered))
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to filter players. Please try again.'
      showError(message)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setPosition('')
    setTeamId('')
    setMinCost('')
    setMaxCost('')
    setSortBy('')
    setSortOrder('desc')
    setIncludeStats(false)
    setStatsGameweekId('')
    dispatch(setFilteredPlayers(players))
  }

  const handleViewPlayerStats = (player: PlayerDto) => {
    setSelectedPlayerForStats(player)
  }

  const closeStatsModal = () => {
    setSelectedPlayerForStats(null)
  }

  const addPlayerToSquad = (player: PlayerDto) => {
    if (squadState.players.length >= 15) {
      alert('Squad is full! Remove a player first.')
      return
    }

    if (squadState.players.some(p => p.id === player.id)) {
      return // Already in squad
    }

    setSquadState(prev => ({
      ...prev,
      players: [...prev.players, player]
    }))
  }

  const removePlayerFromSquad = (playerId: number) => {
    setSquadState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId),
      starterIds: prev.starterIds.filter(id => id !== playerId),
      captainId: prev.captainId === playerId ? null : prev.captainId,
      viceCaptainId: prev.viceCaptainId === playerId ? null : prev.viceCaptainId,
    }))
  }

  const addToStarters = (playerId: number) => {
    if (squadState.starterIds.length >= 11) {
      alert('Maximum 11 starters allowed!')
      return
    }
    
    if (squadState.starterIds.includes(playerId)) {
      return // Already a starter
    }

    setSquadState(prev => ({
      ...prev,
      starterIds: [...prev.starterIds, playerId]
    }))
  }

  const removeFromStarters = (playerId: number) => {
    setSquadState(prev => ({
      ...prev,
      starterIds: prev.starterIds.filter(id => id !== playerId),
      captainId: prev.captainId === playerId ? null : prev.captainId,
      viceCaptainId: prev.viceCaptainId === playerId ? null : prev.viceCaptainId,
    }))
  }

  const setCaptain = (playerId: number) => {
    if (!squadState.starterIds.includes(playerId)) {
      alert('Captain must be a starter!')
      return
    }
    
    setSquadState(prev => ({
      ...prev,
      captainId: playerId,
      viceCaptainId: prev.viceCaptainId === playerId ? null : prev.viceCaptainId,
    }))
  }

  const setViceCaptain = (playerId: number) => {
    if (!squadState.starterIds.includes(playerId)) {
      alert('Vice-captain must be a starter!')
      return
    }
    
    setSquadState(prev => ({
      ...prev,
      viceCaptainId: playerId,
      captainId: prev.captainId === playerId ? null : prev.captainId,
    }))
  }

  const handleGenerateRandomSquad = async () => {
    if (!auth.user?.id || !selectedGameweekId) {
      showError('User ID or gameweek not found')
      return
    }

    const userId = auth.user.id
    const gameweekId = selectedGameweekId

    setGeneratingRandom(true)
    setValidationErrors([])

    try {
      // Ensure players are loaded first
      if (players.length === 0) {
        await dispatch(fetchAllPlayers())
        // Wait for players to be available
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const result = await dispatch(generateRandomSquad({ 
        userId, 
        gameweekId 
      }))
      
      if (generateRandomSquad.fulfilled.match(result)) {
        const randomSquad = result.payload
        
        // Ensure we have fresh players data
        if (players.length === 0) {
          await dispatch(fetchAllPlayers())
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        
        // Map player IDs to player objects
        // The players variable from the hook should be up-to-date
        const squadPlayers = randomSquad.playerIds
          .map((playerId: number) => players.find(p => p.id === playerId))
          .filter(Boolean) as PlayerDto[]
        
        if (squadPlayers.length === randomSquad.playerIds.length) {
          // Update squad state with random squad
          setSquadState({
            players: squadPlayers,
            starterIds: randomSquad.starterIds,
            captainId: randomSquad.captainId,
            viceCaptainId: randomSquad.viceCaptainId,
            gameweekId: randomSquad.gameweekId,
            budget: 100,
          })
          showSuccess('Random squad generated! Review and save when ready.')
        } else {
          showError(`Could not find all players (found ${squadPlayers.length}/${randomSquad.playerIds.length}). Players may still be loading. Please try again in a moment.`)
        }
      } else {
        const errorMessage = result.payload as string || 'Failed to generate random squad'
        showError(errorMessage)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate random squad. Please try again.'
      showError(message)
    } finally {
      setGeneratingRandom(false)
    }
  }

  const handleSaveSquad = async () => {
    if (!auth.user?.id) {
      navigate('/login', { replace: true })
      return
    }

    // Validate squad
    const validation = validateSquad(squadState.players, squadState.starterIds, squadState.budget)
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    setValidationErrors([])

    // Ensure captain and vice are starters
    if (squadState.captainId && !squadState.starterIds.includes(squadState.captainId)) {
      alert('Captain must be a starter!')
      return
    }
    if (squadState.viceCaptainId && !squadState.starterIds.includes(squadState.viceCaptainId)) {
      alert('Vice-captain must be a starter!')
      return
    }

    if (!squadState.captainId || !squadState.viceCaptainId) {
      alert('Please select both a captain and vice-captain!')
      return
    }

    setSaving(true)

    try {
      const squadData = {
        gameweekId: squadState.gameweekId,
        playerIds: squadState.players.map(p => p.id),
        starterIds: squadState.starterIds,
        captainId: squadState.captainId,
        viceCaptainId: squadState.viceCaptainId,
      }

      // Check if squad exists (update) or create new
      if (currentSquad && currentSquad.id && currentSquad.gameweekId ===squadState.gameweekId)  {
        const result = await dispatch(updateSquad({ id: currentSquad.id, squadData }))
        if (updateSquad.fulfilled.match(result)) {
          showSuccess('Squad saved successfully!')
          navigate('/dashboard', { replace: true })
        }
      } else {
        const result = await dispatch(createSquad({ userId: auth.user!.id, squadData }))
        if (createSquad.fulfilled.match(result)) {
          showSuccess('Squad saved successfully!')
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save squad. Please try again.'
      showError(message)
    } finally {
      setSaving(false)
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
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Loading squad builder...
          </Typography>
        </Box>
      </Container>
    )
  }

  const totalCost = squadState.players.reduce((sum, p) => sum + p.cost, 0)
  const remainingBudget = squadState.budget - totalCost

  // Group players by position
  const squadByPosition = {
    1: squadState.players.filter(p => p.position === 1),
    2: squadState.players.filter(p => p.position === 2),
    3: squadState.players.filter(p => p.position === 3),
    4: squadState.players.filter(p => p.position === 4),
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Squad Builder - Gameweek {squadState.gameweekId}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
            <Button component={Link} to="/dashboard" variant="outlined" color="secondary">
              Back to Dashboard
            </Button>
          </Box>
        </Box>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Validation Errors</AlertTitle>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Squad Summary and Formation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Squad Summary */}
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
              Squad Summary
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.25rem'
              }}>
                Budget
              </div>
              <div style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)',
                color: remainingBudget < 0 ? 'var(--color-error)' : 'var(--color-text-primary)'
              }}>
                £{remainingBudget.toFixed(1)}m / £{squadState.budget}m
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.25rem'
              }}>
                Players
              </div>
              <div style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)'
              }}>
                {squadState.players.length} / 15
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: '0.25rem'
              }}>
                Starters
              </div>
              <div style={{
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-bold)'
              }}>
                {squadState.starterIds.length} / 11
              </div>
            </div>

            {/* Starters List */}
            {squadState.starterIds.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.5rem'
                }}>
                  Starters ({squadState.starterIds.length}/11):
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {squadState.starterIds.map(playerId => {
                    const player = squadState.players.find(p => p.id === playerId)
                    if (!player) return null
                    const isCaptain = squadState.captainId === playerId
                    const isVice = squadState.viceCaptainId === playerId
                    
                    return (
                      <div
                        key={playerId}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem',
                          background: 'var(--color-surface)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{player.name || 'Unknown'}</span>
                          {isCaptain && (
                            <span style={{
                              padding: '0.125rem 0.375rem',
                              background: 'var(--color-primary)',
                              color: 'white',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 'var(--font-weight-bold)'
                            }}>
                              C
                            </span>
                          )}
                          {isVice && (
                            <span style={{
                              padding: '0.125rem 0.375rem',
                              background: 'var(--color-secondary)',
                              color: 'white',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 'var(--font-weight-bold)'
                            }}>
                              V
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={() => setCaptain(playerId)}
                            disabled={isCaptain}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: isCaptain ? 'var(--color-text-muted)' : 'var(--color-secondary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--font-size-xs)',
                              cursor: isCaptain ? 'not-allowed' : 'pointer'
                            }}
                            title="Set as captain"
                          >
                            C
                          </button>
                          <button
                            onClick={() => setViceCaptain(playerId)}
                            disabled={isVice}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: isVice ? 'var(--color-text-muted)' : 'var(--color-secondary)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--font-size-xs)',
                              cursor: isVice ? 'not-allowed' : 'pointer'
                            }}
                            title="Set as vice-captain"
                          >
                            V
                          </button>
                          <button
                            onClick={() => removeFromStarters(playerId)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'var(--color-error)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 'var(--font-size-xs)',
                              cursor: 'pointer'
                            }}
                            title="Remove from starters"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateRandomSquad}
              disabled={generatingRandom || !selectedGameweekId}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: generatingRandom || !selectedGameweekId ? 'var(--color-text-muted)' : 'var(--color-secondary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: generatingRandom || !selectedGameweekId ? 'not-allowed' : 'pointer',
                marginTop: '1rem',
                marginBottom: '0.5rem'
              }}
            >
              {generatingRandom ? 'Generating...' : '🎲 Generate Random Squad'}
            </button>
            <button
              onClick={handleSaveSquad}
              disabled={saving}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: saving ? 'var(--color-text-muted)' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: saving ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem'
              }}
            >
              {saving ? 'Saving...' : 'Save Squad'}
            </button>
          </div>

          {/* Squad Formation */}
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
            
            {squadState.players.length === 0 ? (
              <p style={{
                color: 'var(--color-text-secondary)',
                textAlign: 'center',
                padding: '2rem'
              }}>
                No players in squad yet. Add players from the list below.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2, 3, 4].map(position => (
                  <div key={position}>
                    <h3 style={{
                      fontSize: 'var(--font-size-lg)',
                      marginBottom: '0.5rem',
                      color: 'var(--color-text-primary)'
                    }}>
                      {getPositionName(position)} ({squadByPosition[position as keyof typeof squadByPosition].length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {squadByPosition[position as keyof typeof squadByPosition].map(player => {
                        const isStarter = squadState.starterIds.includes(player.id)
                        const isCaptain = squadState.captainId === player.id
                        const isVice = squadState.viceCaptainId === player.id
                        
                        return (
                          <div
                            key={player.id}
                            onClick={() => !isStarter && squadState.starterIds.length < 11 && addToStarters(player.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.75rem',
                              background: 'var(--color-surface)',
                              border: `1px solid ${isStarter ? 'var(--color-primary)' : 'var(--color-border)'}`,
                              borderRadius: 'var(--radius-sm)',
                              cursor: !isStarter && squadState.starterIds.length < 11 ? 'pointer' : 'default',
                              transition: 'all var(--transition-fast)'
                            }}
                            onMouseEnter={(e) => {
                              if (!isStarter && squadState.starterIds.length < 11) {
                                e.currentTarget.style.borderColor = 'var(--color-primary)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isStarter) {
                                e.currentTarget.style.borderColor = 'var(--color-border)'
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                              {player.pictureUrl ? (
                                <img
                                  src={player.pictureUrl}
                                  alt={player.name || 'Player'}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: 'var(--radius-sm)',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'var(--color-surface-elevated)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'var(--font-weight-bold)'
                                }}>
                                  {getPositionAbbr(player.position)}
                                </div>
                              )}
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontWeight: 'var(--font-weight-medium)',
                                  color: 'var(--color-text-primary)'
                                }}>
                                  {player.name || 'Unknown Player'}
                                </div>
                                <div style={{
                                  fontSize: 'var(--font-size-sm)',
                                  color: 'var(--color-text-secondary)'
                                }}>
                                  {player.teamName || 'Unknown Team'} • £{player.cost.toFixed(1)}m
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                {isCaptain && (
                                  <span style={{
                                    padding: '0.125rem 0.375rem',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 'var(--font-weight-bold)'
                                  }}>
                                    C
                                  </span>
                                )}
                                {isVice && (
                                  <span style={{
                                    padding: '0.125rem 0.375rem',
                                    background: 'var(--color-secondary)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 'var(--font-weight-bold)'
                                  }}>
                                    V
                                  </span>
                                )}
                                {isStarter && (
                                  <span style={{
                                    padding: '0.125rem 0.375rem',
                                    background: 'var(--color-success)',
                                    color: 'white',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 'var(--font-weight-bold)'
                                  }}>
                                    ST
                                  </span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removePlayerFromSquad(player.id)
                                  }}
                                  style={{
                                    padding: '0.25rem 0.5rem',
                                    background: 'var(--color-error)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: 'var(--font-size-lg)',
                                    cursor: 'pointer',
                                    lineHeight: 1
                                  }}
                                  title="Remove from squad"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Players */}
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
            Available Players
          </h2>

          {/* Filters */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  placeholder="Search players by name..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: 'var(--font-size-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Position
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: 'var(--font-size-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">All Positions</option>
                  <option value="1">Goalkeeper</option>
                  <option value="2">Defender</option>
                  <option value="3">Midfielder</option>
                  <option value="4">Forward</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Team
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: 'var(--font-size-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">All Teams</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Min Cost (£m)
                </label>
                <input
                  type="number"
                  value={minCost}
                  onChange={(e) => setMinCost(e.target.value)}
                  placeholder="Min"
                  step="0.1"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: 'var(--font-size-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Max Cost (£m)
                </label>
                <input
                  type="number"
                  value={maxCost}
                  onChange={(e) => setMaxCost(e.target.value)}
                  placeholder="Max"
                  step="0.1"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: 'var(--font-size-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={applyFilters}
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
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
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
                Clear Filters
              </button>
            </div>
          </div>

          {/* Sorting Section */}
          <div style={{
            background: 'var(--color-surface)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)'
            }}>
              Sort by Performance
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              alignItems: 'flex-end'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: 'var(--font-size-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">No Sorting</option>
                  <option value="points">Points</option>
                  <option value="goals">Goals</option>
                  <option value="assists">Assists</option>
                  <option value="cleanSheets">Clean Sheets</option>
                  <option value="saves">Saves</option>
                  <option value="cost">Cost</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: 'var(--font-size-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="desc">Highest First</option>
                  <option value="asc">Lowest First</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-primary)'
                }}>
                  Gameweek (for stats)
                </label>
                <select
                  value={statsGameweekId}
                  onChange={(e) => setStatsGameweekId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    fontSize: 'var(--font-size-base)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Overall Season</option>
                  {gameweeks.map((gw) => (
                    <option key={gw.id} value={gw.id}>
                      Gameweek {gw.id}{(gw as { isComplete?: boolean }).isComplete ? ' (Complete)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-primary)',
                  marginTop: '1.75rem'
                }}>
                  <input
                    type="checkbox"
                    checked={includeStats}
                    onChange={(e) => setIncludeStats(e.target.checked)}
                    style={{ width: 'auto' }}
                  />
                  <span>Show Performance Stats</span>
                </label>
              </div>
            </div>
          </div>

          {/* Player List */}
          {filteredPlayers.length === 0 ? (
            <p style={{
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              padding: '2rem'
            }}>
              No players found matching your filters.
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {filteredPlayers.map((player: PlayerDto) => {
                const isInSquad = squadState.players.some(p => p.id === player.id)
                const playerWithStats = player as PlayerDto & { stats?: { totalPoints: number; totalGoals: number; totalAssists: number; totalCleanSheets: number; totalSaves: number; gamesPlayed: number } | null }
                const hasStats = includeStats && playerWithStats.stats !== null && playerWithStats.stats !== undefined
                
                return (
                  <div
                    key={player.id}
                    style={{
                      background: 'var(--color-surface)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${isInSquad ? 'var(--color-success)' : 'var(--color-border)'}`,
                      cursor: isInSquad ? 'not-allowed' : 'pointer',
                      opacity: isInSquad ? 0.6 : 1,
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isInSquad) {
                        e.currentTarget.style.borderColor = 'var(--color-primary)'
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isInSquad) {
                        e.currentTarget.style.borderColor = 'var(--color-border)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <div 
                      onClick={() => !isInSquad && addPlayerToSquad(player)}
                      style={{ cursor: isInSquad ? 'not-allowed' : 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: hasStats ? '0.75rem' : '0' }}>
                        {player.pictureUrl ? (
                          <img
                            src={player.pictureUrl}
                            alt={player.name || 'Player'}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: 'var(--radius-sm)',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-surface-elevated)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'var(--font-weight-bold)'
                          }}>
                            {getPositionAbbr(player.position)}
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-text-primary)'
                          }}>
                            {player.name || 'Unknown Player'}
                          </div>
                          <div style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)'
                          }}>
                            {player.teamName || 'Unknown Team'} • {getPositionAbbr(player.position)}
                          </div>
                        </div>
                        <div style={{
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-primary)'
                        }}>
                          £{player.cost.toFixed(1)}m
                        </div>
                        {isInSquad && (
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: 'var(--color-success)',
                            color: 'white',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-bold)'
                          }}>
                            In Squad
                          </span>
                        )}
                      </div>

                      {hasStats && playerWithStats.stats && (
                        <div style={{
                          marginTop: '0.75rem',
                          padding: '0.75rem',
                          background: 'var(--color-surface-elevated)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-sm)',
                          borderLeft: '3px solid var(--color-primary)'
                        }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                            gap: '0.5rem'
                          }}>
                            <div>
                              <strong>Points:</strong>{' '}
                              <span style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-weight-bold)' }}>
                                {playerWithStats.stats.totalPoints}
                              </span>
                            </div>
                            <div><strong>Goals:</strong> {playerWithStats.stats.totalGoals}</div>
                            <div><strong>Assists:</strong> {playerWithStats.stats.totalAssists}</div>
                            {playerWithStats.stats.totalCleanSheets > 0 && (
                              <div><strong>CS:</strong> {playerWithStats.stats.totalCleanSheets}</div>
                            )}
                            {playerWithStats.stats.totalSaves > 0 && (
                              <div><strong>Saves:</strong> {playerWithStats.stats.totalSaves}</div>
                            )}
                            <div style={{ color: 'var(--color-text-secondary)' }}>
                              <strong>Games:</strong> {playerWithStats.stats.gamesPlayed}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewPlayerStats(player)
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          background: 'var(--color-secondary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'var(--font-weight-medium)',
                          cursor: 'pointer'
                        }}
                      >
                        View Stats
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Player Stats Modal */}
        <PlayerStatsModal
          open={!!selectedPlayerForStats}
          player={selectedPlayerForStats}
          gameweekId={squadState.gameweekId}
          onClose={closeStatsModal}
        />
      </Box>
    </Container>
  )
}
