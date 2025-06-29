
#!/bin/bash

echo "🚀 Iniciando Sistema Licita Tracker..."

# Verificar se os arquivos de configuração existem
if [ ! -f "mcp-server/.env" ]; then
    echo "❌ Arquivo mcp-server/.env não encontrado!"
    exit 1
fi

if [ ! -f ".env.local" ]; then
    echo "❌ Arquivo .env.local não encontrado!"
    exit 1
fi

echo "✅ Arquivos de configuração encontrados"

# Instalar dependências do servidor MCP se necessário
if [ ! -d "mcp-server/node_modules" ]; then
    echo "📦 Instalando dependências do servidor MCP..."
    cd mcp-server
    npm install
    cd ..
fi

echo "🔧 Iniciando servidor MCP..."
cd mcp-server
npm run dev &
MCP_PID=$!
cd ..

echo "⏳ Aguardando servidor MCP inicializar..."
sleep 3

echo "🌟 Sistema configurado e pronto para uso!"
echo ""
echo "📋 Para usar o sistema:"
echo "   1. Abra a aplicação no navegador"
echo "   2. Clique em 'Busca Inteligente' para testar a IA"
echo "   3. Experimente perguntas sobre licitações"
echo ""
echo "🛑 Para parar o sistema, pressione Ctrl+C"

# Aguardar interrupção
trap "echo '🛑 Parando sistema...'; kill $MCP_PID; exit 0" INT
wait
