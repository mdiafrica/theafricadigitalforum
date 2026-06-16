import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    open: true,
    hmr: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
});