import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { squadService, type SquadDto } from '../../services/squad.service'
import { logoutThunk } from './authSlice'

interface SquadState {
  userSquads: SquadDto[]
  currentSquad: SquadDto | null
  isLoading: boolean
  error: string | null
}

const initialState: SquadState = {
  userSquads: [],
  currentSquad: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchUserSquads = createAsyncThunk<SquadDto[], number>(
  'squads/fetchUserSquads',
  async (userId: number, { rejectWithValue }) => {
    try {
      const squads = await squadService.getUserSquads(userId)
      return squads as SquadDto[]
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user squads'
      return rejectWithValue(message)
    }
  }
)

export const fetchSquadForGameweek = createAsyncThunk<SquadDto | null, { userId: number; gameweekId: number }>(
  'squads/fetchForGameweek',
  async ({ userId, gameweekId }, { rejectWithValue }) => {
    try {
      const squad = await squadService.getUserSquadForGameweek(userId, gameweekId)
      return squad as SquadDto | null
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch squad for gameweek'
      return rejectWithValue(message)
    }
  }
)

export const fetchSquadById = createAsyncThunk<SquadDto, number>(
  'squads/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const squad = await squadService.getSquad(id)
      return squad as SquadDto
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch squad'
      return rejectWithValue(message)
    }
  }
)

export const createSquad = createAsyncThunk<SquadDto, { userId: number; squadData: Record<string, unknown> }>(
  'squads/create',
  async ({ userId, squadData }, { rejectWithValue }) => {
    try {
      const squad = await squadService.createSquad(userId, squadData)
      return squad as SquadDto
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create squad'
      return rejectWithValue(message)
    }
  }
)

export const updateSquad = createAsyncThunk<SquadDto, { id: number; squadData: Record<string, unknown> }>(
  'squads/update',
  async ({ id, squadData }, { rejectWithValue }) => {
    try {
      const squad = await squadService.updateSquad(id, squadData)
      return squad as SquadDto
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update squad'
      return rejectWithValue(message)
    }
  }
)

export const deleteSquad = createAsyncThunk<number, number>(
  'squads/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await squadService.deleteSquad(id)
      return id
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete squad'
      return rejectWithValue(message)
    }
  }
)

const squadSlice = createSlice({
  name: 'squads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentSquad: (state) => {
      state.currentSquad = null
    },
    setCurrentSquad: (state, action) => {
      state.currentSquad = action.payload
    },
  },
  extraReducers: (builder) => {
    // Fetch user squads
    builder
      .addCase(fetchUserSquads.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserSquads.fulfilled, (state, action) => {
        state.isLoading = false
        state.userSquads = action.payload
        state.error = null
      })
      .addCase(fetchUserSquads.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch squad for gameweek
    builder
      .addCase(fetchSquadForGameweek.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSquadForGameweek.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSquad = action.payload ?? null
        state.error = null
      })
      .addCase(fetchSquadForGameweek.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch squad by ID
    builder
      .addCase(fetchSquadById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchSquadById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSquad = action.payload
        state.error = null
      })
      .addCase(fetchSquadById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Create squad
    builder
      .addCase(createSquad.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createSquad.fulfilled, (state, action) => {
        state.isLoading = false
        state.userSquads.push(action.payload)
        state.currentSquad = action.payload
        state.error = null
      })
      .addCase(createSquad.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update squad
    builder
      .addCase(updateSquad.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateSquad.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.userSquads.findIndex((s) => s.id === action.payload.id)
        if (index !== -1) {
          state.userSquads[index] = action.payload
        }
        if (state.currentSquad?.id === action.payload.id) {
          state.currentSquad = action.payload
        }
        state.error = null
      })
      .addCase(updateSquad.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Delete squad
    builder
      .addCase(deleteSquad.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteSquad.fulfilled, (state, action) => {
        state.isLoading = false
        state.userSquads = state.userSquads.filter((s) => s.id !== action.payload)
        if (state.currentSquad?.id === action.payload) {
          state.currentSquad = null
        }
        state.error = null
      })
      .addCase(deleteSquad.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Clear squad state on logout
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.userSquads = []
        state.currentSquad = null
        state.error = null
      })
  },
})

export const { clearError, clearCurrentSquad, setCurrentSquad } = squadSlice.actions
export default squadSlice.reducer

