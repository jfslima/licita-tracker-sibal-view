
#!/bin/bash

echo "🚀 Iniciando Sistema Licita Tracker com IA..."

# Verificar se os arquivos de configuração existem
if [ ! -f "mcp-server/.env" ]; then
    echo "❌ Arquivo mcp-server/.env não encontrado!"
    echo "📝 Criando arquivo de exemplo..."
    cat > mcp-server/.env << EOL
# Chave da API Groq
GROQ_API_KEY=sua_chave_aqui

# Modelo padrão do Groq
GROQ_MODEL=llama3-70b-8192

# Porta do servidor
PORT=8080
EOL
    echo "⚠️  Configure sua chave da API Groq no arquivo mcp-server/.env"
    exit 1
fi

echo "✅ Arquivo de configuração encontrado"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado  
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale o npm primeiro."
    exit 1
fi

# Instalar dependências do servidor MCP se necessário
if [ ! -d "mcp-server/node_modules" ]; then
    echo "📦 Instalando dependências do servidor MCP..."
    cd mcp-server
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências"
        exit 1
    fi
    cd ..
fi

echo "🔧 Iniciando servidor MCP..."
cd mcp-server

# Matar processos antigos na porta 8080
echo "🧹 Limpando processos na porta 8080..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Aguardar um momento
sleep 2

echo "▶️  Iniciando servidor..."
npm run dev &
MCP_PID=$!
cd ..

echo "⏳ Aguardando servidor MCP inicializar..."
sleep 5

# Verificar se o servidor está rodando
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Servidor MCP está funcionando!"
else
    echo "⚠️  Servidor pode estar iniciando... Aguarde mais um momento"
fi

echo ""
echo "🌟 Sistema configurado e pronto para uso!"
echo ""
echo "📋 Para usar o sistema:"
echo "   1. Abra a aplicação no navegador"
echo "   2. Clique em 'Busca Inteligente' para testar a IA"
echo "   3. Experimente perguntas sobre licitações"
echo ""
echo "🔧 Comandos úteis:"
echo "   - Verificar status: curl http://localhost:8080/health"
echo "   - Testar servidor: curl http://localhost:8080/test"
echo ""
echo "🛑 Para parar o sistema, pressione Ctrl+C"

# Aguardar interrupção
trap "echo '🛑 Parando sistema...'; kill $MCP_PID 2>/dev/null; exit 0" INT
wait
