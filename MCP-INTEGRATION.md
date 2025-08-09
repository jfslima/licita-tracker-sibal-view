# Integração MCP Server - Sistema SIBAL

## Visão Geral

Este documento descreve a integração completa do MCP (Model Context Protocol) Server com o sistema SIBAL (Sistema Brasileiro de Acompanhamento de Licitações). A integração permite análise inteligente de editais de licitação usando IA.

## 🚀 Funcionalidades Implementadas

### 1. MCP Server (N8N Workflow)
- **ID do Workflow**: `gHPYgMXn8M8C7TDg`
- **Nome**: "MCP Server"
- **Status**: Ativo
- **Endpoint**: `http://localhost:5678/webhook/mcp`

### 2. Ferramentas Disponíveis

#### `fetch_notices`
- **Descrição**: Busca editais de licitação com filtros inteligentes
- **Parâmetros**:
  - `query` (opcional): Termo de busca
  - `limit` (opcional): Número máximo de resultados (padrão: 10)
- **Retorno**: Lista de editais com metadados completos

#### `risk_classifier`
- **Descrição**: Classificação automática de risco usando IA
- **Parâmetros**:
  - `content` (obrigatório): Texto do edital para análise
- **Retorno**: 
  - `risk_level`: low/medium/high
  - `risk_score`: Pontuação de 0-100
  - `risk_factors`: Lista de fatores identificados
  - `recommendations`: Recomendações específicas

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   MCP Server    │    │   N8N Workflow  │
│   React/TS      │◄──►│   Webhook API   │◄──►│   AI Processing │
│   SIBAL UI      │    │   HTTP/JSON     │    │   Data Sources  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Estrutura de Arquivos

### Componentes Criados
- `src/components/MCPDemoSimulation.tsx` - Componente de demonstração com simulação
- `src/pages/MCPIntegration.tsx` - Página principal de integração
- `src/App.tsx` - Roteamento atualizado
- `src/components/Header.tsx` - Navegação atualizada

### Scripts de Teste
- `test-mcp-webhook.cjs` - Teste do webhook de produção
- `test-mcp-webhook-test-url.cjs` - Teste do webhook de desenvolvimento

## 🔧 Configuração

### Pré-requisitos
1. N8N rodando em `http://localhost:5678`
2. Workflow MCP Server ativo
3. Node.js e npm instalados
4. Dependências do projeto instaladas

### Instalação
```bash
# Clone o repositório
cd licita-tracker-sibal-view

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Acesso
- **Frontend**: http://localhost:3000
- **Página MCP**: http://localhost:3000/#mcp-integration
- **N8N**: http://localhost:5678

## 🧪 Testes

### Teste Manual via Interface
1. Acesse http://localhost:3000/#mcp-integration
2. Use a seção "Buscar Editais com Análise de Risco"
3. Use a seção "Classificação de Risco Manual"

### Teste via Script
```bash
# Teste do webhook (requer N8N ativo)
node test-mcp-webhook.cjs

# Teste da URL de desenvolvimento
node test-mcp-webhook-test-url.cjs
```

## 📊 Demonstração

A página de integração inclui:

### 1. Status da Integração
- Indicadores visuais do status dos componentes
- Verificação de conectividade

### 2. Funcionalidades Documentadas
- Descrição detalhada de cada ferramenta MCP
- Parâmetros e retornos esperados

### 3. Arquitetura Técnica
- Diagrama visual dos componentes
- Detalhes de configuração

### 4. Demonstração Interativa
- Simulação completa das funcionalidades
- Interface real para teste das ferramentas
- Dados de exemplo realistas

### 5. Próximos Passos
- Roadmap para produção
- Melhorias planejadas

## 🔒 Segurança

### Considerações Implementadas
- Validação de entrada nos componentes
- Tratamento de erros robusto
- Sanitização de dados

### Para Produção
- [ ] Implementar autenticação JWT
- [ ] Configurar HTTPS
- [ ] Rate limiting
- [ ] Logs de auditoria
- [ ] Validação de CORS

## 🚀 Próximos Passos

### Curto Prazo
1. **Webhook de Produção**
   - Resolver registro do webhook no N8N
   - Configurar URL de produção
   - Testes de integração completos

2. **Fontes de Dados Reais**
   - Integração com APIs governamentais
   - Scraping de portais de licitação
   - Normalização de dados

### Médio Prazo
3. **Melhorias de IA**
   - Treinamento de modelos específicos
   - Análise de sentimento
   - Predição de resultados

4. **Interface Avançada**
   - Dashboard em tempo real
   - Alertas personalizados
   - Relatórios automatizados

### Longo Prazo
5. **Escalabilidade**
   - Arquitetura de microserviços
   - Cache distribuído
   - Load balancing

6. **Integrações Externas**
   - APIs de terceiros
   - Sistemas ERP
   - Notificações multi-canal

## 📝 Logs e Monitoramento

### Logs Disponíveis
- Console do navegador (desenvolvimento)
- Logs do N8N (execução de workflows)
- Logs do Vite (servidor de desenvolvimento)

### Métricas Importantes
- Tempo de resposta das APIs
- Taxa de sucesso das classificações
- Número de editais processados
- Erros de integração

## 🤝 Contribuição

### Estrutura de Desenvolvimento
1. **Frontend**: React + TypeScript + Tailwind CSS
2. **Backend**: N8N Workflows
3. **IA**: Integração com modelos de linguagem
4. **Dados**: APIs governamentais e scraping

### Padrões de Código
- ESLint + Prettier configurados
- Componentes funcionais com hooks
- TypeScript strict mode
- Documentação inline

## 📞 Suporte

Para questões técnicas ou sugestões:
1. Verifique os logs do console
2. Confirme status do N8N
3. Teste conectividade de rede
4. Consulte documentação do N8N

---

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Status**: Demonstração Funcional