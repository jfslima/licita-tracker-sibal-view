import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ProcessDocumentRequest {
  document_url?: string;
  document_content?: string;
  document_type: 'edital' | 'anexo' | 'termo_referencia' | 'minuta_contrato' | 'outro';
  analysis_type?: 'summary' | 'requirements' | 'deadlines' | 'full';
}

interface DocumentAnalysis {
  summary: string;
  key_requirements: string[];
  important_deadlines: {
    description: string;
    date: string;
    days_remaining: number;
  }[];
  technical_specifications: string[];
  legal_requirements: string[];
  financial_info: {
    estimated_value?: number;
    payment_terms?: string;
    guarantees_required?: string[];
  };
  risks_identified: string[];
  recommendations: string[];
  confidence_score: number; // 0-100
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
      document_url, 
      document_content, 
      document_type, 
      analysis_type = 'full' 
    }: ProcessDocumentRequest = await req.json();

    if (!document_url && !document_content) {
      return new Response(
        JSON.stringify({ error: "document_url ou document_content é obrigatório" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!document_type) {
      return new Response(
        JSON.stringify({ error: "document_type é obrigatório" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Processar documento
    let content = document_content;
    
    // Se foi fornecida uma URL, tentar baixar o conteúdo
    if (document_url && !document_content) {
      try {
        const response = await fetch(document_url);
        if (response.ok) {
          content = await response.text();
        } else {
          throw new Error(`Erro ao baixar documento: ${response.status}`);
        }
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            error: "Erro ao baixar documento da URL fornecida",
            details: error.message 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Não foi possível obter o conteúdo do documento" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Realizar análise do documento
    const analysis = await analyzeDocument(content, document_type, analysis_type);

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Erro no processamento do documento:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno no processamento do documento",
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

async function analyzeDocument(
  content: string, 
  documentType: string, 
  analysisType: string
): Promise<DocumentAnalysis> {
  // Preparar prompt específico para o tipo de documento
  const analysisPrompt = `
Analise o seguinte documento de licitação:

Tipo do Documento: ${documentType}
Tipo de Análise: ${analysisType}

Conteúdo do Documento:
${content.substring(0, 8000)} ${content.length > 8000 ? '...' : ''}

Realizar análise completa e extrair:
1. Resumo executivo
2. Requisitos principais
3. Prazos importantes
4. Especificações técnicas
5. Requisitos legais
6. Informações financeiras
7. Riscos identificados
8. Recomendações

Retorne APENAS um JSON válido com a seguinte estrutura:
{
  "summary": "resumo executivo do documento",
  "key_requirements": ["requisito1", "requisito2"],
  "important_deadlines": [
    {
      "description": "descrição do prazo",
      "date": "YYYY-MM-DD",
      "days_remaining": 30
    }
  ],
  "technical_specifications": ["especificação1", "especificação2"],
  "legal_requirements": ["requisito legal 1", "requisito legal 2"],
  "financial_info": {
    "estimated_value": 500000,
    "payment_terms": "termos de pagamento",
    "guarantees_required": ["garantia1", "garantia2"]
  },
  "risks_identified": ["risco1", "risco2"],
  "recommendations": ["recomendação1", "recomendação2"],
  "confidence_score": 85
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
            content: 'Você é um especialista em análise de documentos de licitação pública. Retorne sempre respostas em JSON válido, estruturado e detalhado. Não inclua texto adicional, apenas o JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Erro na API Groq: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0].message.content;

    // Tentar parsear a resposta da IA
    let analysis: DocumentAnalysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Erro ao parsear resposta da IA:", aiResponse);
      // Retornar análise padrão em caso de erro
      analysis = getDefaultDocumentAnalysis(content, documentType);
    }

    return analysis;

  } catch (error) {
    console.error("Erro na chamada para Groq:", error);
    // Retornar análise padrão em caso de erro
    return getDefaultDocumentAnalysis(content, documentType);
  }
}

function getDefaultDocumentAnalysis(content: string, documentType: string): DocumentAnalysis {
  const contentLength = content.length;
  const words = content.split(/\s+/).length;
  
  return {
    summary: `Documento do tipo ${documentType} com ${words} palavras. Análise automática realizada devido a erro no processamento de IA.`,
    key_requirements: [
      "Análise detalhada necessária",
      "Verificar requisitos técnicos",
      "Confirmar prazos e condições"
    ],
    important_deadlines: [
      {
        description: "Prazo a ser verificado manualmente",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        days_remaining: 30
      }
    ],
    technical_specifications: [
      "Especificações técnicas requerem análise manual",
      "Verificar anexos e documentos complementares"
    ],
    legal_requirements: [
      "Verificar habilitação jurídica",
      "Confirmar documentação fiscal",
      "Validar certidões exigidas"
    ],
    financial_info: {
      estimated_value: undefined,
      payment_terms: "A ser verificado no documento",
      guarantees_required: ["Verificar garantias exigidas"]
    },
    risks_identified: [
      "Análise de IA indisponível - revisão manual necessária",
      "Verificar todos os requisitos detalhadamente"
    ],
    recommendations: [
      "Realizar análise manual completa do documento",
      "Verificar todos os anexos e complementos",
      "Consultar especialista jurídico se necessário"
    ],
    confidence_score: 30 // Baixa confiança devido ao fallback
  };
}

console.log("Função process_document iniciada");