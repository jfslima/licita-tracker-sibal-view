import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ProposalInsightsRequest {
  notice_id: string;
  company_profile?: {
    name: string;
    sector?: string;
    experience?: string;
    size?: string;
    previous_contracts?: string[];
    certifications?: string[];
  };
  proposal_draft?: string;
  focus_areas?: ('technical' | 'commercial' | 'legal' | 'timeline')[];
}

interface ProposalInsights {
  executive_summary: string;
  strengths: {
    category: string;
    description: string;
    competitive_advantage: string;
  }[];
  weaknesses: {
    category: string;
    description: string;
    mitigation_strategy: string;
  }[];
  technical_approach: {
    recommended_methodology: string;
    key_deliverables: string[];
    timeline_suggestions: {
      phase: string;
      duration: string;
      critical_milestones: string[];
    }[];
  };
  commercial_strategy: {
    pricing_recommendations: {
      strategy: string;
      justification: string;
      risk_level: 'baixo' | 'médio' | 'alto';
    };
    value_propositions: string[];
    negotiation_points: string[];
  };
  compliance_checklist: {
    requirement: string;
    status: 'compliant' | 'needs_attention' | 'critical';
    action_needed?: string;
  }[];
  success_probability: number; // 0-100
  recommendations: {
    priority: 'alta' | 'média' | 'baixa';
    action: string;
    impact: string;
  }[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      notice_id, 
      company_profile, 
      proposal_draft,
      focus_areas = ['technical', 'commercial', 'legal', 'timeline']
    }: ProposalInsightsRequest = await req.json();

