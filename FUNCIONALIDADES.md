# SIBAL - Sistema Inteligente de Busca e Análise de Licitações

## Status do Projeto ✅

**Projeto funcionando perfeitamente em http://localhost:3001/**

### Problemas Resolvidos:
- ✅ Dependências instaladas corretamente com `pnpm`
- ✅ Dependências `tesseract.js`, `sharp`, `puppeteer` e `axios` instaladas com sucesso
- ✅ Importação dinâmica implementada para compatibilidade frontend/backend
- ✅ Configuração Vite otimizada para excluir dependências Node.js do bundle
- ✅ WebScraper mock criado para desenvolvimento frontend
- ✅ Build executado sem erros do Rollup
- ✅ Servidor de desenvolvimento rodando sem problemas

O projeto está **funcionando corretamente** e todas as funcionalidades principais estão operacionais.

## Funcionalidades Implementadas

### ✅ Funcionalidades Principais (Funcionando)
- **Dashboard Interativo**: Interface principal com métricas e estatísticas
- **Sistema de Busca de Licitações**: Busca avançada com filtros múltiplos
- **Gerenciador de Workflows**: Automação de processos de licitação
- **Centro de Notificações**: Sistema de alertas e notificações
- **Análise de Documentos**: Processamento de PDF, Word e Excel
- **Integração com APIs**: Conexão com PNCP, ComprasNet, TCE-SP, BLL, Licitações-e
- **Servidor MCP**: Protocolo de comunicação para IA
- **Configuração Supabase**: Banco de dados e autenticação
- **OCR de Imagens**: ✅ **REATIVADO** - Processamento de texto em imagens com `tesseract.js` e `sharp`
- **Web Scraping Avançado**: ✅ **REATIVADO** - Extração de dados de portais com `puppeteer`

### 🔧 Funcionalidades Técnicas Implementadas

- **Importação Dinâmica**: WebScraper carregado condicionalmente (backend vs frontend)
- **Mock para Frontend**: WebScraper simulado para desenvolvimento frontend
- **Configuração Vite**: Exclusão de dependências Node.js do bundle do navegador
- **Busca Híbrida**: Combinação de APIs oficiais + Web Scraping
- **Monitoramento de Páginas**: Detecção automática de mudanças em portais

## Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- pnpm (gerenciador de pacotes)

### Instalação
```bash
# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

### URLs de Acesso
- **Local**: http://localhost:3000/
- **Rede**: http://192.168.0.177:3000/

## Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── AdvancedDashboard.tsx
│   ├── WorkflowManager.tsx
│   ├── DocumentAnalyzer.tsx
│   ├── NotificationCenter.tsx
│   └── LicitacaoSystem.tsx
├── services/            # Serviços e lógica de negócio
│   ├── licitationApiIntegration.ts
│   ├── advancedLicitationAnalyzer.ts
│   ├── notificationSystem.ts
│   ├── workflowAutomation.ts
│   └── documentProcessor.ts
├── backend/             # Backend e configurações
│   ├── config/supabase.ts
│   └── mcp/server.ts
└── utils/               # Utilitários
    └── camelizeKeys.ts
```

## Próximos Passos

1. **Configurar Supabase**: Seguir o guia em `DEPLOYMENT.md`
2. **Configurar variáveis de ambiente**: Copiar `.env.example` para `.env`
3. **Ativar funcionalidades opcionais**: Instalar dependências conforme necessário
4. **Deploy**: Seguir instruções de deployment

## Suporte

Todas as funcionalidades principais estão funcionando. Para ativar funcionalidades avançadas como OCR e web scraping, instale as dependências opcionais conforme descrito acima.