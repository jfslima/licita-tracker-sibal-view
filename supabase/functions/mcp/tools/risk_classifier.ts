import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface RiskClassifierArgs {
  notice_id: string;
  company_profile?: string;
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

export async function riskClassifier(
  supabase: SupabaseClient,
  args: RiskClassifierArgs
): Promise<RiskAnalysis> {
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

${args.company_profile ? `Perfil da Empresa: ${args.company_profile}` : ''}

Classifique o risco considerando:
1. Complexidade técnica
2. Valor do contrato
3. Prazo disponível
4. Requisitos específicos
5. Histórico do órgão
6. Concorrência estimada
7. Capacidade da empresa (se fornecida)

Retorne uma análise estruturada em JSON com:
- risk_level (baixo/médio/alto/crítico)
- risk_score (0-100)
- risk_factors (array com categoria, fator, impacto, descrição)
- recommendations (array de recomendações)
- competitive_analysis (competitors estimados, dificuldade, probabilidade sucesso)
- financial_analysis (custo estimado, margem, ROI)
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
            content: 'Você é um especialista em licitações públicas e análise de risco. Retorne sempre respostas em JSON válido, estruturado e detalhado.'
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
      throw new Error(`Erro na API Groq: ${groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    const aiAnalysis = groqData.choices[0]?.message?.content;

    if (!aiAnalysis) {
      throw new Error('Resposta vazia da IA');
    }

    // Parse da resposta da IA
    let riskAnalysis: RiskAnalysis;
    try {
      // Extrair JSON da resposta (pode vir com texto adicional)
      const jsonMatch = aiAnalysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        riskAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON não encontrado na resposta');
      }
    } catch (parseError) {
      // Fallback: análise básica baseada em regras
      riskAnalysis = generateFallbackAnalysis(notice, args.company_profile);
    }

    // Validar e enriquecer análise
    riskAnalysis = validateAndEnrichAnalysis(riskAnalysis, notice);

    // Salvar análise no banco
    const { error: updateError } = await supabase
      .from('notices')
      .update({
        risk_level: riskAnalysis.risk_level,
        risk_score: riskAnalysis.risk_score,
        risk_analysis: riskAnalysis,
        updated_at: new Date().toISOString()
      })
      .eq('id', args.notice_id);

    if (updateError) {
      console.error('Erro ao salvar análise de risco:', updateError);
    }

    return riskAnalysis;

  } catch (error) {
    console.error('Erro em riskClassifier:', error);
    throw new Error(`Falha na classificação de risco: ${error.message}`);
  }
}

function generateFallbackAnalysis(notice: any, companyProfile?: string): RiskAnalysis {
  const daysUntilDeadline = Math.ceil(
    (new Date(notice.submission_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  let riskScore = 30; // Base score
  const riskFactors = [];

  // Análise de prazo
  if (daysUntilDeadline < 7) {
    riskScore += 25;
    riskFactors.push({
      category: 'Prazo',
      factor: 'Prazo muito curto',
      impact: 'alto' as const,
      description: `Apenas ${daysUntilDeadline} dias até o prazo`
    });
  }

  // Análise de valor
  if (notice.estimated_value > 1000000) {
    riskScore += 20;
    riskFactors.push({
      category: 'Financeiro',
      factor: 'Alto valor',
      impact: 'médio' as const,
      description: 'Licitação de alto valor requer maior preparação'
    });
  }

  // Análise de modalidade
  if (notice.modality === 'Concorrência') {
    riskScore += 15;
    riskFactors.push({
      category: 'Modalidade',
      factor: 'Concorrência pública',
      impact: 'médio' as const,
      description: 'Modalidade mais complexa e competitiva'
    });
  }

  let riskLevel: 'baixo' | 'médio' | 'alto' | 'crítico';
  if (riskScore < 40) riskLevel = 'baixo';
  else if (riskScore < 60) riskLevel = 'médio';
  else if (riskScore < 80) riskLevel = 'alto';
  else riskLevel = 'crítico';

  return {
    risk_level: riskLevel,
    risk_score: Math.min(riskScore, 100),
    risk_factors: riskFactors,
    recommendations: [
      'Revisar documentação cuidadosamente',
      'Verificar capacidade técnica',
      'Analisar concorrência',
      'Preparar proposta com antecedência'
    ],
    competitive_analysis: {
      estimated_competitors: Math.floor(Math.random() * 10) + 3,
      market_difficulty: 'moderado',
      success_probability: Math.max(20, 80 - riskScore)
    },
    financial_analysis: {
      estimated_cost: (notice.estimated_value || 0) * 0.8,
      profit_margin_estimate: 15,
      roi_projection: 12
    }
  };
}

function validateAndEnrichAnalysis(analysis: any, notice: any): RiskAnalysis {
  // Garantir que todos os campos obrigatórios existam
  return {
    risk_level: analysis.risk_level || 'médio',
    risk_score: Math.min(Math.max(analysis.risk_score || 50, 0), 100),
    risk_factors: analysis.risk_factors || [],
    recommendations: analysis.recommendations || [],
    competitive_analysis: {
      estimated_competitors: analysis.competitive_analysis?.estimated_competitors || 5,
      market_difficulty: analysis.competitive_analysis?.market_difficulty || 'moderado',
      success_probability: Math.min(Math.max(analysis.competitive_analysis?.success_probability || 50, 0), 100)
    },
    financial_analysis: {
      estimated_cost: analysis.financial_analysis?.estimated_cost || (notice.estimated_value || 0) * 0.8,
      profit_margin_estimate: analysis.financial_analysis?.profit_margin_estimate || 15,
      roi_projection: analysis.financial_analysis?.roi_projection || 12
    }
  };
}