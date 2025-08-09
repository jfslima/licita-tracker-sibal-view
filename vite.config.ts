
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    proxy: {
      '/api/pncp': {
        target: 'https://pncp.gov.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pncp/, '/api'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        'puppeteer',
        'puppeteer-core',
        'child_process',
        'fs',
        'path',
        'os',
        'crypto',
        'stream',
        'util',
        'events',
        'buffer',
        'querystring',
        'url',
        'string_decoder',
        'http',
        'https',
        'zlib',
        'net',
        'tls',
        'readline',
        'worker_threads'
      ]
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: [
      'puppeteer',
      'puppeteer-core'
    ]
  }
}));
