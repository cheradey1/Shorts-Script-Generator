import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env': JSON.stringify({
          ...process.env,
          GEMINI_API_KEY: env.GEMINI_API_KEY || process.env.GEMINI_API_KEY,
          API_KEY: env.GEMINI_API_KEY || process.env.GEMINI_API_KEY,
          VERCEL_URL: process.env.VERCEL_URL
        })
      },
      build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'ai-vendor': ['@google/generative-ai']
            }
          }
        }
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
