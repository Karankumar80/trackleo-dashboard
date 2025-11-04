import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy REST calls to the server (optional)
      '/api/aio': 'http://localhost:3000',
      // WS proxy: Vite forwards WS automatically when the path matches
      '/ws/aio': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
};
