
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
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
