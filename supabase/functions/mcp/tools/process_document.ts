import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ProcessDocumentArgs {
  document_url: string;
  document_type: 'edital' | 'anexo' | 'ata' | 'resultado';
  notice_id?: string;
  extract_tables?: boolean;
  extract_requirements?: boolean;
}

interface DocumentProcessingResult {
  document_id: string;
  document_type: string;
  processing_status: 'success' | 'partial' | 'failed';
  extracted_text: string;
  extracted_tables: {
    table_id: string;
    headers: string[];
    rows: string[][];
    context: string;
  }[];
  extracted_requirements: {
    category: string;
    requirement: string;
    mandatory: boolean;
    details: string;
  }[];
  key_information: {
    dates: { type: string; date: string; description: string }[];
    values: { type: string; amount: number; currency: string; description: string }[];
    contacts: { name: string; role: string; email?: string; phone?: string }[];
    addresses: { type: string; address: string; context: string }[];
  };
  document_structure: {
    sections: { title: string; page: number; content_summary: string }[];
    total_pages: number;
    document_format: string;
  };
  processing_metadata: {
    processing_time: number;
    confidence_score: number;
    errors: string[];
    warnings: string[];
  };
}

export async function processDocument(
  supabase: SupabaseClient,
  args: ProcessDocumentArgs
): Promise<DocumentProcessingResult> {
  try {
    const startTime = Date.now();
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Baixar documento
    const documentResponse = await fetch(args.document_url);
    if (!documentResponse.ok) {
      throw new Error(`Erro ao baixar documento: ${documentResponse.statusText}`);
    }

    const documentBuffer = await documentResponse.arrayBuffer();
    const documentType = getDocumentType(args.document_url);
    
    let extractedText = '';
    let extractedTables: any[] = [];
    let documentStructure: any = {
      sections: [],
      total_pages: 1,
      document_format: documentType
    };

    // Processar baseado no tipo de documento
    if (documentType === 'pdf') {
      const pdfResult = await processPDF(documentBuffer);
      extractedText = pdfResult.text;
      extractedTables = pdfResult.tables;
      documentStructure = pdfResult.structure;
    } else if (documentType === 'docx') {
      const docxResult = await processDOCX(documentBuffer);
      extractedText = docxResult.text;
      extractedTables = docxResult.tables;
    } else if (documentType === 'xlsx') {
      const xlsxResult = await processXLSX(documentBuffer);
      extractedText = xlsxResult.text;
      extractedTables = xlsxResult.tables;
    } else {
      throw new Error(`Tipo de documento não suportado: ${documentType}`);
    }

    // Extrair informações estruturadas usando IA
    const structuredData = await extractStructuredInformation(
      extractedText,
      args.document_type,
      extractedTables
    );

    // Extrair requisitos se solicitado
    let extractedRequirements: any[] = [];
    if (args.extract_requirements) {
      extractedRequirements = await extractRequirements(extractedText, args.document_type);
    }

    const processingTime = Date.now() - startTime;
    
    const result: DocumentProcessingResult = {
      document_id: documentId,
      document_type: args.document_type,
      processing_status: 'success',
      extracted_text: extractedText.substring(0, 10000), // Limitar tamanho
      extracted_tables: args.extract_tables ? extractedTables : [],
      extracted_requirements: extractedRequirements,
      key_information: structuredData,
      document_structure,
      processing_metadata: {
        processing_time: processingTime,
        confidence_score: calculateConfidenceScore(extractedText, extractedTables),
        errors: [],
        warnings: []
      }
    };

    // Salvar resultado no banco se notice_id fornecido
    if (args.notice_id) {
      await saveDocumentProcessingResult(supabase, args.notice_id, result);
    }

    return result;

  } catch (error) {
    console.error('Erro em processDocument:', error);
    
    return {
      document_id: `doc_error_${Date.now()}`,
      document_type: args.document_type,
      processing_status: 'failed',
      extracted_text: '',
      extracted_tables: [],
      extracted_requirements: [],
      key_information: {
        dates: [],
        values: [],
        contacts: [],
        addresses: []
      },
      document_structure: {
        sections: [],
        total_pages: 0,
        document_format: 'unknown'
      },
      processing_metadata: {
        processing_time: 0,
        confidence_score: 0,
        errors: [error.message],
        warnings: []
      }
    };
  }
}

function getDocumentType(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf': return 'pdf';
    case 'doc':
    case 'docx': return 'docx';
    case 'xls':
    case 'xlsx': return 'xlsx';
    default: return 'unknown';
  }
}

async function processPDF(buffer: ArrayBuffer): Promise<any> {
  // Simulação de processamento PDF
  // Em produção, usar biblioteca como pdf-parse ou similar
  return {
    text: 'Texto extraído do PDF (simulação)',
    tables: [],
    structure: {
      sections: [{ title: 'Seção 1', page: 1, content_summary: 'Resumo da seção' }],
      total_pages: 1,
      document_format: 'pdf'
    }
  };
}

