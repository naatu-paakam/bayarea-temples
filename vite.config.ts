import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Subpath deployments (e.g. GitHub Pages project sites) need a base path:
  //   VITE_BASE_PATH=/bayarea-temples/ npm run build
  // Netlify serves from the domain root, so the default '/' is correct there.
  base: process.env.VITE_BASE_PATH || '/',
  server: { port: 5180 },
});
