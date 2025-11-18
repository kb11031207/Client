import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { playerService, type PlayerDto, type PlayerWithStatsDto, type PlayerFilterDto, type PlayerStatsDto, type PlayerFixtureStatsDto } from '../../services/player.service'

// Re-export types for convenience
export type { PlayerStatsDto, PlayerFixtureStatsDto }

// Player state interface
interface PlayerState {
  players: PlayerDto[]
  filteredPlayers: (PlayerDto | PlayerWithStatsDto)[]
  currentPlayer: PlayerDto | null
  currentPlayerStats: Record<number, PlayerStatsDto | null> // Cache stats by gameweekId, null means "checked, no stats available"
  isLoadingStats: boolean
  teams: { id: number; name: string }[]
  isLoading: boolean
  error: string | null
}

const initialState: PlayerState = {
  players: [],
  filteredPlayers: [],
  currentPlayer: null,
  currentPlayerStats: {},
  isLoadingStats: false,
  teams: [],
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchAllPlayers = createAsyncThunk<PlayerDto[], void>(
  'players/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const players = await playerService.getAllPlayers()
      return players as PlayerDto[]
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch players'
      return rejectWithValue(message)
    }
  }
)

export const fetchPlayerById = createAsyncThunk<PlayerDto, number>(
  'players/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const player = await playerService.getPlayer(id)
      return player as PlayerDto
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch player'
      return rejectWithValue(message)
    }
  }
)

export const searchPlayers = createAsyncThunk<(PlayerDto | PlayerWithStatsDto)[], PlayerFilterDto>(
  'players/search',
  async (filters: PlayerFilterDto, { rejectWithValue }) => {
    try {
      const players = await playerService.searchPlayers(filters)
      return players as (PlayerDto | PlayerWithStatsDto)[]
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to search players'
      return rejectWithValue(message)
    }
  }
)

export const fetchPlayersByPosition = createAsyncThunk<PlayerDto[], number>(
  'players/fetchByPosition',
  async (position: number, { rejectWithValue }) => {
    try {
      const players = await playerService.getPlayersByPosition(position)
      return players as PlayerDto[]
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch players by position'
      return rejectWithValue(message)
    }
  }
)

export const fetchPlayersByTeam = createAsyncThunk<PlayerDto[], number>(
  'players/fetchByTeam',
  async (teamId: number, { rejectWithValue }) => {
    try {
      const players = await playerService.getPlayersByTeam(teamId)
      return players as PlayerDto[]
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch players by team'
      return rejectWithValue(message)
    }
  }
)

export const fetchPlayerStats = createAsyncThunk<PlayerStatsDto | null, { playerId: number; gameweekId: number }>(
  'players/fetchStats',
  async ({ playerId, gameweekId }, { rejectWithValue }) => {
    try {
      const stats = await playerService.getPlayerStats(playerId, gameweekId)
      return stats as PlayerStatsDto
    } catch (error: unknown) {
      // Check if it's a 404 - this is not an error, just no stats available
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          // Return null instead of rejecting - this means "no stats available"
          return null
        }
      }
      // For other errors, reject with value
      const message = error instanceof Error ? error.message : 'Failed to fetch player stats'
      return rejectWithValue(message)
    }
  }
)

const playerSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentPlayer: (state) => {
      state.currentPlayer = null
      state.currentPlayerStats = {}
    },
    setFilteredPlayers: (state, action) => {
      state.filteredPlayers = action.payload
    },
    extractTeams: (state) => {
      const teamMap = new Map<number, string>()
      state.players.forEach((player) => {
        if (player.teamId && player.teamName && !teamMap.has(player.teamId)) {
          teamMap.set(player.teamId, player.teamName)
        }
      })
      state.teams = Array.from(teamMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },
  },
  extraReducers: (builder) => {
    // Fetch all players
    builder
      .addCase(fetchAllPlayers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllPlayers.fulfilled, (state, action) => {
        state.isLoading = false
        state.players = action.payload
        state.filteredPlayers = action.payload
        state.error = null
      })
      .addCase(fetchAllPlayers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch player by ID
    builder
      .addCase(fetchPlayerById.pending, (state) => {
        state.isLoading = true
        state.error = null
        // Clear stats when loading a new player
        state.currentPlayerStats = {}
      })
      .addCase(fetchPlayerById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPlayer = action.payload
        state.error = null
        // Clear stats when switching to a new player
        state.currentPlayerStats = {}
      })
      .addCase(fetchPlayerById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Clear stats on error too
        state.currentPlayerStats = {}
      })

    // Search players
    builder
      .addCase(searchPlayers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchPlayers.fulfilled, (state, action) => {
        state.isLoading = false
        state.filteredPlayers = action.payload
        state.error = null
      })
      .addCase(searchPlayers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch by position
    builder
      .addCase(fetchPlayersByPosition.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPlayersByPosition.fulfilled, (state, action) => {
        state.isLoading = false
        state.filteredPlayers = action.payload
        state.error = null
      })
      .addCase(fetchPlayersByPosition.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch by team
    builder
      .addCase(fetchPlayersByTeam.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPlayersByTeam.fulfilled, (state, action) => {
        state.isLoading = false
        state.filteredPlayers = action.payload
        state.error = null
      })
      .addCase(fetchPlayersByTeam.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch player stats
    builder
      .addCase(fetchPlayerStats.pending, (state) => {
        state.isLoadingStats = true
        // Don't clear error on pending - only clear on actual error
      })
      .addCase(fetchPlayerStats.fulfilled, (state, action) => {
        state.isLoadingStats = false
        if (action.payload === null) {
          // Null means no stats available (404) - cache null so we know we've checked
          // Use action.meta.arg to get the original gameweekId
          const gameweekId = action.meta.arg.gameweekId
          state.currentPlayerStats[gameweekId] = null
          state.error = null
        } else {
          // Cache stats by gameweekId
          state.currentPlayerStats[action.payload.gameweekId] = action.payload
          state.error = null
        }
      })
      .addCase(fetchPlayerStats.rejected, (state, action) => {
        state.isLoadingStats = false
        // Only set error for non-404 errors (shouldn't happen now, but just in case)
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCurrentPlayer, setFilteredPlayers, extractTeams } = playerSlice.actions
export default playerSlice.reducer

