import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/lifetime-maintenance/', // Base path for GitHub Pages
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', 'html5-qrcode']
  }
})
