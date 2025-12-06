# Prompt Completo para Integração com API PNCP

## Visão Geral

Este documento contém todas as informações necessárias para implementar a integração com o Portal Nacional de Contratações Públicas (PNCP) em outro programa.

---

## 1. URLs da API PNCP

### URL Base Oficial
```
https://pncp.gov.br/api/search/
```

### Endpoints Principais
| Endpoint | URL Completa | Descrição |
|----------|-------------|-----------|
| Busca/Search | `https://pncp.gov.br/api/search/` | Endpoint principal de busca de editais |
| Contratações | `https://pncp.gov.br/api/consulta/v1/contratacoes/{id}` | Detalhes de uma contratação específica |
| Download | `https://pncp.gov.br/api/pncp-api/v1` | Download de documentos |

### URL de Treinamento (Sandbox)
```
https://treina.pncp.gov.br/api/pncp
```

---

## 2. Parâmetros de Busca

### Parâmetros Obrigatórios/Recomendados
| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `tipos_documento` | string | Tipo de documento | `"edital"` |
| `pagina` | number | Número da página (1-1000) | `1` |
| `tam_pagina` | number | Itens por página (1-500) | `20` |
| `ordenacao` | string | Ordenação dos resultados | `"-data"` (mais recentes primeiro) |

### Parâmetros de Filtro Opcionais
| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `q` | string | Palavra-chave de busca | `"informática"` |
| `status` | string | Status do edital | `"aberta"`, `"divulgada"`, `"concluida"` |
| `uf` | string | Sigla do estado | `"SP"`, `"RJ"`, `"MG"` |
| `codigoModalidadeContratacao` | string | Modalidade da licitação | `"Pregão Eletrônico"` |
| `dataInicial` | string | Data inicial (YYYYMMDD) | `"20240101"` |
| `dataFinal` | string | Data final (YYYYMMDD) | `"20241231"` |
| `cnpj_orgao` | string | CNPJ do órgão | `"12345678000199"` |

---

## 3. Exemplo de Requisição

### URL Completa
```
https://pncp.gov.br/api/search/?tipos_documento=edital&pagina=1&tam_pagina=20&ordenacao=-data&status=aberta&q=informática
```

### Código JavaScript/TypeScript
```typescript
async function buscarEditaisPNCP({
  pagina = 1,
  palavraChave,
  status = 'aberta',
  uf,
}: {
  pagina?: number;
  palavraChave?: string;
  status?: string;
  uf?: string;
}) {
  const url = new URL('https://pncp.gov.br/api/search/');
  
  // Parâmetros obrigatórios
  url.searchParams.set('tipos_documento', 'edital');
  url.searchParams.set('pagina', String(pagina));
  url.searchParams.set('tam_pagina', '20');
  url.searchParams.set('ordenacao', '-data');
  
  // Parâmetros opcionais
  if (status) url.searchParams.set('status', status);
  if (palavraChave?.trim()) url.searchParams.set('q', palavraChave.trim());
  if (uf) url.searchParams.set('uf', uf);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`PNCP ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
