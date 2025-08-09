/**
 * Exemplos de uso do MCP Unificado SIBAL
 * 
 * Este arquivo demonstra como usar as novas funcionalidades do MCP
 * para análise inteligente de licitações.
 */

import { useSupabaseMcp } from '@/hooks/useSupabaseMcp';

// Exemplo 1: Busca avançada de editais
export const ExemploBuscaEditais = () => {
  const { fetchNotices, loading, error } = useSupabaseMcp();

  const buscarEditais = async () => {
    try {
      // Busca básica
      const resultado1 = await fetchNotices({
        query: 'material de escritório',
        limit: 10
      });

      console.log('Editais encontrados:', resultado1.notices);
      console.log('Estatísticas:', resultado1.stats);

      // Busca com filtros avançados
      const resultado2 = await fetchNotices({
        query: 'construção civil',
        organ: 'Prefeitura Municipal',
        modality: 'Pregão Eletrônico',
        min_value: 50000,
        max_value: 500000,
        limit: 20
      });

      console.log('Editais filtrados:', resultado2.notices);
      
      // Analisar urgência dos editais
      resultado2.notices.forEach(notice => {
        const diasRestantes = Math.ceil(
          (new Date(notice.submission_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diasRestantes <= 3) {
          console.log(`🚨 URGENTE: ${notice.title} - ${diasRestantes} dias restantes`);
        } else if (diasRestantes <= 7) {
          console.log(`⚠️ ATENÇÃO: ${notice.title} - ${diasRestantes} dias restantes`);
        }
      });

    } catch (err) {
      console.error('Erro na busca:', err);
    }
  };

  return { buscarEditais, loading, error };
};

// Exemplo 2: Análise de risco com IA
export const ExemploAnaliseRisco = () => {
  const { classifyRisk, loading, error } = useSupabaseMcp();

  const analisarRisco = async (noticeId: string) => {
    try {
      const analise = await classifyRisk(noticeId);
      
      console.log('Análise de risco:', {
        nivel: analise.risk_level,
        pontuacao: analise.risk_score,
        fatores: analise.risk_factors,
        recomendacoes: analise.recommendations
      });

      // Tomar decisões baseadas no risco
      if (analise.risk_score >= 80) {
        console.log('🔴 ALTO RISCO - Não recomendado participar');
      } else if (analise.risk_score >= 60) {
        console.log('🟡 RISCO MÉDIO - Avaliar cuidadosamente');
      } else {
        console.log('🟢 BAIXO RISCO - Boa oportunidade');
      }

      return analise;
    } catch (err) {
      console.error('Erro na análise de risco:', err);
    }
  };

  return { analisarRisco, loading, error };
};

// Exemplo 3: Resumo inteligente de editais
export const ExemploResumoInteligente = () => {
  const { summarizeNotice, loading, error } = useSupabaseMcp();

  const gerarResumo = async (noticeId: string) => {
    try {
      const resumo = await summarizeNotice(noticeId);
      
      console.log('Resumo do edital:', {
        pontos_principais: resumo.key_points,
        requisitos: resumo.requirements,
        oportunidades: resumo.opportunities,
        alertas: resumo.alerts,
        cronograma: resumo.timeline
      });

      // Extrair informações específicas
      const prazoEntrega = resumo.timeline?.delivery_deadline;
      const valorEstimado = resumo.estimated_value;
      const requisitosObrigatorios = resumo.requirements?.mandatory;

      console.log('Informações extraídas:', {
        prazoEntrega,
        valorEstimado,
        requisitosObrigatorios
      });

      return resumo;
    } catch (err) {
      console.error('Erro no resumo:', err);
    }
  };

  return { gerarResumo, loading, error };
};

// Exemplo 4: Processamento de documentos
export const ExemploProcessamentoDocumento = () => {
  const { processDocument, loading, error } = useSupabaseMcp();

  const processarDocumento = async (
    noticeId: string, 
    documentUrl: string, 
    documentType: 'edital' | 'anexo' | 'ata' | 'resultado'
  ) => {
    try {
      const resultado = await processDocument(noticeId, documentUrl, documentType);
      
      console.log('Documento processado:', {
        status: resultado.processing_status,
        confianca: resultado.confidence_score,
        tempo_processamento: resultado.processing_time_ms,
        dados_extraidos: resultado.processing_result
      });

      // Analisar dados extraídos
      const dados = resultado.processing_result;
      
      if (dados.tables) {
        console.log('Tabelas encontradas:', dados.tables.length);
        dados.tables.forEach((table: any, index: number) => {
          console.log(`Tabela ${index + 1}:`, table.headers);
        });
      }

      if (dados.requirements) {
        console.log('Requisitos identificados:', dados.requirements);
      }

      if (dados.dates) {
        console.log('Datas importantes:', dados.dates);
      }

      return resultado;
    } catch (err) {
      console.error('Erro no processamento:', err);
    }
  };

  return { processarDocumento, loading, error };
};

// Exemplo 5: Insights para propostas
export const ExemploInsightsPropostas = () => {
  const { generateProposalInsights, loading, error } = useSupabaseMcp();

  const gerarInsights = async (noticeId: string) => {
    try {
      // Perfil da empresa (exemplo)
      const perfilEmpresa = {
        name: 'TechSolutions Ltda',
        sector: 'Tecnologia da Informação',
        size: 'média' as const,
        experience_years: 8,
        specialties: ['Desenvolvimento de Software', 'Infraestrutura TI', 'Consultoria'],
        certifications: ['ISO 9001', 'CMMI Nível 3'],
        previous_contracts: [
          { organ: 'Prefeitura Municipal', value: 150000, year: 2023 },
          { organ: 'Governo Estadual', value: 300000, year: 2022 }
        ]
      };

      const insights = await generateProposalInsights(noticeId, perfilEmpresa);
      
      console.log('Insights para proposta:', {
        probabilidade_sucesso: insights.win_probability_score,
        valor_recomendado: insights.recommended_bid_value,
        estrategias: insights.insights.strategies,
        pontos_fortes: insights.insights.strengths,
        riscos: insights.insights.risks,
        recomendacoes: insights.insights.recommendations
      });

      // Decisões baseadas nos insights
      if (insights.win_probability_score >= 70) {
        console.log('🎯 ALTA PROBABILIDADE - Investir na proposta');
      } else if (insights.win_probability_score >= 40) {
        console.log('🤔 PROBABILIDADE MÉDIA - Avaliar custos vs benefícios');
      } else {
        console.log('❌ BAIXA PROBABILIDADE - Considerar não participar');
      }

      return insights;
    } catch (err) {
      console.error('Erro nos insights:', err);
    }
  };

  return { gerarInsights, loading, error };
};

// Exemplo 6: Monitoramento de prazos
export const ExemploMonitoramentoPrazos = () => {
  const { monitorDeadlines, loading, error } = useSupabaseMcp();

  const monitorarPrazos = async (companyId: string) => {
    try {
      // Monitoramento para próximos 30 dias
      const resultado = await monitorDeadlines(companyId, 30);
      
      console.log('Monitoramento de prazos:', {
        total_prazos: resultado.total_deadlines,
        prazos_criticos: resultado.critical_deadlines,
        alertas: resultado.monitoring_result.alerts,
        recomendacoes: resultado.monitoring_result.recommendations,
        eventos_calendario: resultado.monitoring_result.calendar_events
      });

      // Processar alertas
      resultado.monitoring_result.alerts.forEach((alerta: any) => {
        const emoji = alerta.urgency === 'critical' ? '🚨' : 
                     alerta.urgency === 'high' ? '⚠️' : 'ℹ️';
        
        console.log(`${emoji} ${alerta.message}`);
        
        if (alerta.action_required) {
          console.log(`   Ação necessária: ${alerta.action_required}`);
        }
      });

      // Gerar eventos de calendário
      resultado.monitoring_result.calendar_events.forEach((evento: any) => {
        console.log(`📅 ${evento.title} - ${evento.date}`);
      });

      return resultado;
    } catch (err) {
      console.error('Erro no monitoramento:', err);
    }
  };

  return { monitorarPrazos, loading, error };
};

// Exemplo 7: Workflow completo de análise
export const ExemploWorkflowCompleto = () => {
  const { 
    fetchNotices, 
    classifyRisk, 
    summarizeNotice, 
    generateProposalInsights,
    loading, 
    error 
  } = useSupabaseMcp();

  const analisarOportunidades = async () => {
    try {
      console.log('🔍 Iniciando análise completa de oportunidades...');
      
      // 1. Buscar editais relevantes
      console.log('1. Buscando editais...');
      const { notices } = await fetchNotices({
        query: 'desenvolvimento software sistema',
        min_value: 100000,
        limit: 5
      });
      
      console.log(`Encontrados ${notices.length} editais relevantes`);
      
      // 2. Analisar cada edital
      for (const notice of notices) {
        console.log(`\n📋 Analisando: ${notice.title}`);
        
        // 2a. Classificar risco
        console.log('  🎯 Classificando risco...');
        const risco = await classifyRisk(notice.id);
        
        // 2b. Gerar resumo
        console.log('  📝 Gerando resumo...');
        const resumo = await summarizeNotice(notice.id);
        
        // 2c. Gerar insights
        console.log('  💡 Gerando insights...');
        const insights = await generateProposalInsights(notice.id);
        
        // 3. Compilar análise
        const analise = {
          edital: notice,
          risco: risco,
          resumo: resumo,
          insights: insights,
          recomendacao: insights.win_probability_score >= 60 ? 'PARTICIPAR' : 'AVALIAR'
        };
        
        console.log(`  ✅ Análise concluída - Recomendação: ${analise.recomendacao}`);
        console.log(`     Risco: ${risco.risk_level} (${risco.risk_score}%)`);
        console.log(`     Probabilidade: ${insights.win_probability_score}%`);
      }
      
      console.log('\n🎉 Análise completa finalizada!');
      
    } catch (err) {
      console.error('Erro no workflow:', err);
    }
  };

  return { analisarOportunidades, loading, error };
};

// Exemplo 8: Integração com componentes React
export const ExemploComponenteReact = () => {
  const mcp = useSupabaseMcp();
  
  // Hook personalizado para busca com cache
  const useBuscaEditais = (filtros: any) => {
    const [editais, setEditais] = React.useState([]);
    const [carregando, setCarregando] = React.useState(false);
    
    React.useEffect(() => {
      const buscar = async () => {
        setCarregando(true);
        try {
          const resultado = await mcp.fetchNotices(filtros);
          setEditais(resultado.notices);
        } catch (err) {
          console.error('Erro na busca:', err);
        } finally {
          setCarregando(false);
        }
      };
      
      buscar();
    }, [JSON.stringify(filtros)]);
    
    return { editais, carregando };
  };
  
  return { useBuscaEditais, mcp };
};

// Exportar todos os exemplos
export const ExemplosMCP = {
  ExemploBuscaEditais,
  ExemploAnaliseRisco,
  ExemploResumoInteligente,
  ExemploProcessamentoDocumento,
  ExemploInsightsPropostas,
  ExemploMonitoramentoPrazos,
  ExemploWorkflowCompleto,
  ExemploComponenteReact
};

export default ExemplosMCP;