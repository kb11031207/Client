import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import notificationReducer from './slices/notificationSlice'
import playerReducer from './slices/playerSlice'
import gameweekReducer from './slices/gameweekSlice'
import leagueReducer from './slices/leagueSlice'
import squadReducer from './slices/squadSlice'
import fixtureReducer from './slices/fixtureSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    players: playerReducer,
    gameweeks: gameweekReducer,
    leagues: leagueReducer,
    squads: squadReducer,
    fixtures: fixtureReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

