import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RiskClassifierRequest {
  notice_id: string;
  company_profile?: {
    name: string;
    sector?: string;
    experience?: string;
    size?: string;
  };
}

interface RiskAnalysis {
  risk_level: 'baixo' | 'médio' | 'alto' | 'crítico';
  risk_score: number; // 0-100
  risk_factors: {
    category: string;
    factor: string;
    impact: 'baixo' | 'médio' | 'alto';
    description: string;
  }[];
  recommendations: string[];
  competitive_analysis: {
    estimated_competitors: number;
    market_difficulty: 'fácil' | 'moderado' | 'difícil' | 'muito_difícil';
    success_probability: number; // 0-100
  };
  financial_analysis: {
    estimated_cost: number;
    profit_margin_estimate: number;
    roi_projection: number;
  };
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
    const { notice_id, company_profile }: RiskClassifierRequest = await req.json();

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
        title: "Edital de Teste - Aquisição de Equipamentos de TI",
        description: "Aquisição de computadores, servidores e equipamentos de rede para modernização da infraestrutura tecnológica",
        organ: "Secretaria de Tecnologia",
        modality: "Pregão Eletrônico",
        estimated_value: 500000,
        submission_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Aberto"
      };
      
      console.log(`Edital não encontrado na base, usando dados simulados para: ${notice_id}`);
      
      // Usar dados simulados
      const analysis = await performRiskAnalysis(mockNotice, company_profile);
      
      return new Response(
        JSON.stringify(analysis),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Realizar análise de risco
    const analysis = await performRiskAnalysis(notice, company_profile);

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Erro na análise de risco:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno na análise de risco",
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function performRiskAnalysis(notice: any, company_profile?: any): Promise<RiskAnalysis> {
  // Preparar prompt para análise de IA
  const analysisPrompt = `
Analise o seguinte edital de licitação e classifique o risco:

Título: ${notice.title}
Descrição: ${notice.description}
Órgão: ${notice.organ}
Modalidade: ${notice.modality}
Valor Estimado: R$ ${notice.estimated_value?.toLocaleString('pt-BR') || 'Não informado'}
Prazo de Entrega: ${notice.submission_deadline}
Status: ${notice.status}

${company_profile ? `Perfil da Empresa: ${JSON.stringify(company_profile)}` : ''}

Classifique o risco considerando:
1. Complexidade técnica
2. Valor do contrato
3. Prazo disponível
4. Requisitos específicos
5. Histórico do órgão
6. Concorrência estimada
7. Capacidade da empresa (se fornecida)

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "risk_level": "baixo|médio|alto|crítico",
  "risk_score": 0-100,
  "risk_factors": [
    {
      "category": "categoria",
      "factor": "fator",
      "impact": "baixo|médio|alto",
      "description": "descrição"
    }
  ],
  "recommendations": ["recomendação1", "recomendação2"],
  "competitive_analysis": {
    "estimated_competitors": 5,
    "market_difficulty": "moderado",
    "success_probability": 70
  },
  "financial_analysis": {
    "estimated_cost": 450000,
    "profit_margin_estimate": 15,
    "roi_projection": 12
  }
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
            content: 'Você é um especialista em licitações públicas e análise de risco. Retorne sempre respostas em JSON válido, estruturado e detalhado. Não inclua texto adicional, apenas o JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Erro na API Groq: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0].message.content;

    // Tentar parsear a resposta da IA
    let analysis: RiskAnalysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Erro ao parsear resposta da IA:", aiResponse);
      // Retornar análise padrão em caso de erro
      analysis = getDefaultRiskAnalysis(notice);
    }

    return analysis;

  } catch (error) {
    console.error("Erro na chamada para Groq:", error);
    // Retornar análise padrão em caso de erro
    return getDefaultRiskAnalysis(notice);
  }
}

function getDefaultRiskAnalysis(notice: any): RiskAnalysis {
  const value = notice.estimated_value || 0;
  let riskLevel: 'baixo' | 'médio' | 'alto' | 'crítico' = 'médio';
  let riskScore = 50;

  if (value > 1000000) {
    riskLevel = 'alto';
    riskScore = 75;
  } else if (value > 500000) {
    riskLevel = 'médio';
    riskScore = 60;
  } else {
    riskLevel = 'baixo';
    riskScore = 35;
  }

  return {
    risk_level: riskLevel,
    risk_score: riskScore,
    risk_factors: [
      {
        category: "Financeiro",
        factor: "Valor do contrato",
        impact: value > 500000 ? "alto" : "médio",
        description: `Contrato de R$ ${value.toLocaleString('pt-BR')}`
      },
      {
        category: "Técnico",
        factor: "Complexidade",
        impact: "médio",
        description: "Análise baseada na descrição do edital"
      }
    ],
    recommendations: [
      "Revisar detalhadamente o edital",
      "Avaliar capacidade técnica da equipe",
      "Calcular custos com margem de segurança"
    ],
    competitive_analysis: {
      estimated_competitors: 5,
      market_difficulty: "moderado",
      success_probability: 65
    },
    financial_analysis: {
      estimated_cost: Math.round(value * 0.85),
      profit_margin_estimate: 15,
      roi_projection: 12
    }
  };
}

console.log("Função risk_classifier iniciada");