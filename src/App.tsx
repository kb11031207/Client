import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { store } from './store'
import { theme } from './theme/theme'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppBarComponent } from './components/AppBar'
import { NotificationSnackbar } from './components/NotificationSnackbar'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { PlayersPage } from './pages/PlayersPage'
import { PlayerDetailsPage } from './pages/PlayerDetailsPage'
import { FixturesPage } from './pages/FixturesPage'
import { AboutPage } from './pages/AboutPage'
import { SquadPage } from './pages/SquadPage'
import { LeaguesPage } from './pages/LeaguesPage'
import { LeagueDetailsPage } from './pages/LeagueDetailsPage'
import { useAppSelector } from './store/hooks'

// Home route component - redirects based on auth status
function HomeRoute() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Default route - redirect based on auth status */}
      <Route path="/" element={<HomeRoute />} />
      
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/players" element={<PlayersPage />} />
      <Route path="/players/:playerId" element={<PlayerDetailsPage />} />
      <Route path="/fixtures" element={<FixturesPage />} />
      <Route path="/about" element={<AboutPage />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/squad"
        element={
          <ProtectedRoute>
            <SquadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/squad/:gameweekId"
        element={
          <ProtectedRoute>
            <SquadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leagues"
        element={
          <ProtectedRoute>
            <LeaguesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leagues/:leagueId"
        element={
          <ProtectedRoute>
            <LeagueDetailsPage />
          </ProtectedRoute>
        }
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppBarComponent />
          <AppRoutes />
          <NotificationSnackbar />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

export default App