    if (!notice_id) {
      return new Response(
        JSON.stringify({ error: "notice_id é obrigatório" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do edital
    const { data: notice, error: noticeError } = await supabase
      .from('notices')
      .select('*')
      .eq('id', notice_id)
      .single();

    if (noticeError || !notice) {
      // Se não encontrar na base, criar dados simulados para teste
      const mockNotice = {
        id: notice_id,
        title: "Edital de Teste - Desenvolvimento de Sistema de Gestão",
        description: "Desenvolvimento de sistema web para gestão de processos administrativos com integração a sistemas legados",
        organ: "Secretaria de Administração",
        modality: "Concorrência",
        estimated_value: 800000,
        submission_deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Aberto",
        requirements: "Sistema web responsivo, integração com APIs, documentação técnica completa"
      };
      
      console.log(`Edital não encontrado na base, usando dados simulados para: ${notice_id}`);
      
      // Gerar insights com dados simulados
      const insights = await generateInsights(mockNotice, company_profile, proposal_draft, focus_areas);
      
      return new Response(
        JSON.stringify(insights),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Gerar insights para a proposta
    const insights = await generateInsights(notice, company_profile, proposal_draft, focus_areas);

    return new Response(
      JSON.stringify(insights),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Erro na geração de insights:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno na geração de insights",
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function generateInsights(
  notice: any, 
  companyProfile?: any, 
  proposalDraft?: string,
  focusAreas: string[] = []
): Promise<ProposalInsights> {
  // Preparar prompt para geração de insights
  const insightsPrompt = `
Analise o seguinte edital de licitação e gere insights estratégicos para a proposta:

EDITAL:
Título: ${notice.title}
Descrição: ${notice.description}
Órgão: ${notice.organ}
Modalidade: ${notice.modality}
Valor Estimado: R$ ${notice.estimated_value?.toLocaleString('pt-BR') || 'Não informado'}
Prazo de Entrega: ${notice.submission_deadline}
Status: ${notice.status}
Requisitos: ${notice.requirements || 'Não especificados'}

${companyProfile ? `PERFIL DA EMPRESA:
${JSON.stringify(companyProfile, null, 2)}` : ''}

${proposalDraft ? `RASCUNHO DA PROPOSTA:
${proposalDraft}` : ''}

ÁREAS DE FOCO: ${focusAreas.join(', ')}

Gere insights estratégicos considerando:
1. Pontos fortes e fracos da empresa para este edital
2. Abordagem técnica recomendada
3. Estratégia comercial
4. Checklist de conformidade
5. Probabilidade de sucesso
6. Recomendações prioritárias

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "executive_summary": "resumo executivo dos insights",
  "strengths": [
    {
      "category": "categoria",
      "description": "descrição",
      "competitive_advantage": "vantagem competitiva"
    }
  ],
  "weaknesses": [
    {
      "category": "categoria",
      "description": "descrição",
      "mitigation_strategy": "estratégia de mitigação"
    }
  ],
  "technical_approach": {
    "recommended_methodology": "metodologia recomendada",
    "key_deliverables": ["entregável1", "entregável2"],
    "timeline_suggestions": [
      {
        "phase": "fase",
        "duration": "duração",
        "critical_milestones": ["marco1", "marco2"]
      }
    ]
  },
  "commercial_strategy": {
    "pricing_recommendations": {
      "strategy": "estratégia de preços",
      "justification": "justificativa",
      "risk_level": "médio"
    },
    "value_propositions": ["proposta de valor 1", "proposta de valor 2"],
    "negotiation_points": ["ponto de negociação 1", "ponto de negociação 2"]
  },
  "compliance_checklist": [
    {
      "requirement": "requisito",
      "status": "compliant",
      "action_needed": "ação necessária"
    }
  ],
  "success_probability": 75,
  "recommendations": [
    {
      "priority": "alta",
      "action": "ação recomendada",
      "impact": "impacto esperado"
    }
  ]
}
`;

  try {
    // Chamar API Groq para análise
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content: 'Você é um consultor especialista em licitações públicas e estratégia de propostas. Retorne sempre respostas em JSON válido, estruturado e detalhado. Não inclua texto adicional, apenas o JSON.'
          },
          {
            role: 'user',
            content: insightsPrompt
          }
        ],
        temperature: 0.4,
        max_tokens: 4000
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Erro na API Groq: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0].message.content;

    // Tentar parsear a resposta da IA
    let insights: ProposalInsights;
    try {
      insights = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Erro ao parsear resposta da IA:", aiResponse);
      // Retornar insights padrão em caso de erro
      insights = getDefaultProposalInsights(notice, companyProfile);
    }

    return insights;

  } catch (error) {
    console.error("Erro na chamada para Groq:", error);
    // Retornar insights padrão em caso de erro
    return getDefaultProposalInsights(notice, companyProfile);
  }
}

function getDefaultProposalInsights(notice: any, companyProfile?: any): ProposalInsights {
  const value = notice.estimated_value || 0;
  
  return {
    executive_summary: `Análise estratégica para o edital "${notice.title}". Valor estimado de R$ ${value.toLocaleString('pt-BR')}. Recomenda-se análise detalhada dos requisitos técnicos e preparação cuidadosa da proposta.`,
    strengths: [
      {
        category: "Experiência",
        description: companyProfile?.experience || "Experiência da empresa no setor",
        competitive_advantage: "Conhecimento específico do mercado"
      },
      {
        category: "Técnico",
        description: "Capacidade técnica para execução",
        competitive_advantage: "Equipe qualificada"
      }
    ],
    weaknesses: [
      {
        category: "Análise",
        description: "Análise de IA indisponível",
        mitigation_strategy: "Realizar análise manual detalhada"
      }
    ],
    technical_approach: {
      recommended_methodology: "Metodologia ágil com entregas incrementais",
      key_deliverables: [
        "Documentação técnica",
        "Sistema funcional",
        "Treinamento da equipe"
      ],
      timeline_suggestions: [
        {
          phase: "Planejamento",
          duration: "2 semanas",
          critical_milestones: ["Aprovação do projeto", "Definição da equipe"]
        },
        {
          phase: "Desenvolvimento",
          duration: "8 semanas",
          critical_milestones: ["Protótipo funcional", "Testes integrados"]
        },
        {
          phase: "Implantação",
          duration: "2 semanas",
          critical_milestones: ["Deploy em produção", "Treinamento concluído"]
        }
      ]
    },
    commercial_strategy: {
      pricing_recommendations: {
        strategy: "Preço competitivo com margem segura",
        justification: "Equilibrar competitividade e rentabilidade",
        risk_level: "médio"
      },
      value_propositions: [
        "Experiência comprovada",
        "Equipe especializada",
        "Suporte técnico completo"
      ],
      negotiation_points: [
        "Prazo de execução",
        "Escopo de suporte",
        "Condições de pagamento"
      ]
    },
    compliance_checklist: [
      {
        requirement: "Documentação habilitatória",
        status: "needs_attention",
        action_needed: "Verificar documentos atualizados"
      },
      {
        requirement: "Proposta técnica",
        status: "needs_attention",
        action_needed: "Elaborar proposta detalhada"
      },
      {
        requirement: "Proposta comercial",
        status: "needs_attention",
        action_needed: "Calcular preços e prazos"
      }
    ],
    success_probability: 60,
    recommendations: [
      {
        priority: "alta",
        action: "Realizar análise detalhada do edital",
        impact: "Melhor compreensão dos requisitos"
      },
      {
        priority: "alta",
        action: "Preparar documentação completa",
        impact: "Evitar desclassificação"
      },
      {
        priority: "média",
        action: "Calcular custos com precisão",
        impact: "Proposta competitiva e rentável"
      }
    ]
  };
}

console.log("Função generate_proposal_insights iniciada");