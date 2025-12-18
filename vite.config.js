import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    // Разрешить все домены
    allowedHosts: true,

    // Разрешить все корсы
    cors: true,

    // Accept all requests from any origin
    hmr: {
      host: 'localhost'
    },

    // Разрешить любые запросы
    strictPort: false,
  }
})