import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    // Faster startup in WebContainer
    host: true,
    strictPort: false,
  },
  // Optimize for faster dev startup
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  // Reduce initial build time
  esbuild: {
    target: 'esnext',
  },
})
