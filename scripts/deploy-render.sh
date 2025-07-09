
#!/bin/bash

# Script para deploy no Render
set -e

echo "🚀 Preparando deploy para o Render..."

# Verificar se estamos no diretório correto
if [ ! -f "render.yaml" ]; then
  echo "❌ Erro: arquivo render.yaml não encontrado"
  echo "Execute este script na raiz do projeto"
  exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Existem mudanças não commitadas:"
  git status --short
  read -p "Deseja continuar mesmo assim? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deploy cancelado"
    exit 1
  fi
fi

# Fazer push das mudanças
echo "📤 Fazendo push das mudanças..."
git add .
git commit -m "Deploy: Configuração corrigida para Render $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nenhuma mudança para commitar"
git push origin main || git push origin master

echo "✅ Deploy preparado!"
echo ""
echo "📋 Próximos passos no Render:"
echo "1. Vá para https://render.com"
echo "2. Clique em 'New +'  → 'Blueprint'"
echo "3. Conecte seu repositório GitHub"
echo "4. Configure as variáveis de ambiente:"
echo "   - GROQ_API_KEY: sua chave da API Groq"
echo "   - API_KEY: será gerada automaticamente"
echo "5. Clique em 'Apply' para fazer o deploy"
echo ""
echo "🔗 URLs após o deploy:"
echo "   - Backend: https://mcp-server.onrender.com"
echo "   - Frontend: https://frontend.onrender.com"
echo ""
echo "🔧 Comandos de build corretos:"
echo "   - Backend: cd packages/mcp-server && npm install && npm run build"
echo "   - Frontend: npm install && npm run build"
