import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: {
      origin: ['localhost', '127.0.0.1', 'backend', '127.0.0.1:8000'],
    },
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: process.env.REACT_APP_API_URL || 'http://backend:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
})

