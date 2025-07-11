#!/bin/bash

# Script para corrigir build command que tem referência antiga a packages/mcp-server
echo "🔧 Corrigindo script de build..."

# Backup do package.json original
cp package.json package.json.backup

# Corrigir o script de build usando sed
sed -i 's/"build": "vite build && pnpm --filter \.\/packages\/mcp-server run build"/"build": "vite build"/g' package.json

echo "✅ Script de build corrigido!"
echo "📝 Novo script de build:"
grep -A 1 '"build":' package.json

# Executar build corrigido
echo "🚀 Executando build..."
npm run build

# Se backend existe, compilar também
if [ -d "src/backend" ]; then
    echo "🔧 Compilando backend..."
    cd src/backend
    npm install --legacy-peer-deps 2>/dev/null || echo "Backend dependencies já instaladas"
    npm run build
    cd ../..
fi

echo "✅ Build concluído!"