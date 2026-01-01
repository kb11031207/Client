import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment
  // Use VITE_BASE environment variable, or default to /Client/ for project pages
  // For root deployment (username.github.io), set VITE_BASE=/ in production
  base: process.env.VITE_BASE || '/Client/',
  server: {
    port: 3000,
    host: true, // Allow access from network (0.0.0.0)
    open: true,
  },
})

