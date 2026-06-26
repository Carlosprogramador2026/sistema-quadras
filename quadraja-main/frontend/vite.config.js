import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy /api -> backend, para o front chamar caminhos relativos.
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
});
