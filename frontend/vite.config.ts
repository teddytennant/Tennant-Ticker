import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    open: true,
    cors: true,
    hmr: {
      overlay: true,
      port: 5174
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
      '/fred-api': {
        target: 'https://api.stlouisfed.org/fred',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fred-api/, ''),
      }
    }
  },
  preview: {
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  publicDir: 'public',
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});
