import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This injects process.env.API_KEY from the build environment into the client-side code.
    // Ensure API_KEY is set in your .env files (VITE_APP_API_KEY or just API_KEY if Vite's default env handling is sufficient).
    // For Vercel, set API_KEY as an environment variable in project settings.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  build: {
    outDir: 'dist',
  },
  root: '.'
});