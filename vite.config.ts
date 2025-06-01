import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'https://fin.anshulkr.com',
        changeOrigin: true,
        secure: false,
      },
      // Proxy WebSocket connections
      '/socket.io': {
        target: 'https://fin.anshulkr.com',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});