```

---

## 4. Estrutura da Resposta da API

### Resposta Bruta
```json
{
  "total": 1500,
  "total_paginas": 75,
  "pagina_corrente": 1,
  "items": [
    {
      "id": "12345",
      "numero_sequencial": "123456",
      "numero_controle_pncp": "12345678-1-000001/2024",
      "title": "Pregão Eletrônico para aquisição de equipamentos",
      "description": "Descrição detalhada do objeto...",
      "orgao_nome": "Prefeitura Municipal de São Paulo",
      "orgao_cnpj": "12345678000199",
      "modalidade_licitacao_id": 6,
      "modalidade_licitacao_nome": "Pregão Eletrônico",
      "situacao_nome": "Recebendo Propostas",
      "data_publicacao_pncp": "2024-01-15",
      "data_publicacao": "2024-01-15",
      "data_inicio_vigencia": "2024-01-15",
      "data_fim_vigencia": "2024-01-30",
      "valor_global": 150000.00,
      "uf": "SP",
      "municipio_nome": "São Paulo",
      "municipio_id": "3550308",
      "esfera_id": "2",
      "poder_id": "1"
    }
  ]
}
```

### Mapeamento de Campos
| Campo da API | Descrição |
|-------------|-----------|
| `id` / `numero_sequencial` | Identificador único |
| `numero_controle_pncp` | Número de controle oficial |
| `title` | Título/Objeto resumido |
| `description` | Descrição completa |
| `orgao_nome` | Nome do órgão licitante |
| `orgao_cnpj` | CNPJ do órgão |
| `modalidade_licitacao_nome` | Tipo de licitação |
| `situacao_nome` | Status atual |
| `data_publicacao_pncp` | Data de publicação |
| `valor_global` | Valor estimado total |
| `uf` | Estado (sigla) |
| `municipio_nome` | Cidade |

---

## 5. Códigos de Modalidade

| Código | Modalidade |
|--------|-----------|
| 1 | Leilão Eletrônico |
| 2 | Diálogo Competitivo |
| 3 | Concurso |
| 4 | Concorrência Eletrônica |
| 5 | Concorrência Presencial |
| 6 | Pregão Eletrônico |
| 7 | Pregão Presencial |
| 8 | Dispensa |
| 9 | Inexigibilidade |
| 10 | Manifestação de Interesse |
| 11 | Pré-Qualificação |
| 12 | Credenciamento |
| 13 | Leilão Presencial |
| 14 | Inaplicabilidade |

---

## 6. Status Disponíveis

| Status | Descrição |
|--------|-----------|
| `aberta` | Editais abertos recebendo propostas |
| `divulgada` | Editais publicados/divulgados |
| `concluida` | Editais finalizados |
| `recebendo_proposta` | Recebendo propostas |
| `suspenso` | Processo suspenso |
| `cancelado` | Processo cancelado |
| `homologado` | Processo homologado |
| `deserto` | Sem propostas |
| `fracassado` | Processo fracassado |
| `revogado` | Processo revogado |

---

## 7. Tratamento de Erros

### Códigos HTTP
| Código | Descrição |
|--------|-----------|
| 400 | Parâmetros inválidos |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 429 | Rate limit - muitas requisições |
| 500 | Erro interno do servidor |
| 502 | Serviço temporariamente indisponível |
| 503 | API PNCP temporariamente indisponível |

### Implementação de Retry com Backoff
```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 5000
): Promise<T> {
  let attempts = 0;
  
  while (attempts <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempts++;
      
      if (error.message?.includes('429')) {
        // Rate limit - esperar mais tempo
        const backoffTime = baseDelay * Math.pow(2, attempts);
        console.log(`Rate limit - aguardando ${backoffTime}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        continue;
      }
      
      if (attempts > maxRetries) throw error;
    }
  }
  
  throw new Error('Máximo de tentativas atingido');
}
```

---

## 8. Sistema de Cache

### Configuração Recomendada
```typescript
const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000,  // 5 minutos
  maxSize: 100,         // máximo de 100 entradas
  minRequestInterval: 5000  // 5 segundos entre requisições
};

class PNCPCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private lastRequestTime = 0;

  getCacheKey(params: object): string {
    return JSON.stringify(params);
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_CONFIG.ttl) {
      return cached.data;
    }
    return null;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Limpar cache antigo (LRU)
    if (this.cache.size > CACHE_CONFIG.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
}
```

---

## 9. Proxy para CORS (Se necessário)

### Configuração Vite.js
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api/pncp': {
        target: 'https://pncp.gov.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pncp/, '/api'),
        secure: true
      }
    }
  }
});
```

### Configuração Node.js/Express
```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/api/pncp', createProxyMiddleware({
  target: 'https://pncp.gov.br',
  changeOrigin: true,
  pathRewrite: { '^/api/pncp': '/api' }
}));
```

---

## 10. Transformação de Dados

### Função para Normalizar Resposta
```typescript
interface EditalNormalizado {
  id: string;
  numeroControlePNCP: string;
  titulo: string;
  descricao: string;
  orgao: string;
  cnpjOrgao: string;
  modalidade: string;
  status: string;
  dataPublicacao: string;
  dataFimProposta: string;
  valorEstimado: number;
  uf: string;
  municipio: string;
  link: string;
}

