import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',  // Caminhos relativos para servir como static site
  server: {
    host: "::",
    port: 5173,
  },
  build: {
    outDir: 'dist',  // Diretório de saída do build
  },
  plugins: [
    react(),
    // Configuração do lovable-tagger apenas para desenvolvimento
    mode === 'development' && componentTagger({
      // Adicionar opções seguras para o componentTagger
      disableOnError: true, // Não falha o build se ocorrer um erro
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
