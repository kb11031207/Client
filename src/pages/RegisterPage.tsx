import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Container } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { registerThunk, clearError } from '../store/slices/authSlice'
import { useNotification } from '../hooks/useNotification'

/**
 * Register Page
 * 
 * Allows users to create a new account.
 * Uses Redux for registration state management.
 */
export function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useAppSelector((state) => state.auth)
  const { showError, showSuccess } = useNotification()
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [school, setSchool] = useState('')

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(clearError())

    // Validate input
    const trimmedUsername = username.trim()
    const trimmedEmail = email.trim()
    const trimmedSchool = school.trim()

    if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      showError('Username must be between 3 and 50 characters.')
      return
    }

    if (password.length < 8) {
      showError('Password must be at least 8 characters long.')
      return
    }

    // Dispatch register thunk
    const result = await dispatch(registerThunk({
      username: trimmedUsername,
      email: trimmedEmail,
      password,
      school: trimmedSchool || undefined,
    }))
    
    // Check if registration was successful
    if (registerThunk.fulfilled.match(result)) {
      showSuccess(`Registration successful! Welcome, ${result.payload.username}!`)
      
      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
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
                Register
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new account
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                inputProps={{ minLength: 3, maxLength: 50 }}
                disabled={isLoading}
                fullWidth
                helperText="3-50 characters"
              />

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
                inputProps={{ minLength: 8 }}
                disabled={isLoading}
                fullWidth
                helperText="Minimum 8 characters"
              />

              <TextField
                label="School (Optional)"
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Enter your school name"
                inputProps={{ maxLength: 100 }}
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
                {isLoading ? 'Registering...' : 'Register'}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}


