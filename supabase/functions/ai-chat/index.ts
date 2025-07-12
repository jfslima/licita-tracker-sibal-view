import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  model?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('AI Chat request received')
    
    const { messages, model = 'meta-llama/llama-4-maverick-17b-128e-instruct' }: ChatRequest = await req.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required')
    }

    // Verificar se a GROQ_API_KEY está configurada
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not configured')
      return new Response(JSON.stringify({
        error: 'GROQ_API_KEY não configurada. Configure a chave API nas configurações do Supabase.',
        success: false,
        requiresApiKey: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Calling Groq API with model:', model)
    console.log('Messages count:', messages.length)

    // Chamar Groq API com tratamento robusto de erros
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 2024,
        temperature: 0.2,
        top_p: 1,
        stream: false
      }),
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq API error:', groqResponse.status, errorText)
      
      let errorMessage = `Erro Groq API: ${groqResponse.status}`
      if (groqResponse.status === 401) {
        errorMessage = 'Chave API Groq inválida. Verifique a configuração.'
      } else if (groqResponse.status === 429) {
        errorMessage = 'Limite de rate excedido. Aguarde alguns segundos.'
      } else if (groqResponse.status >= 500) {
        errorMessage = 'Erro interno da API Groq. Tente novamente.'
      }
      
      return new Response(JSON.stringify({
        error: errorMessage,
        success: false,
        details: errorText
      }), {
        status: groqResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const groqData = await groqResponse.json()
    console.log('Groq response received successfully')

    if (!groqData.choices || groqData.choices.length === 0) {
      console.error('No choices in Groq response:', groqData)
      return new Response(JSON.stringify({
        error: 'Resposta vazia da IA. Tente reformular sua pergunta.',
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const response = groqData.choices[0].message.content

    if (!response) {
      return new Response(JSON.stringify({
        error: 'Conteúdo vazio na resposta da IA.',
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      response: response,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('AI Chat Error:', error)
    
    let errorMessage = 'Erro interno do servidor'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return new Response(JSON.stringify({
      error: errorMessage,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})