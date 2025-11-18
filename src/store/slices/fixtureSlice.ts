import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fixtureService, type FixtureDto, type FixtureDetailsDto } from '../../services/fixture.service'

interface FixtureState {
  fixtures: FixtureDto[]
  fixtureDetails: Record<number, FixtureDetailsDto> // Cache fixture details by fixture ID
  selectedGameweekId: number | null
  isLoading: boolean
  isLoadingDetails: boolean
  error: string | null
}

const initialState: FixtureState = {
  fixtures: [],
  fixtureDetails: {},
  selectedGameweekId: null,
  isLoading: false,
  isLoadingDetails: false,
  error: null,
}

// Async thunks
export const fetchFixturesByGameweek = createAsyncThunk<FixtureDto[], number>(
  'fixtures/fetchByGameweek',
  async (gameweekId: number, { rejectWithValue }) => {
    try {
      const fixtures = await fixtureService.getFixturesByGameweek(gameweekId)
      return fixtures
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch fixtures'
      return rejectWithValue(message)
    }
  }
)

export const fetchFixtureDetails = createAsyncThunk<FixtureDetailsDto, number>(
  'fixtures/fetchDetails',
  async (fixtureId: number, { rejectWithValue }) => {
    try {
      const details = await fixtureService.getFixtureDetails(fixtureId)
      return details
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch fixture details'
      return rejectWithValue(message)
    }
  }
)

const fixtureSlice = createSlice({
  name: 'fixtures',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedGameweek: (state, action: { payload: number | null }) => {
      state.selectedGameweekId = action.payload
    },
    clearFixtures: (state) => {
      state.fixtures = []
      state.selectedGameweekId = null
    },
    clearFixtureDetails: (state, action) => {
      const fixtureId = action.payload
      delete state.fixtureDetails[fixtureId]
    },
  },
  extraReducers: (builder) => {
    // Fetch fixtures by gameweek
    builder
      .addCase(fetchFixturesByGameweek.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchFixturesByGameweek.fulfilled, (state, action) => {
        state.isLoading = false
        state.fixtures = action.payload
        state.error = null
      })
      .addCase(fetchFixturesByGameweek.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.fixtures = []
      })

    // Fetch fixture details
    builder
      .addCase(fetchFixtureDetails.pending, (state) => {
        state.isLoadingDetails = true
        state.error = null
      })
      .addCase(fetchFixtureDetails.fulfilled, (state, action) => {
        state.isLoadingDetails = false
        // Cache fixture details by fixture ID
        state.fixtureDetails[action.payload.id] = action.payload
        state.error = null
      })
      .addCase(fetchFixtureDetails.rejected, (state, action) => {
        state.isLoadingDetails = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, setSelectedGameweek, clearFixtures, clearFixtureDetails } = fixtureSlice.actions
export default fixtureSlice.reducer

