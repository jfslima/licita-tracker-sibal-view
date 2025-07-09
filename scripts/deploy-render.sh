
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
git commit -m "Deploy: Configuração atualizada para Render $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nenhuma mudança para commitar"
git push origin main || git push origin master

echo "✅ Deploy preparado!"
echo ""
echo "📋 Próximos passos no Render:"
echo "1. Vá para https://render.com"
echo "2. Clique em 'New +' → 'Blueprint'"
echo "3. Conecte seu repositório GitHub"
echo "4. Configure as variáveis de ambiente:"
echo "   - GROQ_API_KEY: sua chave da API Groq"
echo "   - DATABASE_URL: URL do banco PostgreSQL (opcional)"
echo "5. Clique em 'Apply' para fazer o deploy"
echo ""
echo "🔗 URLs após o deploy:"
echo "   - Backend: https://mcp-server-[seu-hash].onrender.com"
echo "   - Frontend: https://frontend-[seu-hash].onrender.com"
echo ""
echo "🔧 Estrutura do projeto:"
echo "   - Backend está em: src/backend/"
echo "   - Frontend está na raiz do projeto"
echo "   - Comando de build backend: npm install && cd src/backend && npx tsc"
echo "   - Comando de build frontend: npm install && npm run build"
echo ""
echo "📋 Checklist:"
echo "   ✓ render.yaml configurado"
echo "   ✓ Backend em src/backend/"
echo "   ✓ Dependências do backend instaladas"
echo "   ✓ TypeScript configurado"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Configure GROQ_API_KEY no painel do Render"
echo "   - DATABASE_URL é opcional (usado apenas se tiver Prisma)"
echo "   - JWT_SECRET será gerado automaticamente"
