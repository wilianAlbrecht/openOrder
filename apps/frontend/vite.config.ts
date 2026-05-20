import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
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
