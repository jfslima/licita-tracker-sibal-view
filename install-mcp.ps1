Write-Output "Instalando dependências do projeto MCP..."

# Instala dependências do projeto principal
pnpm add express dotenv @modelcontextprotocol/sdk @modelcontextprotocol/client node-fetch

# Cria diretório packages/mcp-server se não existir
if (-not (Test-Path -Path "packages/mcp-server")) {
    New-Item -ItemType Directory -Path "packages/mcp-server" -Force
}

# Navega para o diretório mcp-server e instala suas dependências
Set-Location -Path "packages/mcp-server"
pnpm init -y
pnpm add express dotenv @modelcontextprotocol/sdk node-fetch
pnpm add -D tsx typescript @types/express @types/node

# Volta para o diretório raiz
Set-Location -Path "../.."

# Instrução para configurar o .env.local
Write-Output @"

✅ Dependências instaladas com sucesso!

⚠️ IMPORTANTE: Para finalizar a configuração, você precisa:

1. Criar ou editar o arquivo .env.local na raiz com:
```
VITE_MCP_URL=http://localhost:8080/mcp
VITE_MCP_HEADER=api-key
VITE_MCP_TOKEN=local-dev
VITE_LOVABLE_MODEL=llama3-70b-8192
```

2. Configurar o arquivo .env na raiz com sua chave da API Groq:
```
GROQ_API_KEY=sua_chave_aqui
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
PORT=8080
```

3. Iniciar os serviços (em terminais separados):
   - MCP Server: pnpm --filter mcp-server dev
   - Frontend: pnpm dev

"@

Write-Output "Fim da instalação."
