import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,  // Automatically opens browser when server starts
    hmr: true,   // Enable Hot Module Replacement (auto-reload)
    watch: {
      usePolling: true,  // Better file watching for Windows
      interval: 100,     // Check for changes every 100ms
    },
  },
});