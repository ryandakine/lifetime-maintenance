import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to log server start
    {
      name: 'server-start-logger',
      configureServer(server) {
        server.middlewares.use('/__dev_log', (req, res, next) => {
          console.log('🚀 Vite dev server is running on port 5174')
          console.log('📅 Server started at:', new Date().toISOString())
          console.log('🌐 Local URL: http://localhost:5174')
          next()
        })
      },
      buildStart() {
        console.log('🚀 Vite dev server starting up...')
        console.log('⚙️ Port: 5174')
        console.log('📍 Environment: development')
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Lifetime Maintenance PWA',
        short_name: 'Lifetime Maint',
        description: 'Lifetime Fitness Maintenance Management',
        theme_color: '#007BFF',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5174,
    open: true,
    hmr: {
      overlay: false // Disable HMR overlay to prevent blocking
    }
  },
  define: {
    // Add development logging hook
    __DEV_SERVER_START__: JSON.stringify(new Date().toISOString())
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress certain warnings that might cause issues
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        warn(warning)
      }
    }
  }
}) 