import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
  preview: {
    port: 3000,
    host: true,
    allowedHosts:['sliacfantasy.kberezi.tech']
  }
  // Base path for GitHub Pages deployment
  // Use VITE_BASE environment variable, or default to /Client/ for project pages
  // For root deployment (username.github.io), set VITE_BASE=/ in production
 
})

