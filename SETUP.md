# 🚀 Setup do Sistema de Licitações com IA

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta na [Groq](https://console.groq.com/) para obter API key
- Git configurado

## ⚙️ Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd licita-tracker-sibal-view
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` e configure:
```env
# Obtenha sua chave em: https://console.groq.com/
GROQ_API_KEY=sua_chave_groq_aqui

# Outras configurações (já preenchidas)
API_KEY=local-dev
JWT_SECRET=sibal-jwt-secret-key-2024
GROQ_MODEL=meta-llama/llama-4-maverick-17b-128e-instruct
PORT=8080
VITE_MCP_URL=http://localhost:8080/mcp
VITE_MCP_HEADER=api-key
VITE_MCP_TOKEN=local-dev
VITE_LOVABLE_MODEL=meta-llama/llama-4-maverick-17b-128e-instruct
PORTAL_API_KEY=93b54528d36b1e9362619a68f8d70607
DATABASE_URL="file:./dev.db"
```

### 4. Inicie os serviços

**Terminal 1 - Backend MCP:**
```bash
node backend-simple.cjs
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Acesse a aplicação

- **Frontend**: http://localhost:3000
- **Backend MCP**: http://localhost:8080/mcp

## 🤖 Recursos de IA

- ✅ Chat especializado em licitações públicas
- ✅ Análise de documentos
- ✅ Modos consultant e teacher
- ✅ Integração com Groq API
- ✅ Interface moderna e responsiva

## 🔒 Segurança

- ❌ **NUNCA** commite o arquivo `.env` com chaves reais
- ✅ Use sempre o `.env.example` como referência
- ✅ Mantenha suas API keys seguras

## 🆘 Problemas Comuns

### Erro "GROQ_API_KEY não encontrada"
- Verifique se o arquivo `.env` existe
- Confirme se a chave está correta
- Reinicie o servidor backend

### Frontend não carrega
- Verifique se ambos os serviços estão rodando
- Confirme as portas 3000 e 8080
- Verifique o console do navegador

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.