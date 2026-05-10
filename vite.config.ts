import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/yogabuddy/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => id.includes('node_modules/tone') ? 'tone' : undefined,
      },
    },
  },
})
