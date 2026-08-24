import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': 'http://127.0.0.1:5040',
      '/health': 'http://127.0.0.1:5040',
      '/webhook': 'http://127.0.0.1:5040',
    },
  },
})
