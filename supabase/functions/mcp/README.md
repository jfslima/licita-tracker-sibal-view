# SIBAL MCP Unificado

Servidor MCP (Model Context Protocol) unificado para análise inteligente de licitações do SIBAL.

## 🚀 Funcionalidades

### Ferramentas Disponíveis

1. **fetch_notices** - Busca avançada de editais
   - Busca semântica com IA
   - Filtros por órgão, modalidade, valor
   - Análise de urgência automática
   - Estatísticas em tempo real

2. **risk_classifier** - Classificação de risco
   - Análise de risco com IA (Groq/Llama)
   - Pontuação de 0-100
   - Categorização automática
   - Fallback para análise baseada em regras

3. **summarize_notice** - Resumo inteligente
   - Resumo estruturado com IA
   - Extração de pontos-chave
   - Análise de requisitos
   - Identificação de oportunidades

4. **process_document** - Processamento de documentos
   - Suporte a PDF, DOCX, XLSX
   - Extração de texto e tabelas
   - Identificação de requisitos
   - Estruturação de informações

5. **generate_proposal_insights** - Insights para propostas
   - Análise personalizada por empresa
   - Recomendações estratégicas
   - Análise de concorrência
   - Probabilidade de sucesso

6. **monitor_deadlines** - Monitoramento de prazos
   - Alertas inteligentes
   - Recomendações de ação
   - Eventos de calendário
   - Análise de urgência

## 🏗️ Arquitetura

```
supabase/functions/mcp/
├── index.ts              # Servidor MCP principal
├── tools/                # Implementação das ferramentas
│   ├── fetch_notices.ts
│   ├── risk_classifier.ts
│   ├── summarize_notice.ts
│   ├── process_document.ts
│   ├── generate_proposal_insights.ts
│   └── monitor_deadlines.ts
├── mcp.yaml             # Configuração do MCP
├── deno.json            # Configuração Deno
└── README.md            # Esta documentação
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Configurações opcionais
MCP_LOG_LEVEL=info
MCP_RATE_LIMIT=100
MCP_TIMEOUT=30000
```

### Deploy no Supabase

```bash
# Deploy da função
supabase functions deploy mcp

# Configurar variáveis de ambiente
supabase secrets set GROQ_API_KEY=your_key
```

## 🚀 Uso

### Como Edge Function (HTTP)

```javascript
// Listar ferramentas disponíveis
fetch('https://your-project.supabase.co/functions/v1/mcp', {
  method: 'GET'
})

// Chamar uma ferramenta
fetch('https://your-project.supabase.co/functions/v1/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    method: 'tools/call',
    params: {
      name: 'fetch_notices',
      arguments: {
        query: 'material de escritório',
        limit: 10
      }
    }
  })
})
```

### Como Servidor MCP (Stdio)

```bash
# Executar servidor MCP
deno run --allow-net --allow-env index.ts
```

### Integração com Frontend

```typescript
// Hook personalizado para MCP
import { useSupabaseMcp } from '@/hooks/useSupabaseMcp'

const { callTool, isLoading } = useSupabaseMcp()

// Buscar editais
const notices = await callTool('fetch_notices', {
  query: 'construção civil',
  organ: 'Prefeitura Municipal',
  limit: 20
})

// Classificar risco
const riskAnalysis = await callTool('risk_classifier', {
  notice_id: 'uuid-do-edital'
})
```

## 📊 Monitoramento

### Logs e Métricas

Todos os requests são logados na tabela `mcp_logs` com:
- Tempo de execução
- Tokens utilizados
- Custo estimado
- Status da resposta
- Parâmetros da requisição

### Dashboard de Métricas

```sql
-- Ver métricas dos últimos 30 dias
SELECT * FROM mcp_metrics_dashboard
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC, requests_count DESC;
```

## 🔒 Segurança

### Row Level Security (RLS)

- **notices**: Leitura pública, escrita restrita ao sistema
- **user_follows**: Usuários veem apenas seus seguimentos
- **proposal_insights**: Baseado em company_id
- **mcp_logs**: Apenas sistema pode acessar

### Rate Limiting

- Limite configurável por usuário/IP
- Throttling automático em caso de sobrecarga
- Monitoramento de uso por empresa

## 🧪 Desenvolvimento

### Executar Localmente

```bash
# Instalar Deno
curl -fsSL https://deno.land/install.sh | sh

# Executar em modo desenvolvimento
deno task dev

# Executar testes
deno task test

# Formatar código
deno fmt

# Lint
deno lint
```

### Estrutura de Dados

```typescript
// Exemplo de resposta da ferramenta fetch_notices
{
  "notices": [
    {
      "id": "uuid",
      "title": "Aquisição de Material de Escritório",
      "organ": "Prefeitura Municipal",
      "estimated_value": 50000.00,
      "submission_deadline": "2024-12-15T23:59:59Z",
      "urgency_level": "medium",
      "days_until_deadline": 14
    }
  ],
  "stats": {
    "total_found": 25,
    "avg_value": 75000.00,
    "urgent_count": 3
  },
  "execution_time_ms": 245
}
```

## 📈 Performance

### Otimizações

- Cache inteligente de resultados
- Índices otimizados no banco
- Processamento assíncrono
- Fallbacks para alta disponibilidade

### Métricas Típicas

- **fetch_notices**: ~200-500ms
- **risk_classifier**: ~1-3s (com IA)
- **summarize_notice**: ~2-5s (com IA)
- **process_document**: ~5-15s (dependendo do tamanho)

## 🔄 Migração

Para migrar do MCP atual:

1. Execute a migração do banco: `20241201000001_mcp_unified_schema.sql`
2. Deploy da nova Edge Function
3. Atualize as chamadas no frontend
4. Configure as novas variáveis de ambiente
5. Teste todas as funcionalidades

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de autenticação Groq**
   - Verifique se `GROQ_API_KEY` está configurada
   - Confirme se a chave tem créditos disponíveis

2. **Timeout em ferramentas**
   - Aumente `MCP_TIMEOUT` se necessário
   - Verifique conectividade com APIs externas

3. **Erro de permissão no Supabase**
   - Confirme políticas RLS
   - Verifique se `SUPABASE_SERVICE_ROLE_KEY` está correta

### Logs de Debug

```bash
# Ver logs da função
supabase functions logs mcp

# Ver logs em tempo real
supabase functions logs mcp --follow
```

## 📚 Recursos Adicionais

- [Documentação MCP](https://modelcontextprotocol.io/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Groq API](https://console.groq.com/docs)
- [Deno Runtime](https://deno.land/manual)

---

**Versão**: 2.0.0  
**Última atualização**: Dezembro 2024  
**Compatibilidade**: Supabase Edge Functions, Deno 1.40+