// Serviço para integração com a API do Portal Nacional de Contratações Públicas (PNCP)
// Baseado na documentação oficial: https://pncp.gov.br/api/pncp/v1/docs

const USE_PROXY = false;

const DIRECT_BASE = 'https://pncp.gov.br/api/search/';      // chamada direta (pode ter CORS)
const PROXY_BASE  = '/api/pncp/search';    // proxy via vite configurado no vite.config.ts

const BASE = USE_PROXY ? PROXY_BASE : DIRECT_BASE;

export async function buscarEditais({
  pagina = 1,
  palavraChave,
  status = 'aberta',
  uf,
}: {
  pagina?: number;
  palavraChave?: string;
  status?: string;
  uf?: string;
}): Promise<PNCPResponse> {
  const url = new URL(BASE);
  url.searchParams.set('tipos_documento', 'edital');
  url.searchParams.set('pagina', String(pagina));
  url.searchParams.set('tam_pagina', '20');
  url.searchParams.set('ordenacao', '-data');
  if (status) url.searchParams.set('status', status);              // aberta|divulgada|concluida
  if (palavraChave?.trim()) url.searchParams.set('q', palavraChave.trim());
  if (uf) url.searchParams.set('uf', uf);

  console.log('🌐 URL da requisição:', url.toString());
  console.log('📋 Parâmetros:', { pagina, palavraChave, status, uf });

  const r = await fetch(url.toString(), { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`PNCP ${r.status} ${r.statusText}`);
  
  const rawResponse = await r.json();
  console.log('🔍 Resposta bruta da API:', {
    total: rawResponse.total,
    itemsLength: rawResponse.items?.length || 0,
    primeiroItem: rawResponse.items?.[0] ? {
      sequencial: rawResponse.items[0].sequencial,
      numeroControlePNCP: rawResponse.items[0].numeroControlePNCP,
      objetoContratacao: rawResponse.items[0].objetoContratacao
    } : 'Nenhum item'
  });
  
  // Transformar a resposta da API do PNCP para o formato esperado
         const transformedItems = (rawResponse.items || []).map((item: any) => ({
           sequencial: item.numero_sequencial || item.id || 0,
           numeroControlePNCP: item.numero_controle_pncp || item.numeroControlePNCP || '',
           linkSistemaOrigem: `https://pncp.gov.br/app/editais/${item.numero_sequencial || item.id}`,
           dataPublicacaoPncp: item.data_publicacao_pncp || item.data_publicacao || '',
           dataVigenciaInicio: item.data_inicio_vigencia,
           dataVigenciaFim: item.data_fim_vigencia,
           situacaoEdital: item.situacao_nome || '',
           modalidadeId: item.modalidade_licitacao_id || 0,
           modalidadeNome: item.modalidade_licitacao_nome || '',
           unidadeOrgao: {
             ufNome: item.uf || '',
             ufSigla: item.uf || '',
             municipioNome: item.municipio_nome || '',
             codigoIbge: item.municipio_id || '',
             nomeOrgao: item.orgao_nome || '',
             cnpj: item.orgao_cnpj || '',
             esferaId: item.esfera_id || '',
             poderId: item.poder_id || ''
           },
           objetoContratacao: item.title || item.description || '',
           informacaoComplementar: item.description,
           valorEstimadoTotal: item.valor_global,
           srp: false
         }));

  const response: PNCPResponse = {
    items: transformedItems,
    total: transformedItems.length,
    links: {
      first: '',
      last: '',
      prev: undefined,
      next: undefined
    },
    meta: {
      current_page: pagina,
      from: ((pagina - 1) * 20) + 1,
      last_page: Math.ceil((rawResponse.total || 0) / 20),
      path: url.toString(),
      per_page: 20,
      to: Math.min(pagina * 20, rawResponse.total || 0),
      total: rawResponse.total || 0
    }
  };
  
  return response;
}

// Manter compatibilidade com o código existente
export interface EditalPNCP {
  id: string;
  numero: string;
  objeto: string;
  valorEstimado: number;
  dataPublicacao: string;
  dataFinalProposta: string;
  modalidade: string;
  orgao: string;
  status: string;
  linkEdital: string;
}

interface PNCPEdital {
  sequencial: number;
  numeroControlePNCP: string;
  linkSistemaOrigem: string;
  dataPublicacaoPncp: string;
  dataVigenciaInicio?: string;
  dataVigenciaFim?: string;
  situacaoEdital: string;
  modalidadeId: number;
  modalidadeNome: string;
  unidadeOrgao: {
    ufNome: string;
    ufSigla: string;
    municipioNome: string;
    codigoIbge: string;
    nomeOrgao: string;
    cnpj: string;
    esferaId: string;
    poderId: string;
  };
  objetoContratacao: string;
  informacaoComplementar?: string;
  valorEstimadoTotal?: number;
  srp: boolean;
  justificativaPresencial?: string;
  itens?: Array<{
    numero: number;
    descricao: string;
    quantidade: number;
    unidadeMedida: string;
    valorUnitarioEstimado?: number;
    valorTotal?: number;
  }>;
}

interface PNCPResponse {
  items: PNCPEdital[];
  total: number;
  links?: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

interface PNCPSearchParams {
  pagina?: number;
  tamanhoPagina?: number;
  tam_pagina?: number;
  data_inicio?: string;
  data_fim?: string;
  cnpj_orgao?: string;
  modalidade?: string;
  uf?: string;
  municipio?: string;
  q?: string;
  status?: string;
}

class PNCPService {
  private baseUrl = BASE;
  private cache = new Map<string, { data: PNCPResponse; timestamp: number }>();
  private lastRequestTime = 0;
  private minRequestInterval = 5000; // 5 segundos entre requisições
  private cacheTimeout = 300000; // Cache válido por 5 minutos
  private retryAttempts = 0;
  private maxRetries = 1; // Apenas 1 tentativa para evitar spam
  private baseBackoffDelay = 15000; // 15 segundos base para backoff

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Calcular tempo de espera com backoff exponencial se houve tentativas
    let waitTime = this.minRequestInterval;
    if (this.retryAttempts > 0) {
      waitTime = this.baseBackoffDelay * Math.pow(2, this.retryAttempts - 1);
      console.log(`🔄 Tentativa ${this.retryAttempts}/${this.maxRetries} - Backoff exponencial: ${waitTime}ms`);
    }
    
    if (timeSinceLastRequest < waitTime) {
      const actualWaitTime = waitTime - timeSinceLastRequest;
      console.log(`⏳ Aguardando ${actualWaitTime}ms para evitar rate limit...`);
      await new Promise(resolve => setTimeout(resolve, actualWaitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  private async retryWithBackoff<T>(operation: () => Promise<T>): Promise<T> {
    this.retryAttempts = 0;
    
    while (this.retryAttempts <= this.maxRetries) {
      try {
        await this.waitForRateLimit();
        const result = await operation();
        this.retryAttempts = 0; // Reset em caso de sucesso
        return result;
      } catch (error) {
        this.retryAttempts++;
        
        if (error instanceof Error && (error.message.includes('429') || error.message.includes('Rate limit'))) {
          if (this.retryAttempts <= this.maxRetries) {
            const backoffTime = this.baseBackoffDelay * Math.pow(2, this.retryAttempts - 1);
            console.warn(`⚠️ Rate limit detectado - Aguardando ${backoffTime/1000}s antes da próxima tentativa`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
            continue;
          } else {
            console.error('❌ Rate limit persistente - Usando cache ou dados vazios');
            throw new Error('Rate limit persistente após múltiplas tentativas');
          }
        } else {
          // Para outros erros, não fazer retry
          throw error;
        }
      }
    }
    
    throw new Error('Máximo de tentativas atingido');
  }

  private getCacheKey(params: PNCPSearchParams): string {
    return JSON.stringify(params);
  }

  private getFromCache(key: string): PNCPResponse | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      console.log('📦 Dados obtidos do cache');
      return cached.data;
    }
    return null;
  }

  private getFromCacheAnyAge(key: string): PNCPResponse | null {
    const cached = this.cache.get(key);
    if (cached) {
      console.log(`📦 Usando cache antigo (${Math.round((Date.now() - cached.timestamp) / 1000)}s atrás)`);
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: PNCPResponse): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Limpar cache antigo
    if (this.cache.size > 50) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Busca editais no PNCP com filtros específicos
   */
  async buscarEditais(params: PNCPSearchParams = {}): Promise<PNCPResponse> {
    const cacheKey = this.getCacheKey(params);
    
    // Verificar cache primeiro
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      console.log('🔍 Iniciando busca no PNCP com rate limiting robusto...', params);
      
      const result = await this.retryWithBackoff(async () => {
        console.log('🌐 Fazendo requisição para PNCP...');
        
        // Fazer requisição direta para o backend/proxy
        const url = new URL(this.baseUrl);
        url.searchParams.set('tipos_documento', 'edital');
        url.searchParams.set('pagina', String(params.pagina || 1));
        url.searchParams.set('tamanhoPagina', String(params.tam_pagina || params.tamanhoPagina || 20));
        url.searchParams.set('ordenacao', '-data');
        if (params.status) url.searchParams.set('status', params.status);
        if (params.q?.trim()) url.searchParams.set('q', params.q.trim());
        if (params.uf) url.searchParams.set('uf', params.uf);
        if (params.modalidade) url.searchParams.set('codigoModalidadeContratacao', params.modalidade);
        if (params.data_inicio) url.searchParams.set('dataInicial', params.data_inicio.replace(/-/g, ''));
        if (params.data_fim) url.searchParams.set('dataFinal', params.data_fim.replace(/-/g, ''));
        
        console.log('🌐 URL da requisição:', url.toString());
        
        const response = await fetch(url.toString(), {
          headers: { accept: 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`PNCP ${response.status} ${response.statusText}`);
        }
        
        const rawResponse = await response.json();
        console.log('🔍 Resposta bruta da API:', {
          total: rawResponse.total,
          itemsLength: rawResponse.items?.length || 0
        });
        
        // Transformar a resposta da API do PNCP para o formato esperado
         const transformedItems = (rawResponse.items || []).map((item: any) => ({
           sequencial: item.numero_sequencial || item.id || 0,
           numeroControlePNCP: item.numero_controle_pncp || item.numeroControlePNCP || '',
           linkSistemaOrigem: `https://pncp.gov.br/app/editais/${item.numero_sequencial || item.id}`,
           dataPublicacaoPncp: item.data_publicacao_pncp || item.data_publicacao || '',
           dataVigenciaInicio: item.data_inicio_vigencia,
           dataVigenciaFim: item.data_fim_vigencia,
           situacaoEdital: item.situacao_nome || '',
           modalidadeId: item.modalidade_licitacao_id || 0,
           modalidadeNome: item.modalidade_licitacao_nome || '',
           unidadeOrgao: {
             ufNome: item.uf || '',
             ufSigla: item.uf || '',
             municipioNome: item.municipio_nome || '',
             codigoIbge: item.municipio_id || '',
             nomeOrgao: item.orgao_nome || '',
             cnpj: item.orgao_cnpj || '',
             esferaId: item.esfera_id || '',
             poderId: item.poder_id || ''
           },
           objetoContratacao: item.title || item.description || '',
           informacaoComplementar: item.description,
           valorEstimadoTotal: item.valor_global,
           srp: false
         }));
        
        const result: PNCPResponse = {
          items: transformedItems,
          total: transformedItems.length,
          links: {
            first: '',
            last: '',
            prev: undefined,
            next: undefined
          },
          meta: {
            current_page: params.pagina || 1,
            from: ((params.pagina || 1) - 1) * (params.tam_pagina || params.tamanhoPagina || 20) + 1,
            last_page: Math.ceil((rawResponse.total || 0) / (params.tam_pagina || params.tamanhoPagina || 20)),
            path: url.toString(),
            per_page: params.tam_pagina || params.tamanhoPagina || 20,
            to: Math.min((params.pagina || 1) * (params.tam_pagina || params.tamanhoPagina || 20), rawResponse.total || 0),
            total: rawResponse.total || 0
          }
        };
        
        return result;
      });
      
      console.log('✅ Sucesso na busca PNCP:', {
        totalItens: result.items.length,
        status: 'sucesso',
        primeiroItem: result.items[0] ? {
          sequencial: result.items[0].sequencial,
          numeroControlePNCP: result.items[0].numeroControlePNCP,
          objetoContratacao: result.items[0].objetoContratacao,
          unidadeOrgao: result.items[0].unidadeOrgao?.nomeOrgao
        } : 'Nenhum item'
      });
      
      // Salvar no cache
      this.setCache(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ Erro persistente na busca do PNCP:', error);
      
      // Tentar cache antigo como último recurso (qualquer idade)
      console.log('🔍 Tentando cache antigo como último recurso...');
      const cachedData = this.getFromCacheAnyAge(cacheKey);
      if (cachedData) {
        console.log('📦 Usando cache antigo devido a erro persistente');
        return cachedData;
      }
      
      // Tentar qualquer cache disponível para parâmetros similares
      console.log('🔍 Buscando qualquer cache disponível...');
      for (const [key, cached] of this.cache.entries()) {
        if (key.includes('pagina=1') || key.includes('status=')) {
          console.log('📦 Usando cache de busca similar devido a erro persistente');
          return cached.data;
        }
      }
      
      // Se não há cache, retornar resposta vazia em vez de falhar
      console.warn('⚠️ Retornando resposta vazia devido a falha total');
      return {
        items: [],
        total: 0,
        links: { first: '', last: '', prev: undefined, next: undefined },
        meta: {
          current_page: params.pagina || 1,
          from: 0,
          last_page: 0,
          path: '',
          per_page: 20,
          to: 0,
          total: 0
        }
      };
    }
  }

  /**
   * Busca editais que estão atualmente recebendo propostas
   */
  async buscarEditaisAtivos(pagina: number = 1): Promise<PNCPResponse> {
    console.log('🔍 buscarEditaisAtivos chamado com pagina:', pagina);
    const result = await this.buscarEditais({
      pagina,
      tam_pagina: 20,
      status: 'aberta'
    });
    console.log('📊 buscarEditaisAtivos resultado:', {
      total: result.items.length,
      primeiros3: result.items.slice(0, 3).map(e => ({
        sequencial: e.sequencial,
        numeroControlePNCP: e.numeroControlePNCP,
        objeto: e.objetoContratacao?.substring(0, 50)
      }))
    });
    return result;
  }

  /**
   * Busca editais por UF específica
   */
  async buscarEditaisPorUF(uf: string, pagina: number = 1): Promise<PNCPResponse> {
    return this.buscarEditais({
      uf,
      pagina,
      tam_pagina: 20
    });
  }

  /**
   * Busca editais por termo específico
   */
  async buscarEditaisPorTermo(termo: string, pagina: number = 1): Promise<PNCPResponse> {
    return this.buscarEditais({
      q: termo,
      pagina,
      tam_pagina: 20,
      status: 'aberta'
    });
  }

  /**
   * Busca editais por período específico
   */
  async buscarEditaisPorPeriodo(dataInicio: string, dataFim: string, pagina: number = 1): Promise<PNCPResponse> {
    return this.buscarEditais({
      data_inicio: dataInicio,
      data_fim: dataFim,
      pagina,
      tam_pagina: 20,
      status: 'aberta'
    });
  }

  /**
   * Busca especificamente pregões eletrônicos
   */
  async buscarPregaoEletronico(pagina: number = 1): Promise<PNCPResponse> {
    return this.buscarEditais({
      modalidade: 'Pregão Eletrônico',
      pagina,
      tam_pagina: 20,
      status: 'aberta'
    });
  }

  /**
   * Busca editais de alto valor - usando modalidades que tipicamente têm valores maiores
   */
  async buscarEditaisAltoValor(pagina: number = 1): Promise<PNCPResponse> {
    console.log('🔍 Buscando editais de alto valor (modalidades de maior valor)');
    
    // Buscar editais de modalidades que tipicamente têm valores mais altos
    // Modalidades: Pregão Eletrônico (5), Concorrência (1), Tomada de Preços (2)
    const modalidadesAltoValor = ['1', '2', '5']; // Concorrência, Tomada de Preços, Pregão Eletrônico
    
    try {
      // Buscar editais de pregão eletrônico (modalidade mais comum para alto valor)
      const response = await this.buscarEditais({
        pagina,
        tam_pagina: 30,
        status: 'aberta',
        modalidade: '5' // Pregão Eletrônico
      });
      
      console.log(`✅ Encontrados ${response.items.length} editais de pregão eletrônico`);
      
      // Se não encontrar pregões, buscar concorrências
      if (response.items.length === 0) {
        console.log('🔄 Buscando concorrências como alternativa...');
        const concorrenciaResponse = await this.buscarEditais({
          pagina,
          tam_pagina: 30,
          status: 'aberta',
          modalidade: '1' // Concorrência
        });
        
        return {
          ...concorrenciaResponse,
          items: concorrenciaResponse.items.slice(0, 20)
        };
      }
      
      return {
        ...response,
        items: response.items.slice(0, 20) // Limitar a 20 resultados
      };
      
    } catch (error) {
      console.error('❌ Erro ao buscar editais de alto valor:', error);
      // Fallback: buscar editais gerais
      return await this.buscarEditaisAtivos(pagina);
    }
  }

  /**
   * Busca editais com vencimento próximo (próximos 30 dias)
   */
  async buscarEditaisVencimentoProximo(pagina: number = 1): Promise<PNCPResponse> {
    console.log('📅 Buscando editais com vencimento próximo (próximos 30 dias)');
    
    try {
      // Buscar editais ativos
      const response = await this.buscarEditais({
        pagina,
        tam_pagina: 50,
        status: 'aberta'
      });
      
      const agora = new Date();
      const em30Dias = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // Filtrar editais que vencem nos próximos 30 dias
      const editaisVencimentoProximo = response.items.filter(edital => {
        if (!edital.dataVigenciaFim) return false;
        
        const dataVencimento = new Date(edital.dataVigenciaFim);
        return dataVencimento >= agora && dataVencimento <= em30Dias;
      });
      
      // Ordenar por data de vencimento (mais próximo primeiro)
      editaisVencimentoProximo.sort((a, b) => {
        const dataA = new Date(a.dataVigenciaFim || '').getTime();
        const dataB = new Date(b.dataVigenciaFim || '').getTime();
        return dataA - dataB;
      });
      
      console.log(`✅ Encontrados ${editaisVencimentoProximo.length} editais com vencimento próximo`);
      
      return {
        ...response,
        items: editaisVencimentoProximo.slice(0, 20) // Limitar a 20 resultados
      };
      
    } catch (error) {
      console.error('❌ Erro ao buscar editais com vencimento próximo:', error);
      // Fallback: buscar editais gerais
      return await this.buscarEditaisAtivos(pagina);
    }
  }

  /**
   * Limpa o cache do serviço
   */
  limparCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache do PNCP limpo');
  }

  /**
   * Obtém estatísticas do cache
   */
  getEstatisticasCache() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if ((now - value.timestamp) < this.cacheTimeout) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }
    
    return { 
      tamanho: this.cache.size,
      validas: validEntries,
      expiradas: expiredEntries,
      ultimaRequisicao: this.lastRequestTime ? new Date(this.lastRequestTime).toLocaleTimeString() : 'Nunca'
    };
  }

  /**
   * Calcula estatísticas dos editais
   */
  calcularEstatisticas(editais: PNCPEdital[]) {
    const total = editais.length;
    const valorTotal = editais.reduce((sum, edital) => sum + (edital.valorEstimadoTotal || 0), 0);
    const valorMedio = total > 0 ? valorTotal / total : 0;
    
    // Calcular estatísticas por modalidade
    const porModalidade: Record<string, number> = {};
    const porUF: Record<string, number> = {};
    const porOrgao: Record<string, number> = {};
    
    editais.forEach(edital => {
      // Por modalidade
      const modalidade = edital.modalidadeNome || 'Não informado';
      porModalidade[modalidade] = (porModalidade[modalidade] || 0) + 1;
      
      // Por UF
      const uf = edital.unidadeOrgao?.ufSigla || 'N/A';
      porUF[uf] = (porUF[uf] || 0) + 1;
      
      // Por órgão (limitando aos 10 principais)
      const orgao = edital.unidadeOrgao?.nomeOrgao || 'Não informado';
      porOrgao[orgao] = (porOrgao[orgao] || 0) + 1;
    });
    
    // Ordenar e limitar órgãos aos 10 principais
    const topOrgaos = Object.entries(porOrgao)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((acc, [orgao, count]) => {
        acc[orgao] = count;
        return acc;
      }, {} as Record<string, number>);
    
    console.log('📊 Estatísticas calculadas:', {
      total,
      valorTotal,
      valorMedio,
      modalidades: Object.keys(porModalidade).length,
      ufs: Object.keys(porUF).length,
      orgaos: Object.keys(topOrgaos).length
    });
    
    return {
      total,
      valorTotal,
      valorMedio,
      porModalidade,
      porUF,
      porOrgao: topOrgaos
    };
  }

  /**
   * Converte edital PNCP para formato interno
   */
  converterEditalParaFormato(edital: PNCPEdital) {
    return {
      id: edital.numeroControlePNCP,
      sequencial: edital.sequencial,
      titulo: edital.objetoContratacao,
      objeto: edital.objetoContratacao,
      orgao: edital.unidadeOrgao.nomeOrgao,
      uf: edital.unidadeOrgao.ufSigla,
      municipio: edital.unidadeOrgao.municipioNome,
      modalidade: edital.modalidadeNome,
      modalidadeId: edital.modalidadeId,
      situacao: edital.situacaoEdital,
      valorEstimado: edital.valorEstimadoTotal || 0,
      dataPublicacao: edital.dataPublicacaoPncp,
      dataVigenciaInicio: edital.dataVigenciaInicio,
      dataVigenciaFim: edital.dataVigenciaFim,
      linkOrigem: edital.linkSistemaOrigem,
      cnpjOrgao: edital.unidadeOrgao.cnpj,
      informacaoComplementar: edital.informacaoComplementar,
      srp: edital.srp,
      itens: edital.itens || []
    };
  }

  /**
   * Formata valor monetário
   */
  formatarValor(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  /**
   * Formata data
   */
  formatarData(data: string): string {
    if (!data) return '';
    const d = new Date(data);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('pt-BR');
  }
}

export const pncpService = new PNCPService();
export type { PNCPEdital, PNCPResponse, PNCPSearchParams };