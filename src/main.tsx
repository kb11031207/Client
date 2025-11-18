import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './style.css'

// Suppress browser extension errors (they don't affect our app)
window.addEventListener('error', (event) => {
  if (event.message?.includes('chrome-extension://') || 
      event.message?.includes('moz-extension://') ||
      event.filename?.includes('chrome-extension://') ||
      event.filename?.includes('moz-extension://')) {
    event.preventDefault()
    return false
  }
})

// Suppress unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('chrome-extension://') ||
      event.reason?.stack?.includes('chrome-extension://') ||
      typeof event.reason === 'string' && event.reason.includes('chrome-extension://')) {
    event.preventDefault()
    return false
  }
})

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

