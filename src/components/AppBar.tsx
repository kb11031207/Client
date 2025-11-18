import { useNavigate, useLocation, Link } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutThunk } from '../store/slices/authSlice'

/**
 * Application AppBar Component
 * 
 * Provides navigation and user actions in the header.
 */
export function AppBarComponent() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    navigate('/login', { replace: true })
  }

  // Don't show AppBar on login/register pages when not authenticated, but show it on players page
  if (!isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return null
  }

  // Public routes (visible to everyone)
  const publicRoutes = [
    { path: '/players', label: 'Players' },
    { path: '/fixtures', label: 'Fixtures' },
  ]

  // Protected routes (only visible when authenticated)
  const protectedRoutes = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/squad', label: 'Squad' },
    { path: '/leagues', label: 'Leagues' },
  ]

  // Show only public routes if not authenticated, all routes if authenticated
  const navigationLinks = isAuthenticated 
    ? [...publicRoutes, ...protectedRoutes]
    : publicRoutes

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 0, mr: 4, fontWeight: 'bold' }}
        >
          Fantasy Football
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, gap: 1 }}>
          {navigationLinks.map((link) => (
            <Button
              key={link.path}
              component={Link}
              to={link.path}
              color="inherit"
              sx={{
                backgroundColor: location.pathname.startsWith(link.path)
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAuthenticated && user?.username && (
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user.username}
            </Typography>
          )}
          {isAuthenticated ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}


