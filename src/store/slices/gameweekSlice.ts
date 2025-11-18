import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { gameweekService, type GameweekDto } from '../../services/gameweek.service'

interface GameweekState {
  gameweeks: GameweekDto[]
  currentGameweek: GameweekDto | null
  selectedGameweek: GameweekDto | null
  isLoading: boolean
  error: string | null
}

const initialState: GameweekState = {
  gameweeks: [],
  currentGameweek: null,
  selectedGameweek: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchAllGameweeks = createAsyncThunk<GameweekDto[], void>(
  'gameweeks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const gameweeks = await gameweekService.getAllGameweeks()
      return gameweeks as GameweekDto[]
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch gameweeks'
      return rejectWithValue(message)
    }
  }
)

export const fetchCurrentGameweek = createAsyncThunk<GameweekDto, void>(
  'gameweeks/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const gameweek = await gameweekService.getCurrentGameweek()
      return gameweek as GameweekDto
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch current gameweek'
      return rejectWithValue(message)
    }
  }
)

export const fetchGameweekById = createAsyncThunk<GameweekDto, number>(
  'gameweeks/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      const gameweek = await gameweekService.getGameweek(id)
      return gameweek as GameweekDto
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch gameweek'
      return rejectWithValue(message)
    }
  }
)

const gameweekSlice = createSlice({
  name: 'gameweeks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedGameweek: (state, action) => {
      state.selectedGameweek = action.payload
    },
    clearSelectedGameweek: (state) => {
      state.selectedGameweek = null
    },
  },
  extraReducers: (builder) => {
    // Fetch all gameweeks
    builder
      .addCase(fetchAllGameweeks.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllGameweeks.fulfilled, (state, action) => {
        state.isLoading = false
        state.gameweeks = action.payload
        state.error = null
      })
      .addCase(fetchAllGameweeks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch current gameweek
    builder
      .addCase(fetchCurrentGameweek.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCurrentGameweek.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentGameweek = action.payload
        state.error = null
      })
      .addCase(fetchCurrentGameweek.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Fetch gameweek by ID
    builder
      .addCase(fetchGameweekById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGameweekById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedGameweek = action.payload
        state.error = null
      })
      .addCase(fetchGameweekById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedGameweek, clearSelectedGameweek } = gameweekSlice.actions
export default gameweekSlice.reducer

