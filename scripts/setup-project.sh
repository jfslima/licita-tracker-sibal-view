
#!/bin/bash

# Script para configurar o projeto corretamente
set -e

echo "🔧 Configurando projeto SIBAL Licita Tracker..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
  echo "❌ Erro: package.json não encontrado na raiz"
  echo "Execute este script na raiz do projeto"
  exit 1
fi

# Criar package-lock.json se não existir
if [ ! -f "package-lock.json" ]; then
  echo "📦 Criando package-lock.json..."
  npm install --legacy-peer-deps
  echo "✅ package-lock.json criado com sucesso"
else
  echo "📦 package-lock.json já existe, atualizando..."
  rm package-lock.json
  npm install --legacy-peer-deps
fi

# Verificar estrutura do backend
if [ ! -d "src/backend" ]; then
  echo "❌ Diretório src/backend não encontrado"
  exit 1
fi

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd src/backend
npm install --legacy-peer-deps
cd ../..

# Verificar se o build funciona
echo "🔨 Testando build do frontend..."
npm run build

echo "🔨 Testando build do backend..."
cd src/backend
npm run build
cd ../..

echo ""
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo ""
echo "📋 Próximos passos:"
echo "1. Commit das mudanças:"
echo "   git add ."
echo "   git commit -m 'Fix: Estrutura completa do projeto corrigida'"
echo "   git push"
echo ""
echo "2. Deploy no Render:"
echo "   - Vá para https://render.com"
echo "   - Conecte seu repositório GitHub via Blueprint"
echo "   - Configure DATABASE_URL e GROQ_API_KEY no painel"
echo ""
echo "🔗 Estrutura final:"
echo "   - Frontend: raiz do projeto (React + Vite)"
echo "   - Backend: src/backend/ (MCP Server + Prisma)"
echo "   - Build unificado sem packages/mcp-server"
