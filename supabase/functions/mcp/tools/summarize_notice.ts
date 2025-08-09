import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SummarizeNoticeArgs {
  notice_id: string;
  focus_areas?: string[];
}

interface NoticeSummary {
  executive_summary: string;
  key_requirements: string[];
  technical_specifications: string[];
  deadlines: {
    type: string;
    date: string;
    description: string;
  }[];
  financial_info: {
    estimated_value: number;
    payment_terms: string;
    guarantee_required: boolean;
    guarantee_percentage?: number;
  };
  participation_requirements: {
    legal_requirements: string[];
    technical_requirements: string[];
    financial_requirements: string[];
    experience_requirements: string[];
  };
  evaluation_criteria: {
    technical_weight: number;
    price_weight: number;
    criteria_details: string[];
  };
  risks_and_opportunities: {
    opportunities: string[];
    risks: string[];
    recommendations: string[];
  };
  competitive_landscape: {
    estimated_participants: number;
    market_analysis: string;
    success_factors: string[];
  };
}

export async function summarizeNotice(
  supabase: SupabaseClient,
  args: SummarizeNoticeArgs
): Promise<NoticeSummary> {
  try {
    // Buscar dados do edital
    const { data: notice, error: noticeError } = await supabase
      .from('notices')
      .select('*')
      .eq('id', args.notice_id)
      .single();

    if (noticeError || !notice) {
      throw new Error(`Edital não encontrado: ${args.notice_id}`);
    }

    // Preparar prompt para resumo inteligente
    const focusAreasText = args.focus_areas?.length 
      ? `\nFoque especialmente em: ${args.focus_areas.join(', ')}` 
      : '';

    const summaryPrompt = `
Analise detalhadamente o seguinte edital de licitação e gere um resumo executivo completo:

Título: ${notice.title}
Descrição: ${notice.description}
Órgão: ${notice.organ}
Modalidade: ${notice.modality}
Valor Estimado: R$ ${notice.estimated_value?.toLocaleString('pt-BR') || 'Não informado'}
Data de Abertura: ${notice.opening_date}
Prazo de Entrega: ${notice.submission_deadline}
Status: ${notice.status}
URL: ${notice.url}
${focusAreasText}

Gere um resumo estruturado em JSON com:

1. executive_summary: Resumo executivo em 2-3 parágrafos
2. key_requirements: Array com principais requisitos
3. technical_specifications: Array com especificações técnicas
4. deadlines: Array com prazos importantes (type, date, description)
5. financial_info: Informações financeiras (estimated_value, payment_terms, guarantee_required, guarantee_percentage)
6. participation_requirements: Requisitos para participação (legal, technical, financial, experience)
7. evaluation_criteria: Critérios de avaliação (technical_weight, price_weight, criteria_details)
8. risks_and_opportunities: Riscos e oportunidades (opportunities, risks, recommendations)
9. competitive_landscape: Análise competitiva (estimated_participants, market_analysis, success_factors)

Seja detalhado e preciso na análise.
`;

    // Chamar API Groq para análise
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em licitações públicas com vasta experiência em análise de editais. Gere resumos detalhados e estruturados em JSON válido, focando em aspectos práticos para empresas interessadas em participar.'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Erro na API Groq: ${groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    const aiSummary = groqData.choices[0]?.message?.content;

    if (!aiSummary) {
      throw new Error('Resposta vazia da IA');
    }

    // Parse da resposta da IA
    let noticeSummary: NoticeSummary;
    try {
      // Extrair JSON da resposta
      const jsonMatch = aiSummary.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        noticeSummary = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      // Fallback: resumo básico
      noticeSummary = generateFallbackSummary(notice);
    }

    // Validar e enriquecer resumo
    noticeSummary = validateAndEnrichSummary(noticeSummary, notice);

    // Salvar resumo no banco
    const { error: updateError } = await supabase
      .from('notices')
      .update({
        summary: noticeSummary.executive_summary,
        detailed_summary: noticeSummary,
        updated_at: new Date().toISOString()
      })
      .eq('id', args.notice_id);

    if (updateError) {
      console.error('Erro ao salvar resumo:', updateError);
    }

    return noticeSummary;

  } catch (error) {
    console.error('Erro em summarizeNotice:', error);
    throw new Error(`Falha na geração de resumo: ${error.message}`);
  }
}

