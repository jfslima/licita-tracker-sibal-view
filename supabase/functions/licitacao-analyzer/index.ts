import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, data } = await req.json()

    switch (action) {
      case 'analyze_batch':
        // Processar lote de licitações
        const results = []
        
        for (const licitacao of data.licitacoes) {
          try {
            const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'llama-3.1-70b-versatile',
                messages: [
                  {
                    role: 'system',
                    content: `Você é um especialista em análise de licitações públicas brasileiras. 
                    Analise o edital e retorne um JSON estruturado com:
                    {
                      "objeto": "descrição clara do objeto",
                      "valor_estimado": valor_numerico_ou_null,
                      "prazo_dias": numero_de_dias_ou_null,
                      "modalidade": "pregão/concorrência/etc",
                      "complexidade": "baixa/média/alta",
                      "requisitos_principais": ["req1", "req2"],
                      "riscos_identificados": ["risco1", "risco2"],
                      "score_viabilidade": numero_de_0_a_100,
                      "resumo_executivo": "resumo em 1-2 frases"
                    }`
                  },
                  {
                    role: 'user',
                    content: `Analise esta licitação: ${licitacao.texto || licitacao.objeto}`
                  }
                ],
                max_tokens: 1500,
                temperature: 0.1
              }),
            })

            if (groqResponse.ok) {
              const groqData = await groqResponse.json()
              let analiseIA
              
              try {
                analiseIA = JSON.parse(groqData.choices[0].message.content)
              } catch {
                analiseIA = { resumo_executivo: groqData.choices[0].message.content }
              }

              // Atualizar no banco
              const { error } = await supabase
                .from('licitacoes')
                .update({ 
                  resumo_ia: JSON.stringify(analiseIA),
                  atualizado_em: new Date().toISOString()
                })
                .eq('id', licitacao.id)

              results.push({
                id: licitacao.id,
                status: 'success',
                analise: analiseIA,
                error: error?.message
              })
            } else {
              results.push({
                id: licitacao.id,
                status: 'error',
                error: 'Falha na API Groq'
              })
            }
          } catch (error) {
            results.push({
              id: licitacao.id,
              status: 'error',
              error: error.message
            })
          }
        }

        return new Response(JSON.stringify({
          success: true,
          results,
          processed: results.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      case 'get_stats':
        // Estatísticas das licitações
        const { data: stats, error } = await supabase
          .from('licitacoes')
          .select('resumo_ia, valor, criado_em')
          .not('resumo_ia', 'is', null)

        if (error) throw error

        const totalAnalisadas = stats.length
        const valorTotal = stats.reduce((sum, item) => {
          const val = parseFloat(item.valor || 0)
          return sum + (isNaN(val) ? 0 : val)
        }, 0)

        return new Response(JSON.stringify({
          total_analisadas: totalAnalisadas,
          valor_total_estimado: valorTotal,
          media_por_dia: totalAnalisadas / 30, // Últimos 30 dias
          ultima_atualizacao: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

      default:
        return new Response(JSON.stringify({
          error: 'Ação não reconhecida'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    console.error('Analyzer Error:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})