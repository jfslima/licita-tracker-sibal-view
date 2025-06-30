# Guia de Deployment do SIBAL Licita Tracker (MCP)

Este documento descreve o processo de deployment da aplicação SIBAL Licita Tracker com integração MCP (Model Context Protocol) no Railway.

## Arquitetura

A aplicação está dividida em duas partes principais:

1. **Backend MCP Server** (`packages/mcp-server`): Servidor Express que expõe a API MCP e se comunica com o serviço Groq AI.
2. **Frontend React** (raiz do projeto): Aplicação Vite/React que consome a API MCP.

## Configuração do Ambiente

### Backend MCP Server

O servidor MCP requer as seguintes variáveis de ambiente:

```
PORT=8080  # Porta em que o servidor irá rodar (Railway define automaticamente)
API_KEY=local-dev  # Chave para autenticação das requisições ao MCP
GROQ_API_KEY=gsk_xxx  # Chave da API Groq
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct  # Modelo utilizado
```

### Frontend React

O frontend requer as seguintes variáveis de ambiente:

```
VITE_MCP_URL=https://licita-tracker-sibal-view-production.up.railway.app/mcp  # URL do servidor MCP
VITE_MCP_HEADER=api-key  # Nome do cabeçalho para autenticação
VITE_MCP_TOKEN=local-dev  # Valor do token para autenticação
VITE_LOVABLE_MODEL=meta-llama/llama-4-scout-17b-16e-instruct  # Modelo a ser usado
```

## Passos para Deployment

### 1. Deployment do MCP Server

1. No Railway, crie um novo serviço a partir do repositório GitHub
2. Configure o diretório raiz como `packages/mcp-server`
3. Defina o comando de build: `npm run build`
4. Defina o comando de start: `npm run start`
5. Configure as variáveis de ambiente necessárias
6. Deploy!

### 2. Deployment do Frontend

1. No Railway, crie um novo serviço a partir do mesmo repositório GitHub
2. Configure o diretório raiz como `.` (raiz do projeto)
3. Defina o comando de build: `npm run build`
4. Defina o comando de start: `npm run preview`
5. Configure as variáveis de ambiente apontando para a URL do MCP Server
6. Deploy!

## Verificação do Deployment

Após o deployment, os seguintes endpoints devem estar funcionando:

- **MCP Server**: `https://licita-tracker-sibal-view-production.up.railway.app/health` (deve retornar status 200)
- **Frontend**: URL gerada pelo Railway para o serviço do frontend (deve mostrar a interface do SIBAL Licita Tracker)

## Testes da Integração MCP + IA

1. Acesse o frontend
2. Abra o chat IA
3. Envie uma mensagem
4. Verifique se a resposta é recebida corretamente
5. Teste a funcionalidade de resumo de documentos

## Troubleshooting

- **Erro de CORS**: Certifique-se de que o middleware CORS está configurado no MCP Server
- **Erro de Autenticação**: Verifique se as chaves API estão configuradas corretamente
- **Erro de Comunicação com Groq**: Verifique a chave API do Groq e o modelo selecionado
