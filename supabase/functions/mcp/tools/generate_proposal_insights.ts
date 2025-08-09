import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface GenerateProposalInsightsArgs {
  notice_id: string;
  company_profile?: {
    name: string;
    cnpj: string;
    sector: string;
    size: 'micro' | 'pequena' | 'media' | 'grande';
    experience_years: number;
    specialties: string[];
    certifications: string[];
    annual_revenue?: number;
    employee_count?: number;
  };
  historical_proposals?: {
    notice_id: string;
    result: 'won' | 'lost' | 'disqualified';
    bid_value: number;
    winning_value?: number;
    lessons_learned?: string;
  }[];
  competitors?: {
    name: string;
    market_share?: number;
    typical_pricing?: string;
    strengths: string[];
    weaknesses: string[];
  }[];
}

interface ProposalInsights {
  executive_summary: string;
  win_probability: {
    score: number; // 0-100
    factors: {
      factor: string;
      impact: 'positive' | 'negative' | 'neutral';
      weight: number;
      description: string;
    }[];
    confidence_level: 'baixa' | 'média' | 'alta';
  };
  pricing_strategy: {
    recommended_approach: 'aggressive' | 'competitive' | 'premium' | 'cost_plus';
    price_range: {
      minimum: number;
      optimal: number;
      maximum: number;
    };
    pricing_factors: string[];
    competitor_analysis: {
      estimated_competitor_range: { min: number; max: number };
      market_positioning: string;
    };
  };
  technical_strategy: {
    key_differentiators: string[];
    technical_approach: string;
    innovation_opportunities: string[];
    risk_mitigation: string[];
    team_requirements: {
      role: string;
      experience_required: string;
      quantity: number;
    }[];
  };
  compliance_checklist: {
    category: string;
    requirements: {
      item: string;
      status: 'compliant' | 'needs_attention' | 'non_compliant' | 'unknown';
      action_required?: string;
      deadline?: string;
    }[];
  }[];
  timeline_strategy: {
    preparation_phases: {
      phase: string;
      duration_days: number;
      key_activities: string[];
      dependencies: string[];
      critical_path: boolean;
    }[];
    milestones: {
      milestone: string;
      date: string;
      importance: 'critical' | 'high' | 'medium' | 'low';
    }[];
  };
  resource_requirements: {
    human_resources: {
      department: string;
      hours_required: number;
      skill_level: string;
      cost_estimate: number;
    }[];
    financial_investment: {
      category: string;
      amount: number;
      justification: string;
    }[];
    external_resources: {
      type: string;
      provider?: string;
      cost: number;
      necessity: 'essential' | 'recommended' | 'optional';
    }[];
  };
  risk_analysis: {
    risks: {
      category: string;
      risk: string;
      probability: 'baixa' | 'média' | 'alta';
      impact: 'baixo' | 'médio' | 'alto';
      mitigation_strategy: string;
    }[];
    contingency_plans: string[];
  };
  recommendations: {
    priority: 'alta' | 'média' | 'baixa';
    recommendation: string;
    rationale: string;
    expected_impact: string;
  }[];
}

export async function generateProposalInsights(
  supabase: SupabaseClient,
  args: GenerateProposalInsightsArgs
): Promise<ProposalInsights> {
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

    // Buscar análise de risco existente
    const riskAnalysis = notice.risk_analysis;
    const noticeSummary = notice.detailed_summary;

    // Preparar contexto para IA
    const contextData = {
      notice: {
        title: notice.title,
        description: notice.description,
        organ: notice.organ,
        modality: notice.modality,
        estimated_value: notice.estimated_value,
        submission_deadline: notice.submission_deadline,
        opening_date: notice.opening_date
      },
      company_profile: args.company_profile,
      historical_proposals: args.historical_proposals || [],
      competitors: args.competitors || [],
      risk_analysis: riskAnalysis,
      notice_summary: noticeSummary
    };

    // Gerar insights usando IA
    const aiInsights = await generateAIInsights(contextData);
    
    // Enriquecer com análises específicas
    const enrichedInsights = await enrichInsights(aiInsights, contextData, supabase);

    // Salvar insights no banco
    await saveProposalInsights(supabase, args.notice_id, enrichedInsights);

    return enrichedInsights;

  } catch (error) {
    console.error('Erro em generateProposalInsights:', error);
    throw new Error(`Falha na geração de insights: ${error.message}`);
  }
}

