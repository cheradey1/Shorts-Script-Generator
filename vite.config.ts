import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      css: {
        postcss: {
          plugins: [
            tailwindcss,
            autoprefixer,
          ],
        },
      },
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
        'global': 'window'
      },
      build: {
        outDir: 'dist',
        sourcemap: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              if (id.includes('node_modules')) {
                if (id.includes('react')) {
                  return 'react-vendor';
                }
                if (id.includes('@google/generative-ai')) {
                  return 'ai-vendor';
                }
                return 'vendor';
              }
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
