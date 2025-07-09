#!/usr/bin/env node

// fix-imports.js - Script para ajustar importação do SDK no arquivo JS gerado
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obter o diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho para o arquivo de saída
const distPath = join(__dirname, 'dist', 'index.js');

console.log(`Corrigindo importações em ${distPath}`);

try {
  // Ler o arquivo compilado
  let content = readFileSync(distPath, 'utf8');
  
  // Substitui a importação problemática pela importação direta do ESM
  const result = content.replace(
    "import { createMcpServer, z } from '@modelcontextprotocol/sdk';",
    "import { createMcpServer, z } from '@modelcontextprotocol/sdk/dist/esm/server/index.js';"
  );
  
  // Verificar se a substituição foi feita
  if (content === result) {
    console.log('⚠️ Nenhuma substituição de importação foi necessária.');
  } else {
    // Escrever o conteúdo modificado de volta para o arquivo
    writeFileSync(distPath, result, 'utf8');
    console.log('✅ Importações corrigidas com sucesso!');
  }
} catch (error) {
  console.error('❌ Erro ao corrigir importações:', error);
  process.exit(1);
}
