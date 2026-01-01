import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { leagueService, type LeagueDto, type LeagueDetailsDto, type StandingsEntry } from '../../services/league.service'

interface LeagueState {
  userLeagues: LeagueDto[]
  publicLeagues: LeagueDto[]
  currentLeague: LeagueDetailsDto | null
  standings: StandingsEntry[] | null
  isLoadingStandings: boolean
  isLoading: boolean
  error: string | null
}

const initialState: LeagueState = {
  userLeagues: [],
  publicLeagues: [],
  currentLeague: null,
  standings: null,
  isLoadingStandings: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchUserLeagues = createAsyncThunk<LeagueDto[], number>(
  'leagues/fetchUserLeagues',
  async (userId: number, { rejectWithValue }) => {
    try {
      const leagues = await leagueService.getUserLeagues(userId)
      return leagues as LeagueDto[]
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user leagues'
      return rejectWithValue(message)
    }
  }
)

export const fetchPublicLeagues = createAsyncThunk<LeagueDto[], void>(
  'leagues/fetchPublicLeagues',
  async (_, { rejectWithValue }) => {
    try {
      const leagues = await leagueService.getPublicLeagues()
      return leagues as LeagueDto[]
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch public leagues'
      return rejectWithValue(message)
    }
  }
)

export const fetchLeagueById = createAsyncThunk<LeagueDetailsDto, number>(
  'leagues/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const league = await leagueService.getLeague(id)
      return league as LeagueDetailsDto
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch league'
      return rejectWithValue(message)
    }
  }
)

export const fetchLeagueDetails = createAsyncThunk<LeagueDetailsDto, number>(
  'leagues/fetchDetails',
  async (id: number, { rejectWithValue }) => {
    try {
      const league = await leagueService.getLeagueDetails(id)
      return league as LeagueDetailsDto
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch league details'
      return rejectWithValue(message)
    }
  }
)

export const createLeague = createAsyncThunk<LeagueDto, { userId: number; leagueData: Record<string, unknown> }>(
  'leagues/create',
  async ({ userId, leagueData }, { rejectWithValue }) => {
    try {
      const league = await leagueService.createLeague(userId, leagueData)
      return league as LeagueDto
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create league'
      return rejectWithValue(message)
    }
  }
)

export const joinLeague = createAsyncThunk<{ leagueId: number; userId: number }, { leagueId: number; userId: number }>(
  'leagues/join',
  async ({ leagueId, userId }, { rejectWithValue }) => {
    try {
      await leagueService.joinLeague(leagueId, userId)
      return { leagueId, userId }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to join league'
      return rejectWithValue(message)
    }
  }
)

export const leaveLeague = createAsyncThunk<{ leagueId: number; userId: number }, { leagueId: number; userId: number }>(
  'leagues/leave',
  async ({ leagueId, userId }, { rejectWithValue }) => {
    try {
      await leagueService.leaveLeague(leagueId, userId)
      return { leagueId, userId }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to leave league'
      return rejectWithValue(message)
    }
  }
)

export const deleteLeague = createAsyncThunk<number, number>(
  'leagues/delete',
  async (leagueId: number, { rejectWithValue }) => {
    try {
      await leagueService.deleteLeague(leagueId)
      return leagueId
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete league'
      return rejectWithValue(message)
    }
  }
)

export const kickMember = createAsyncThunk<{ leagueId: number; userId: number }, { leagueId: number; userId: number }>(
  'leagues/kickMember',
  async ({ leagueId, userId }, { rejectWithValue }) => {
    try {
      await leagueService.kickMember(leagueId, userId)
      return { leagueId, userId }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to kick member'
      return rejectWithValue(message)
    }
  }
)

export const fetchStandings = createAsyncThunk<StandingsEntry[], { leagueId: number; gameweekId: number }>(
  'leagues/fetchStandings',
  async ({ leagueId, gameweekId }, { rejectWithValue }) => {
    try {
      const data = await leagueService.getStandings(leagueId, gameweekId) as { standings?: StandingsEntry[] | null }
      return data.standings || []
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch standings'
      return rejectWithValue(message)
    }
  }
)

const leagueSlice = createSlice({
  name: 'leagues',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentLeague: (state) => {
      state.currentLeague = null
    },
  },
  extraReducers: (builder) => {
    // Fetch user leagues
    builder
      .addCase(fetchUserLeagues.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserLeagues.fulfilled, (state, action) => {
        state.isLoading = false
        state.userLeagues = action.payload
        state.error = null
      })
      .addCase(fetchUserLeagues.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch public leagues
    builder
      .addCase(fetchPublicLeagues.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPublicLeagues.fulfilled, (state, action) => {
        state.isLoading = false
        state.publicLeagues = action.payload
        state.error = null
      })
      .addCase(fetchPublicLeagues.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch league by ID
    builder
      .addCase(fetchLeagueById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLeagueById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentLeague = action.payload as LeagueDetailsDto
        state.error = null
      })
      .addCase(fetchLeagueById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch league details
    builder
      .addCase(fetchLeagueDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLeagueDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentLeague = action.payload
        state.error = null
      })
      .addCase(fetchLeagueDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create league
    builder
      .addCase(createLeague.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createLeague.fulfilled, (state, action) => {
        state.isLoading = false
        state.userLeagues.push(action.payload)
        state.error = null
      })
      .addCase(createLeague.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Join league
    builder
      .addCase(joinLeague.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(joinLeague.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
        // Optionally refetch user leagues
      })
      .addCase(joinLeague.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Leave league
    builder
      .addCase(leaveLeague.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(leaveLeague.fulfilled, (state, action) => {
        state.isLoading = false
        state.userLeagues = state.userLeagues.filter(
          (league) => league.id !== action.payload.leagueId
        )
        state.error = null
      })
      .addCase(leaveLeague.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete league
    builder
      .addCase(deleteLeague.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteLeague.fulfilled, (state, action) => {
        state.isLoading = false
        state.userLeagues = state.userLeagues.filter((league) => league.id !== action.payload)
        state.publicLeagues = state.publicLeagues.filter((league) => league.id !== action.payload)
        if (state.currentLeague?.id === action.payload) {
          state.currentLeague = null
        }
        state.error = null
      })
      .addCase(deleteLeague.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Kick member
    builder
      .addCase(kickMember.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(kickMember.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
        // League details will be refetched to update members
      })
      .addCase(kickMember.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch standings
    builder
      .addCase(fetchStandings.pending, (state) => {
        state.isLoadingStandings = true
        state.error = null
      })
      .addCase(fetchStandings.fulfilled, (state, action) => {
        state.isLoadingStandings = false
        state.standings = action.payload
        state.error = null
      })
      .addCase(fetchStandings.rejected, (state, action) => {
        state.isLoadingStandings = false
        state.standings = null
        state.error = action.payload as string
      })
  },
})

export const { clearError, clearCurrentLeague } = leagueSlice.actions

// Re-export StandingsEntry for convenience (it's already exported from league.service)
export type { StandingsEntry }

export default leagueSlice.reducer