function normalizarEdital(item: any): EditalNormalizado {
  return {
    id: item.numero_sequencial || item.id || '',
    numeroControlePNCP: item.numero_controle_pncp || item.numeroControlePNCP || '',
    titulo: item.title || item.objetoContratacao || '',
    descricao: item.description || '',
    orgao: item.orgao_nome || '',
    cnpjOrgao: item.orgao_cnpj || '',
    modalidade: item.modalidade_licitacao_nome || '',
    status: item.situacao_nome || '',
    dataPublicacao: item.data_publicacao_pncp || item.data_publicacao || '',
    dataFimProposta: item.data_fim_vigencia || '',
    valorEstimado: item.valor_global || 0,
    uf: item.uf || '',
    municipio: item.municipio_nome || '',
    link: `https://pncp.gov.br/app/editais/${item.numero_sequencial || item.id}`
  };
}
```

---

## 11. Exemplo de Serviço Completo

```typescript
class PNCPService {
  private baseUrl = 'https://pncp.gov.br/api/search/';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 300000; // 5 minutos

  async buscarEditais(params: {
    pagina?: number;
    palavraChave?: string;
    status?: string;
    uf?: string;
    modalidade?: string;
  } = {}) {
    const cacheKey = JSON.stringify(params);
    
    // Verificar cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    // Construir URL
    const url = new URL(this.baseUrl);
    url.searchParams.set('tipos_documento', 'edital');
    url.searchParams.set('pagina', String(params.pagina || 1));
    url.searchParams.set('tam_pagina', '20');
    url.searchParams.set('ordenacao', '-data');
    
    if (params.status) url.searchParams.set('status', params.status);
    if (params.palavraChave?.trim()) url.searchParams.set('q', params.palavraChave.trim());
    if (params.uf) url.searchParams.set('uf', params.uf);
    if (params.modalidade) url.searchParams.set('codigoModalidadeContratacao', params.modalidade);

    // Fazer requisição
    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`PNCP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Salvar no cache
    this.cache.set(cacheKey, { data, timestamp: Date.now() });

    return {
      items: (data.items || []).map(normalizarEdital),
      total: data.total || 0,
      totalPaginas: data.total_paginas || Math.ceil((data.total || 0) / 20),
      paginaAtual: params.pagina || 1
    };
  }

  async buscarDetalhes(id: string) {
    const url = `https://pncp.gov.br/api/consulta/v1/contratacoes/${id}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`PNCP ${response.status}`);
    }
    
    return await response.json();
  }
}

// Uso
const pncpService = new PNCPService();

// Buscar editais abertos
const editais = await pncpService.buscarEditais({
  status: 'aberta',
  palavraChave: 'informática',
  uf: 'SP'
});

console.log(editais);
```

---

## 12. Documentação Oficial

- **Portal PNCP**: https://pncp.gov.br
- **Documentação API**: https://pncp.gov.br/api/pncp/v1/docs
- **Ambiente de Treinamento**: https://treina.pncp.gov.br

---

## 13. Observações Importantes

1. **CORS**: A API PNCP pode bloquear requisições diretas do navegador. Use um proxy no backend.

2. **Rate Limiting**: A API tem limite de requisições. Implemente cache e backoff exponencial.

3. **Disponibilidade**: A API pode ter instabilidades. Sempre implemente tratamento de erros.

4. **Formato de Datas**: Datas devem estar no formato `YYYYMMDD` (sem hífens) para alguns parâmetros.

5. **Paginação**: Máximo de 500 itens por página, páginas de 1 a 1000.

6. **Ordenação**: Use `-data` para ordenar por data decrescente (mais recentes primeiro).

---

*Documento gerado automaticamente com base na implementação do sistema SIBAL.*