async function processDOCX(buffer: ArrayBuffer): Promise<any> {
  // Simulação de processamento DOCX
  return {
    text: 'Texto extraído do DOCX (simulação)',
    tables: []
  };
}

async function processXLSX(buffer: ArrayBuffer): Promise<any> {
  // Simulação de processamento XLSX
  return {
    text: 'Dados extraídos do XLSX (simulação)',
    tables: [
      {
        table_id: 'table_1',
        headers: ['Coluna 1', 'Coluna 2'],
        rows: [['Valor 1', 'Valor 2']],
        context: 'Tabela de dados'
      }
    ]
  };
}

async function extractStructuredInformation(text: string, documentType: string, tables: any[]): Promise<any> {
  // Usar IA para extrair informações estruturadas
  const prompt = `
Analise o seguinte texto de um documento de licitação (${documentType}) e extraia informações estruturadas:

${text.substring(0, 2000)}

Extraia e retorne em JSON:
1. dates: Array com datas importantes (type, date, description)
2. values: Array com valores monetários (type, amount, currency, description)
3. contacts: Array com contatos (name, role, email, phone)
4. addresses: Array com endereços (type, address, context)

Seja preciso e extraia apenas informações claramente identificadas.
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
            content: 'Você é um especialista em extração de informações de documentos de licitação. Retorne sempre JSON válido e estruturado.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1500
      })
    });

    if (groqResponse.ok) {
      const groqData = await groqResponse.json();
      const aiResponse = groqData.choices[0]?.message?.content;
      
      if (aiResponse) {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    }
  } catch (error) {
    console.error('Erro na extração de IA:', error);
  }

  // Fallback: extração básica por regex
  return {
    dates: extractDatesFromText(text),
    values: extractValuesFromText(text),
    contacts: extractContactsFromText(text),
    addresses: extractAddressesFromText(text)
  };
}

async function extractRequirements(text: string, documentType: string): Promise<any[]> {
  // Usar IA para extrair requisitos
  const prompt = `
Analise o seguinte texto de ${documentType} e extraia todos os requisitos:

${text.substring(0, 2000)}

Extraia requisitos em JSON array com:
- category: categoria do requisito
- requirement: descrição do requisito
- mandatory: se é obrigatório (boolean)
- details: detalhes adicionais
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
            content: 'Extraia requisitos de documentos de licitação. Retorne JSON array válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (groqResponse.ok) {
      const groqData = await groqResponse.json();
      const aiResponse = groqData.choices[0]?.message?.content;
      
      if (aiResponse) {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    }
  } catch (error) {
    console.error('Erro na extração de requisitos:', error);
  }

  return [];
}

function extractDatesFromText(text: string): any[] {
  const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g;
  const matches = text.match(dateRegex) || [];
  return matches.map((date, index) => ({
    type: 'data_encontrada',
    date: date,
    description: `Data extraída do documento (${index + 1})`
  }));
}

function extractValuesFromText(text: string): any[] {
  const valueRegex = /R\$\s*([\d.,]+)/g;
  const matches = text.match(valueRegex) || [];
  return matches.map((value, index) => ({
    type: 'valor_monetario',
    amount: parseFloat(value.replace(/[R$.,\s]/g, '')) || 0,
    currency: 'BRL',
    description: `Valor extraído do documento (${index + 1})`
  }));
}

function extractContactsFromText(text: string): any[] {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const phoneRegex = /(\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4})/g;
  
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  
  const contacts = [];
  emails.forEach((email, index) => {
    contacts.push({
      name: `Contato ${index + 1}`,
      role: 'Não especificado',
      email: email,
      phone: phones[index] || undefined
    });
  });
  
  return contacts;
}

function extractAddressesFromText(text: string): any[] {
  // Regex simples para endereços
  const addressRegex = /(Rua|Av|Avenida|Praça)\s+[^\n]{10,100}/gi;
  const matches = text.match(addressRegex) || [];
  return matches.map((address, index) => ({
    type: 'endereco_extraido',
    address: address.trim(),
    context: `Endereço encontrado no documento (${index + 1})`
  }));
}

function calculateConfidenceScore(text: string, tables: any[]): number {
  let score = 50; // Base score
  
  if (text.length > 1000) score += 20;
  if (tables.length > 0) score += 15;
  if (text.includes('licitação') || text.includes('edital')) score += 15;
  
  return Math.min(score, 100);
}

async function saveDocumentProcessingResult(
  supabase: SupabaseClient,
  noticeId: string,
  result: DocumentProcessingResult
): Promise<void> {
  try {
    const { error } = await supabase
      .from('document_processing_results')
      .insert({
        notice_id: noticeId,
        document_id: result.document_id,
        document_type: result.document_type,
        processing_result: result,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao salvar resultado do processamento:', error);
    }
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
  }
}