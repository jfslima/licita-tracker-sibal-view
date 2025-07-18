import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentAnalysisRequest {
  fileUrl: string
  fileName: string
  licitacaoId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Document analyzer request received')
    
    const { fileUrl, fileName, licitacaoId }: DocumentAnalysisRequest = await req.json()

    if (!fileUrl || !fileName) {
      throw new Error('URL do arquivo e nome são obrigatórios')
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
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Processing document:', fileName, 'from URL:', fileUrl)

    // Fazer download do arquivo
    const fileResponse = await fetch(fileUrl)
    if (!fileResponse.ok) {
      throw new Error(`Erro ao baixar arquivo: ${fileResponse.status}`)
    }

    const fileBuffer = await fileResponse.arrayBuffer()
    const fileSize = fileBuffer.byteLength
    console.log('File downloaded, size:', fileSize, 'bytes')

    let extractedText = ''

    // Processar baseado no tipo de arquivo
    if (fileName.toLowerCase().endsWith('.pdf')) {
      // Para PDFs, vamos usar uma estratégia simples primeiro
      // Em um cenário real, você usaria uma biblioteca como pdf-parse
      extractedText = `Documento PDF: ${fileName}\nTamanho: ${fileSize} bytes\n\nEste é um arquivo PDF que requer processamento especializado para extração de texto.`
    } else if (fileName.toLowerCase().endsWith('.txt')) {
      // Para arquivos de texto simples
      const decoder = new TextDecoder('utf-8')
      extractedText = decoder.decode(fileBuffer)
    } else if (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')) {
      extractedText = `Documento Word: ${fileName}\nTamanho: ${fileSize} bytes\n\nEste é um arquivo Word que requer processamento especializado para extração de texto.`
    } else {
      extractedText = `Arquivo: ${fileName}\nTipo: Formato não suportado diretamente\nTamanho: ${fileSize} bytes`
    }

    console.log('Text extracted, length:', extractedText.length)

    // Limitar o texto para evitar problemas com a API
    const maxLength = 10000
    if (extractedText.length > maxLength) {
      extractedText = extractedText.substring(0, maxLength) + '\n\n[TEXTO TRUNCADO - DOCUMENTO MUITO LONGO]'
    }

    // Criar prompt especializado para análise de documentos de licitação
    const analysisPrompt = `Você é a **Sibal-AI**, assistente especializado em licitações públicas brasileiras (Lei 14.133/2021 e PNCP).

Analise o seguinte documento de licitação e gere uma resposta em **JSON** seguindo EXATAMENTE o esquema abaixo:

DOCUMENTO PARA ANÁLISE:
${extractedText}

ESQUEMA JSON DE RESPOSTA:
{
  "title": string,
  "agency": string,
  "uf": string,
  "modality": string,
  "value_estimated": string,
  "deadline_days": integer,
  "summary": string,
  "risks": string[],
  "fit_score": integer,
  "key_dates": {
    "site_visit": string|null,
    "proposal": string|null,
    "auction": string|null
  },
  "sources": string[]
}

INSTRUÇÕES:
• Extraia as informações mais relevantes do documento
• Se alguma informação não estiver disponível, use "N/A" 
• O summary deve ter no máximo 120 palavras
• Os risks devem ser no máximo 5 itens
• O fit_score deve ser de 0 a 100
• Retorne SOMENTE o bloco JSON — nenhum texto fora dele`

    // Enviar para análise da IA
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        messages: [
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 2024,
        temperature: 0.2,
        top_p: 1,
        stream: false
      }),
    })

    console.log('Groq API response status:', groqResponse.status)

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error('Groq API error details:', errorText)
      
      return new Response(JSON.stringify({
        error: `Erro na análise da IA: ${groqResponse.status}`,
        success: false,
        details: errorText
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const groqData = await groqResponse.json()
    console.log('Groq response received successfully')

    if (!groqData.choices || groqData.choices.length === 0) {
      console.error('No choices in Groq response:', groqData)
      return new Response(JSON.stringify({
        error: 'Resposta vazia da IA. Tente novamente.',
        success: false
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const analysisResult = groqData.choices[0].message.content

    if (!analysisResult) {
      return new Response(JSON.stringify({
        error: 'Conteúdo vazio na resposta da IA.',
        success: false
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Tentar fazer parse do JSON retornado pela IA
    let parsedAnalysis
    try {
      parsedAnalysis = JSON.parse(analysisResult)
    } catch (parseError) {
      console.error('Error parsing AI response as JSON:', parseError)
      // Se não conseguir fazer parse, retornar como texto simples
      parsedAnalysis = {
        title: fileName,
        summary: analysisResult,
        extracted_text: extractedText.substring(0, 1000) + '...'
      }
    }

    return new Response(JSON.stringify({
      success: true,
      analysis: parsedAnalysis,
      extracted_text: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? '...' : ''),
      file_info: {
        name: fileName,
        size: fileSize,
        url: fileUrl
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Document Analyzer Error:', error)
    
    let errorMessage = 'Erro interno do servidor'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return new Response(JSON.stringify({
      error: errorMessage,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})