async function generateAIInsights(contextData: any): Promise<any> {
  const prompt = `
Analise a seguinte licitação e gere insights estratégicos para elaboração de proposta:

**EDITAL:**
${JSON.stringify(contextData.notice, null, 2)}

**PERFIL DA EMPRESA:**
${JSON.stringify(contextData.company_profile, null, 2)}

**HISTÓRICO DE PROPOSTAS:**
${JSON.stringify(contextData.historical_proposals, null, 2)}

**CONCORRENTES:**
${JSON.stringify(contextData.competitors, null, 2)}

**ANÁLISE DE RISCO:**
${JSON.stringify(contextData.risk_analysis, null, 2)}

Gere insights estruturados em JSON com:

1. executive_summary: Resumo executivo da oportunidade
2. win_probability: Análise de probabilidade de vitória (score 0-100, factors, confidence_level)
3. pricing_strategy: Estratégia de precificação (approach, price_range, factors, competitor_analysis)
4. technical_strategy: Estratégia técnica (differentiators, approach, innovations, risks, team_requirements)
5. compliance_checklist: Lista de conformidade (categories com requirements e status)
6. timeline_strategy: Estratégia de cronograma (preparation_phases, milestones)
7. resource_requirements: Requisitos de recursos (human, financial, external)
8. risk_analysis: Análise de riscos (risks com probability/impact, contingency_plans)
9. recommendations: Recomendações prioritizadas

Seja específico, prático e baseado nos dados fornecidos.
`;

  try {
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
            content: 'Você é um consultor especialista em licitações públicas com vasta experiência em estratégia de propostas. Gere insights detalhados e práticos em JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Erro na API Groq: ${groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Resposta vazia da IA');
    }

    // Extrair JSON da resposta
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('JSON não encontrado na resposta da IA');
    }

  } catch (error) {
    console.error('Erro na geração de insights por IA:', error);
    // Retornar insights básicos como fallback
    return generateFallbackInsights(contextData);
  }
}

