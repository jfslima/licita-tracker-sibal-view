
#!/bin/bash

echo "🚀 Iniciando SIBAL no Railway..."

# Verificar se estamos no ambiente correto
if [ "$RAILWAY_ENVIRONMENT" = "production" ]; then
    echo "✅ Ambiente Railway detectado"
    
    # Para o serviço MCP
    if [ -f "index.ts" ]; then
        echo "🔧 Iniciando MCP Server..."
        npm start
    else
        echo "🌐 Iniciando Frontend..."
        npm run preview
    fi
else
    echo "🏠 Ambiente local detectado"
    ./start-system.sh
fi
