import './style.css'
import { router } from './utils/router'
import { authService } from './services/auth.service'
import { renderLoginPage } from './pages/LoginPage'
import { renderRegisterPage } from './pages/RegisterPage'
import { renderDashboardPage } from './pages/DashboardPage'
import { renderSquadPage } from './pages/SquadPage'

/**
 * Main Application Entry Point
 * 
 * Sets up routing and initializes the application.
 */

// Register routes
router.register('/login', () => {
  renderLoginPage()
})

router.register('/register', () => {
  renderRegisterPage()
})

router.register('/dashboard', () => {
  renderDashboardPage()
})

// Squad page route - handle with gameweek ID parameter
router.register('/squad', () => {
  const route = router.getCurrentRoute()
  // Check if route has gameweek ID: /squad/1, /squad/2, etc.
  const match = route.match(/^\/squad\/(\d+)$/)
  const gameweekId = match ? parseInt(match[1]) : undefined
  renderSquadPage(gameweekId)
})

// Default route - redirect to login or dashboard based on auth status
router.register('/', () => {
  if (authService.isAuthenticated()) {
    router.navigate('/dashboard')
  } else {
    router.navigate('/login')
  }
})

// Initialize routing after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp()
  })
} else {
  // DOM is already ready
  initializeApp()
}

function initializeApp() {
  const currentRoute = router.getCurrentRoute()
  
  // If no route or root route, navigate based on auth status
  if (!currentRoute || currentRoute === '/') {
    if (authService.isAuthenticated()) {
      router.navigate('/dashboard')
    } else {
      router.navigate('/login')
    }
  } else {
    // Route exists - handle it
    router.init()
  }
}