function generateFallbackInsights(contextData: any): any {
  const notice = contextData.notice;
  const company = contextData.company_profile;
  
  const daysUntilDeadline = Math.ceil(
    (new Date(notice.submission_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    executive_summary: `Oportunidade de licitação no valor de R$ ${notice.estimated_value?.toLocaleString('pt-BR')} com ${daysUntilDeadline} dias para preparação. ${company ? `Empresa ${company.name} possui ${company.experience_years} anos de experiência no setor.` : 'Análise baseada apenas nos dados do edital.'}`,
    win_probability: {
      score: 65,
      factors: [
        {
          factor: 'Experiência da empresa',
          impact: 'positive',
          weight: 25,
          description: 'Experiência relevante no setor'
        },
        {
          factor: 'Prazo disponível',
          impact: daysUntilDeadline > 15 ? 'positive' : 'negative',
          weight: 20,
          description: `${daysUntilDeadline} dias para preparação`
        }
      ],
      confidence_level: 'média'
    },
    pricing_strategy: {
      recommended_approach: 'competitive',
      price_range: {
        minimum: (notice.estimated_value || 0) * 0.85,
        optimal: (notice.estimated_value || 0) * 0.92,
        maximum: notice.estimated_value || 0
      },
      pricing_factors: [
        'Valor estimado do edital',
        'Margem de lucro desejada',
        'Custos operacionais',
        'Concorrência esperada'
      ],
      competitor_analysis: {
        estimated_competitor_range: {
          min: (notice.estimated_value || 0) * 0.80,
          max: (notice.estimated_value || 0) * 0.95
        },
        market_positioning: 'Posicionamento competitivo recomendado'
      }
    },
    technical_strategy: {
      key_differentiators: [
        'Qualidade técnica superior',
        'Experiência comprovada',
        'Equipe qualificada'
      ],
      technical_approach: 'Abordagem técnica baseada nas especificações do edital',
      innovation_opportunities: [
        'Soluções inovadoras dentro do escopo',
        'Melhorias de processo'
      ],
      risk_mitigation: [
        'Planejamento detalhado',
        'Equipe experiente',
        'Controle de qualidade'
      ],
      team_requirements: [
        {
          role: 'Gerente de Projeto',
          experience_required: '5+ anos',
          quantity: 1
        },
        {
          role: 'Especialista Técnico',
          experience_required: '3+ anos',
          quantity: 2
        }
      ]
    },
    compliance_checklist: [
      {
        category: 'Documentação Legal',
        requirements: [
          {
            item: 'CNPJ atualizado',
            status: 'unknown',
            action_required: 'Verificar validade'
          },
          {
            item: 'Certidões negativas',
            status: 'unknown',
            action_required: 'Obter certidões atualizadas'
          }
        ]
      }
    ],
    timeline_strategy: {
      preparation_phases: [
        {
          phase: 'Análise do Edital',
          duration_days: Math.max(2, Math.floor(daysUntilDeadline * 0.2)),
          key_activities: ['Leitura detalhada', 'Identificação de requisitos'],
          dependencies: [],
          critical_path: true
        },
        {
          phase: 'Preparação da Proposta',
          duration_days: Math.max(5, Math.floor(daysUntilDeadline * 0.6)),
          key_activities: ['Elaboração técnica', 'Precificação', 'Documentação'],
          dependencies: ['Análise do Edital'],
          critical_path: true
        }
      ],
      milestones: [
        {
          milestone: 'Entrega da Proposta',
          date: notice.submission_deadline,
          importance: 'critical'
        }
      ]
    },
    resource_requirements: {
      human_resources: [
        {
          department: 'Comercial',
          hours_required: 40,
          skill_level: 'Senior',
          cost_estimate: 8000
        },
        {
          department: 'Técnico',
          hours_required: 60,
          skill_level: 'Pleno',
          cost_estimate: 9000
        }
      ],
      financial_investment: [
        {
          category: 'Preparação da Proposta',
          amount: 15000,
          justification: 'Custos de elaboração e documentação'
        }
      ],
      external_resources: [
        {
          type: 'Consultoria Jurídica',
          cost: 5000,
          necessity: 'recommended'
        }
      ]
    },
    risk_analysis: {
      risks: [
        {
          category: 'Prazo',
          risk: 'Prazo insuficiente para preparação',
          probability: daysUntilDeadline < 10 ? 'alta' : 'baixa',
          impact: 'alto',
          mitigation_strategy: 'Mobilizar equipe dedicada'
        },
        {
          category: 'Concorrência',
          risk: 'Alta concorrência',
          probability: 'média',
          impact: 'médio',
          mitigation_strategy: 'Diferenciação técnica e preço competitivo'
        }
      ],
      contingency_plans: [
        'Plano B para recursos adicionais',
        'Estratégia alternativa de precificação'
      ]
    },
    recommendations: [
      {
        priority: 'alta',
        recommendation: 'Iniciar análise detalhada do edital imediatamente',
        rationale: 'Tempo limitado para preparação',
        expected_impact: 'Melhor qualidade da proposta'
      },
      {
        priority: 'média',
        recommendation: 'Formar equipe multidisciplinar',
        rationale: 'Complexidade do projeto',
        expected_impact: 'Cobertura completa dos requisitos'
      }
    ]
  };
}

async function enrichInsights(insights: any, contextData: any, supabase: SupabaseClient): Promise<ProposalInsights> {
  // Enriquecer com dados históricos e benchmarks
  try {
    // Buscar dados históricos similares
    const { data: similarNotices } = await supabase
      .from('notices')
      .select('*')
      .eq('organ', contextData.notice.organ)
      .neq('id', contextData.notice.id)
      .limit(5);

    if (similarNotices && similarNotices.length > 0) {
      // Ajustar probabilidade baseada no histórico
      const avgValue = similarNotices.reduce((sum, n) => sum + (n.estimated_value || 0), 0) / similarNotices.length;
      const currentValue = contextData.notice.estimated_value || 0;
      
      if (currentValue > avgValue * 1.5) {
        insights.win_probability.score = Math.max(insights.win_probability.score - 10, 0);
        insights.win_probability.factors.push({
          factor: 'Valor acima da média histórica',
          impact: 'negative',
          weight: 15,
          description: 'Licitação com valor significativamente acima da média do órgão'
        });
      }
    }
  } catch (error) {
    console.error('Erro ao enriquecer insights:', error);
  }

  return insights;
}

async function saveProposalInsights(
  supabase: SupabaseClient,
  noticeId: string,
  insights: ProposalInsights
): Promise<void> {
  try {
    const { error } = await supabase
      .from('proposal_insights')
      .upsert({
        notice_id: noticeId,
        insights: insights,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao salvar insights:', error);
    }
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
  }
}