function generateFallbackSummary(notice: any): NoticeSummary {
  const daysUntilDeadline = Math.ceil(
    (new Date(notice.submission_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    executive_summary: `Licitação do ${notice.organ} na modalidade ${notice.modality} com valor estimado de R$ ${notice.estimated_value?.toLocaleString('pt-BR') || 'não informado'}. Prazo para entrega de propostas: ${notice.submission_deadline} (${daysUntilDeadline} dias restantes). ${notice.description}`,
    key_requirements: [
      'Documentação de habilitação completa',
      'Proposta técnica detalhada',
      'Proposta comercial',
      'Garantia de participação (se exigida)'
    ],
    technical_specifications: [
      'Especificações conforme edital',
      'Padrões de qualidade exigidos',
      'Normas técnicas aplicáveis'
    ],
    deadlines: [
      {
        type: 'Entrega de Propostas',
        date: notice.submission_deadline,
        description: 'Prazo final para entrega da documentação'
      },
      {
        type: 'Abertura',
        date: notice.opening_date,
        description: 'Data de abertura das propostas'
      }
    ],
    financial_info: {
      estimated_value: notice.estimated_value || 0,
      payment_terms: 'Conforme edital',
      guarantee_required: true,
      guarantee_percentage: 5
    },
    participation_requirements: {
      legal_requirements: [
        'CNPJ ativo',
        'Regularidade fiscal',
        'Certidões negativas'
      ],
      technical_requirements: [
        'Capacidade técnica comprovada',
        'Atestados de capacidade'
      ],
      financial_requirements: [
        'Balanço patrimonial',
        'Índices de liquidez'
      ],
      experience_requirements: [
        'Experiência no ramo',
        'Atestados de execução'
      ]
    },
    evaluation_criteria: {
      technical_weight: 70,
      price_weight: 30,
      criteria_details: [
        'Menor preço',
        'Melhor técnica',
        'Qualificação da equipe'
      ]
    },
    risks_and_opportunities: {
      opportunities: [
        'Contrato de longo prazo',
        'Possibilidade de renovação',
        'Referência para novos contratos'
      ],
      risks: [
        'Prazo apertado',
        'Alta concorrência',
        'Especificações complexas'
      ],
      recommendations: [
        'Analisar edital detalhadamente',
        'Preparar documentação com antecedência',
        'Verificar capacidade de execução'
      ]
    },
    competitive_landscape: {
      estimated_participants: 8,
      market_analysis: 'Mercado competitivo com empresas estabelecidas',
      success_factors: [
        'Preço competitivo',
        'Experiência comprovada',
        'Qualidade técnica'
      ]
    }
  };
}

function validateAndEnrichSummary(summary: any, notice: any): NoticeSummary {
  // Garantir que todos os campos obrigatórios existam
  return {
    executive_summary: summary.executive_summary || `Resumo do edital ${notice.title}`,
    key_requirements: summary.key_requirements || [],
    technical_specifications: summary.technical_specifications || [],
    deadlines: summary.deadlines || [],
    financial_info: {
      estimated_value: summary.financial_info?.estimated_value || notice.estimated_value || 0,
      payment_terms: summary.financial_info?.payment_terms || 'Conforme edital',
      guarantee_required: summary.financial_info?.guarantee_required ?? true,
      guarantee_percentage: summary.financial_info?.guarantee_percentage || 5
    },
    participation_requirements: {
      legal_requirements: summary.participation_requirements?.legal_requirements || [],
      technical_requirements: summary.participation_requirements?.technical_requirements || [],
      financial_requirements: summary.participation_requirements?.financial_requirements || [],
      experience_requirements: summary.participation_requirements?.experience_requirements || []
    },
    evaluation_criteria: {
      technical_weight: summary.evaluation_criteria?.technical_weight || 70,
      price_weight: summary.evaluation_criteria?.price_weight || 30,
      criteria_details: summary.evaluation_criteria?.criteria_details || []
    },
    risks_and_opportunities: {
      opportunities: summary.risks_and_opportunities?.opportunities || [],
      risks: summary.risks_and_opportunities?.risks || [],
      recommendations: summary.risks_and_opportunities?.recommendations || []
    },
    competitive_landscape: {
      estimated_participants: summary.competitive_landscape?.estimated_participants || 5,
      market_analysis: summary.competitive_landscape?.market_analysis || 'Análise não disponível',
      success_factors: summary.competitive_landscape?.success_factors || []
    }
  };
}