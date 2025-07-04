import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 7050,
    open: true,
    host: '0.0.0.0',
    hmr: {
      host: 'localhost',
      port: 7050
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: false,
    target: 'esnext',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress common warnings that cause build issues
        if (warning.code === 'INVALID_ANNOTATION') return;
        if (warning.message?.includes('externalized for browser compatibility')) return;
        if (warning.message?.includes('__PURE__')) return;
        warn(warning);
      }
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@mui/icons-material', 'thirdweb/react'],
    exclude: [],
    force: true
  },
  publicDir: 'public'
})
