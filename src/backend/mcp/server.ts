import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { supabaseAdmin, dbConfig } from '../config/supabase.js';
import { documentProcessor } from '../../services/documentProcessor.js';
import { advancedLicitationAnalyzer } from '../../services/advancedLicitationAnalyzer.js';

/**
 * Servidor MCP para o SIBAL - Sistema Inteligente de Busca e Análise de Licitações
 * 
 * Este servidor fornece ferramentas avançadas de IA para:
 * - Análise de documentos de licitação
 * - Busca inteligente de oportunidades
 * - Análise de viabilidade e competitividade
 * - Geração de relatórios e insights
 */
class SibalMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'sibal-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    // Listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_licitacoes',
            description: 'Busca licitações no banco de dados com filtros avançados e IA',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Termo de busca (palavras-chave, CNPJ, número da licitação, etc.)'
                },
                filters: {
                  type: 'object',
                  properties: {
                    modalidade: { type: 'string' },
                    orgao: { type: 'string' },
                    valor_min: { type: 'number' },
                    valor_max: { type: 'number' },
                    data_inicio: { type: 'string' },
                    data_fim: { type: 'string' },
                    situacao: { type: 'string' },
                    uf: { type: 'string' },
                    cidade: { type: 'string' }
                  }
                },
                limit: { type: 'number', default: 50 },
                offset: { type: 'number', default: 0 },
                sort_by: { type: 'string', default: 'data_abertura' },
                sort_order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
              },
              required: ['query']
            }
          },
          {
            name: 'analyze_licitacao',
            description: 'Analisa uma licitação específica com IA para determinar viabilidade e estratégias',
            inputSchema: {
              type: 'object',
              properties: {
                licitacao_id: {
                  type: 'string',
                  description: 'ID da licitação a ser analisada'
                },
                empresa_perfil: {
                  type: 'object',
                  properties: {
                    cnpj: { type: 'string' },
                    porte: { type: 'string' },
                    atividades: { type: 'array', items: { type: 'string' } },
                    experiencias: { type: 'array' },
                    certificacoes: { type: 'array', items: { type: 'string' } },
                    capacidade_financeira: { type: 'number' },
                    equipe_tecnica: { type: 'number' }
                  }
                },
                tipo_analise: {
                  type: 'string',
                  enum: ['completa', 'viabilidade', 'competitividade', 'riscos'],
                  default: 'completa'
                }
              },
              required: ['licitacao_id']
            }
          },
          {
            name: 'process_document',
            description: 'Processa e extrai informações de documentos de licitação (PDF, Word, Excel)',
            inputSchema: {
              type: 'object',
              properties: {
                document_url: {
                  type: 'string',
                  description: 'URL do documento a ser processado'
                },
                document_type: {
                  type: 'string',
                  enum: ['edital', 'anexo', 'ata', 'resultado'],
                  description: 'Tipo do documento'
                },
                licitacao_id: {
                  type: 'string',
                  description: 'ID da licitação relacionada'
                },
                extract_tables: {
                  type: 'boolean',
                  default: true,
                  description: 'Extrair tabelas do documento'
                },
                extract_requirements: {
                  type: 'boolean',
                  default: true,
                  description: 'Extrair requisitos técnicos'
                }
              },
              required: ['document_url', 'document_type']
            }
          },
          {
            name: 'generate_proposal_insights',
            description: 'Gera insights e recomendações para elaboração de proposta',
            inputSchema: {
              type: 'object',
              properties: {
                licitacao_id: {
                  type: 'string',
                  description: 'ID da licitação'
                },
                empresa_perfil: {
                  type: 'object',
                  description: 'Perfil da empresa interessada'
                },
                historico_propostas: {
                  type: 'array',
                  description: 'Histórico de propostas anteriores da empresa'
                },
                concorrentes: {
                  type: 'array',
                  description: 'Lista de possíveis concorrentes'
                }
              },
              required: ['licitacao_id']
            }
          },
          {
            name: 'monitor_deadlines',
            description: 'Monitora prazos de licitações e gera alertas',
            inputSchema: {
              type: 'object',
              properties: {
                empresa_id: {
                  type: 'string',
                  description: 'ID da empresa para monitoramento'
                },
                dias_antecedencia: {
                  type: 'number',
                  default: 7,
                  description: 'Dias de antecedência para alertas'
                },
                tipos_prazo: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['abertura', 'entrega_proposta', 'sessao_publica', 'impugnacao']
                  },
                  default: ['entrega_proposta', 'sessao_publica']
                }
              },
              required: ['empresa_id']
            }
          },
          {
            name: 'generate_market_report',
            description: 'Gera relatório de inteligência de mercado sobre licitações',
            inputSchema: {
              type: 'object',
              properties: {
                periodo: {
                  type: 'object',
                  properties: {
                    inicio: { type: 'string' },
                    fim: { type: 'string' }
                  }
                },
                segmentos: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Segmentos de interesse'
                },
                regioes: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Regiões de interesse'
                },
                tipo_relatorio: {
                  type: 'string',
                  enum: ['tendencias', 'oportunidades', 'competitividade', 'completo'],
                  default: 'completo'
                }
              }
            }
          }
        ]
      };
    });

    // Executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_licitacoes':
            return await this.searchLicitacoes(args);
          
          case 'analyze_licitacao':
            return await this.analyzeLicitacao(args);
          
          case 'process_document':
            return await this.processDocument(args);
          
          case 'generate_proposal_insights':
            return await this.generateProposalInsights(args);
          
          case 'monitor_deadlines':
            return await this.monitorDeadlines(args);
          
          case 'generate_market_report':
            return await this.generateMarketReport(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Ferramenta desconhecida: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Erro ao executar ${name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async searchLicitacoes(args: any) {
    const { query, filters = {}, limit = 50, offset = 0, sort_by = 'data_abertura', sort_order = 'desc' } = args;

    // Construir query SQL dinâmica
    let sqlQuery = supabaseAdmin
      .from(dbConfig.tables.licitacoes)
      .select('*');

    // Aplicar filtros de texto
    if (query) {
      sqlQuery = sqlQuery.or(`objeto.ilike.%${query}%,numero.ilike.%${query}%,orgao.ilike.%${query}%`);
    }

    // Aplicar filtros específicos
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'valor_min') {
          sqlQuery = sqlQuery.gte('valor_estimado', value);
        } else if (key === 'valor_max') {
          sqlQuery = sqlQuery.lte('valor_estimado', value);
        } else if (key === 'data_inicio') {
          sqlQuery = sqlQuery.gte('data_abertura', value);
        } else if (key === 'data_fim') {
          sqlQuery = sqlQuery.lte('data_abertura', value);
        } else {
          sqlQuery = sqlQuery.eq(key, value);
        }
      }
    });

    // Aplicar ordenação e paginação
    sqlQuery = sqlQuery
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await sqlQuery;

    if (error) {
      throw new Error(`Erro na busca: ${error.message}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            results: data || [],
            total: count || 0,
            query: query,
            filters: filters,
            pagination: {
              limit,
              offset,
              has_more: (count || 0) > offset + limit
            }
          }, null, 2)
        }
      ]
    };
  }

  private async analyzeLicitacao(args: any) {
    const { licitacao_id, empresa_perfil, tipo_analise = 'completa' } = args;

    // Buscar dados da licitação
    const { data: licitacao, error } = await supabaseAdmin
      .from(dbConfig.tables.licitacoes)
      .select('*')
      .eq('id', licitacao_id)
      .single();

    if (error || !licitacao) {
      throw new Error(`Licitação não encontrada: ${licitacao_id}`);
    }

    // Buscar documentos relacionados
    const { data: documentos } = await supabaseAdmin
      .from(dbConfig.tables.documentos)
      .select('*')
      .eq('licitacao_id', licitacao_id);

    // Realizar análise com IA
    const documentText = `${licitacao.objeto}\n${licitacao.dados_originais?.descricao || ''}`;
    const analysis = await advancedLicitationAnalyzer.analyzeLicitation(
      documentText,
      empresa_perfil || {}
    );

    // Salvar análise no banco
    const { data: savedAnalysis } = await supabaseAdmin
      .from(dbConfig.tables.analises)
      .insert({
        licitacao_id,
        empresa_id: empresa_perfil?.cnpj || 'unknown',
        tipo_analise,
        resultado: analysis,
        pontuacao_viabilidade: analysis.viabilityScore,
        nivel_concorrencia: analysis.competitionLevel,
        custo_estimado: analysis.estimatedCost,
        riscos: analysis.risks,
        oportunidades: analysis.opportunities,
        recomendacoes: analysis.recommendations
      })
      .select()
      .single();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            licitacao: {
              id: licitacao.id,
              numero: licitacao.numero,
              objeto: licitacao.objeto,
              orgao: licitacao.orgao,
              valor_estimado: licitacao.valor_estimado
            },
            analysis,
            documentos_analisados: documentos?.length || 0,
            analysis_id: savedAnalysis?.id
          }, null, 2)
        }
      ]
    };
  }

  private async processDocument(args: any) {
    const { document_url, document_type, licitacao_id, extract_tables = true, extract_requirements = true } = args;

    try {
      // Processar documento
      const result = await documentProcessor.processDocument(document_url);

      // Salvar no banco
      const { data: savedDoc } = await supabaseAdmin
        .from(dbConfig.tables.documentos)
        .insert({
          licitacao_id: licitacao_id || null,
          nome: document_url.split('/').pop() || 'documento',
          tipo: document_type,
          tamanho: result.metadata.fileSize || 0,
          url: document_url,
          conteudo_extraido: result.content,
          metadados: {
            ...result.metadata,
            structured_data: result.structuredData,
            analysis: result.analysis
          },
          processado: true
        })
        .select()
        .single();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              document_id: savedDoc?.id,
              content_length: result.content.length,
              metadata: result.metadata,
              structured_data: extract_tables ? result.structuredData : null,
              requirements: extract_requirements ? result.analysis.keyTerms : null,
              processing_time: result.metadata.processingTime
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new Error(`Erro ao processar documento: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async generateProposalInsights(args: any) {
    const { licitacao_id, empresa_perfil, historico_propostas = [], concorrentes = [] } = args;

    // Buscar análise existente
    const { data: analysis } = await supabaseAdmin
      .from(dbConfig.tables.analises)
      .select('*')
      .eq('licitacao_id', licitacao_id)
      .eq('empresa_id', empresa_perfil?.cnpj || 'unknown')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const insights = {
      estrategia_preco: this.generatePricingStrategy(analysis?.resultado, historico_propostas),
      pontos_fortes: this.identifyStrengths(empresa_perfil, analysis?.resultado),
      diferenciais: this.suggestDifferentiators(analysis?.resultado, concorrentes),
      cronograma_sugerido: this.suggestTimeline(analysis?.resultado),
      documentos_necessarios: this.listRequiredDocuments(analysis?.resultado),
      riscos_mitigacao: this.suggestRiskMitigation(analysis?.resultado)
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(insights, null, 2)
        }
      ]
    };
  }

  private async monitorDeadlines(args: any) {
    const { empresa_id, dias_antecedencia = 7, tipos_prazo = ['entrega_proposta', 'sessao_publica'] } = args;

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dias_antecedencia);

    const { data: licitacoes } = await supabaseAdmin
      .from(dbConfig.tables.licitacoes)
      .select('*')
      .lte('data_abertura', dataLimite.toISOString())
      .eq('situacao', 'Aberta');

    const alertas = (licitacoes || []).map(licitacao => ({
      licitacao_id: licitacao.id,
      numero: licitacao.numero,
      objeto: licitacao.objeto,
      data_limite: licitacao.data_abertura,
      dias_restantes: Math.ceil(
        (new Date(licitacao.data_abertura).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
      urgencia: this.calculateUrgency(licitacao.data_abertura)
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            alertas,
            total: alertas.length,
            empresa_id,
            configuracao: { dias_antecedencia, tipos_prazo }
          }, null, 2)
        }
      ]
    };
  }

  private async generateMarketReport(args: any) {
    const { periodo, segmentos = [], regioes = [], tipo_relatorio = 'completo' } = args;

    // Implementar lógica de relatório de mercado
    const report = {
      periodo,
      estatisticas: await this.getMarketStatistics(periodo, segmentos, regioes),
      tendencias: await this.getMarketTrends(periodo, segmentos),
      oportunidades: await this.getMarketOpportunities(segmentos, regioes),
      competitividade: await this.getCompetitiveAnalysis(segmentos, regioes)
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(report, null, 2)
        }
      ]
    };
  }

  // Métodos auxiliares
  private generatePricingStrategy(analysis: any, historico: any[]) {
    // Implementar lógica de estratégia de preços
    return {
      preco_sugerido: analysis?.estimatedCost * 0.95,
      margem_competitiva: '5-10%',
      fatores_considerados: ['histórico', 'concorrência', 'complexidade']
    };
  }

  private identifyStrengths(empresa: any, analysis: any) {
    // Identificar pontos fortes da empresa para a licitação
    return [
      'Experiência no segmento',
      'Certificações relevantes',
      'Capacidade técnica'
    ];
  }

  private suggestDifferentiators(analysis: any, concorrentes: any[]) {
    // Sugerir diferenciais competitivos
    return [
      'Inovação tecnológica',
      'Sustentabilidade',
      'Prazo de entrega'
    ];
  }

  private suggestTimeline(analysis: any) {
    // Sugerir cronograma de execução
    return {
      preparacao_proposta: '5 dias',
      execucao_projeto: analysis?.timeline || '30 dias',
      entrega_final: '35 dias'
    };
  }

  private listRequiredDocuments(analysis: any) {
    // Listar documentos necessários
    return [
      'Certidões negativas',
      'Comprovação de experiência',
      'Atestados de capacidade técnica'
    ];
  }

  private suggestRiskMitigation(analysis: any) {
    // Sugerir mitigação de riscos
    return analysis?.risks?.map((risk: string) => ({
      risco: risk,
      mitigacao: `Estratégia para mitigar: ${risk}`
    })) || [];
  }

  private calculateUrgency(dataLimite: string): 'baixa' | 'media' | 'alta' | 'critica' {
    const dias = Math.ceil(
      (new Date(dataLimite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (dias <= 1) return 'critica';
    if (dias <= 3) return 'alta';
    if (dias <= 7) return 'media';
    return 'baixa';
  }

  private async getMarketStatistics(periodo: any, segmentos: string[], regioes: string[]) {
    // Implementar estatísticas de mercado
    return {
      total_licitacoes: 0,
      valor_total: 0,
      crescimento: '0%'
    };
  }

  private async getMarketTrends(periodo: any, segmentos: string[]) {
    // Implementar análise de tendências
    return [];
  }

  private async getMarketOpportunities(segmentos: string[], regioes: string[]) {
    // Implementar identificação de oportunidades
    return [];
  }

  private async getCompetitiveAnalysis(segmentos: string[], regioes: string[]) {
    // Implementar análise competitiva
    return {};
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SIBAL MCP Server running on stdio');
  }
}

// Inicializar e executar o servidor
const server = new SibalMcpServer();
server.run().catch(console.error);