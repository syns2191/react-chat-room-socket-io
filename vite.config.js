import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: true,
    port: 8000,
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  css: {
    devSourcemap: false
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled', '@mui/material/Tooltip'],
    dedupe: ['@emotion/react', '@emotion/styled', '@emotion/cache']
  }
})
