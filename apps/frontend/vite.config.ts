import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'OpenOrder',
        short_name: 'OpenOrder',
        description: 'Sistema local de comandas offline-first',
        theme_color: '#0f766e',
        background_color: '#f8fafc',
        display: 'standalone',
        start_url: '/',
        icons: []
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true
  }
})
