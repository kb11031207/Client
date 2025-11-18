import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { storage } from '../../utils/storage'
import { apiClient } from '../../services/api-client'

// Auth state interface
interface AuthState {
  user: {
    id: number | null
    username: string | null
    email: string | null
  } | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Login request interface
interface LoginRequest {
  email: string
  password: string
}

// Register request interface
interface RegisterRequest {
  username: string
  email: string
  password: string
  school?: string
}

// Auth response interface (from API)
interface AuthResponse {
  id: number
  username: string
  email: string
  accessToken: string
  refreshToken: string
}

// User response interface (from API - registration)
interface UserResponse {
  id: number
  username: string
  email: string
}

// Initial state - check localStorage for existing tokens
const getInitialState = (): AuthState => {
  const accessToken = storage.getAccessToken()
  const userId = storage.getUserId()
  const username = storage.getUsername()
  const email = storage.getEmail()
  
  return {
    user: accessToken && userId ? {
      id: userId,
      username: username,
      email: email,
    } : null,
    accessToken,
    refreshToken: storage.getRefreshToken(),
    isAuthenticated: !!accessToken,
    isLoading: false,
    error: null,
  }
}

const initialState: AuthState = getInitialState()

// Async thunks
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/Users/login', {
        email: credentials.email,
        password: credentials.password,
      }) as AuthResponse
      
      // Store tokens and user data in localStorage
      if (data.accessToken) {
        storage.setAccessToken(data.accessToken)
      }
      if (data.refreshToken) {
        storage.setRefreshToken(data.refreshToken)
      }
      if (data.id) {
        storage.setUserId(data.id)
      }
      if (data.username) {
        storage.setUsername(data.username)
      }
      if (data.email) {
        storage.setEmail(data.email)
      }
      
      return data
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      return rejectWithValue(message)
    }
  }
)

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const data = await apiClient.post('/api/Users/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        school: userData.school || undefined,
      }) as UserResponse
      
      // Registration doesn't return tokens, so we don't store them
      // User needs to login separately after registration
      return data
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      return rejectWithValue(message)
    }
  }
)

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Clear localStorage
      storage.clear()
      return null
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout failed'
      return rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error message
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = {
          id: action.payload.id,
          username: action.payload.username,
          email: action.payload.email,
        }
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
      })
    
    // Register cases
    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.isLoading = false
        // Registration doesn't log the user in
        // User data is stored but tokens are not
        state.error = null
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Logout cases
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer

