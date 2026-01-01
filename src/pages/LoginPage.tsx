import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Container } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginThunk, clearError } from '../store/slices/authSlice'
import { useNotification } from '../hooks/useNotification'
import { sanitizeEmail } from '../utils/sanitize'

/**
 * Login Page
 * 
 * Allows users to log in with email and password.
 * Uses Redux for authentication state management.
 */  
export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth)
  const { showError, showSuccess } = useNotification()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Show error notification when error state changes
  useEffect(() => {
    if (error) {
      showError(error)
      dispatch(clearError())
    }
  }, [error, showError, dispatch])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(clearError())

    // Sanitize email input
    const sanitizedEmail = sanitizeEmail(email)

    // Validate form
    if (!sanitizedEmail || !password) {
      showError('Please enter both email and password')
      return
    }

    // Dispatch login thunk with sanitized email
    const result = await dispatch(loginThunk({ email: sanitizedEmail, password }))
    
    // Check if login was successful
    if (loginThunk.fulfilled.match(result)) {
      showSuccess('Login successful!')
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
                fullWidth
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                fullWidth
                size="large"
                sx={{ mt: 1 }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Register
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Link
                  to="/players"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Browse Players
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}

