
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: string;
}

interface AnalysisResult {
  summary: string;
  risks: string[];
  opportunities: string[];
  timeline: Array<{ date: string; event: string; importance: 'high' | 'medium' | 'low' }>;
  recommendations: string[];
}

export function useAdvancedGroqAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const { toast } = useToast();

  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  const getModePrompt = (mode: string) => {
    const prompts = {
      consultant: `Você é um consultor especializado em licitações públicas com 20 anos de experiência. 
        Forneça análises jurídicas precisas, interpretações de cláusulas contratuais e orientações estratégicas.
        Seja técnico mas acessível, sempre citando a legislação aplicável.`,
      
      analyzer: `Você é um analisador especializado em documentos de licitação. 
        Sua função é extrair informações-chave, identificar pontos críticos e criar resumos estruturados.
        Organize as informações de forma clara e hierárquica.`,
      
      teacher: `Você é um professor especializado em ensinar sobre licitações públicas. 
        Explique conceitos de forma didática, use exemplos práticos e sempre eduque o usuário.
        Seja paciente e detalhado em suas explicações.`,
      
      advisor: `Você é um conselheiro estratégico para empresas que participam de licitações.
        Foque em orientações práticas, identificação de oportunidades e minimização de riscos.
        Forneça conselhos acionáveis e estratégicos.`
    };
    
    return prompts[mode as keyof typeof prompts] || prompts.consultant;
  };

  const sendMessage = async (userMessage: string, context?: string, mode: string = 'consultant') => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      mode,
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const systemPrompt = `${getModePrompt(mode)}

Especialista em licitações públicas no Brasil. Seu conhecimento inclui:
- Lei 8.666/93 e Lei 14.133/21 (Nova Lei de Licitações)
- Portal Nacional de Contratações Públicas (PNCP)
- Modalidades de licitação e procedimentos
- Análise de editais, atas e contratos
- Aspectos jurídicos e estratégicos

${context ? `Contexto adicional: ${context}` : ''}

Responda sempre de forma precisa, fundamentada na legislação e orientada à prática.`;

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          temperature: 1,
          max_completion_tokens: 1024,
          top_p: 1,
          stream: true,
          stop: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      const assistantMessageObj: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        mode,
      };

      setMessages(prev => [...prev, assistantMessageObj]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  assistantMessage += content;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = assistantMessage;
                    return newMessages;
                  });
                }
              } catch (e) {
                // Ignora linhas que não são JSON válido
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro na IA",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const analyzeDocument = async (documentText: string, documentType: string, analysisType: string = 'complete') => {
    const analysisPrompts = {
      complete: `Realize uma análise completa e estruturada do seguinte documento de licitação:`,
      summary: `Crie um resumo executivo do documento:`,
      risks: `Identifique e analise os principais riscos do documento:`,
      timeline: `Extraia e organize todas as datas e prazos importantes:`,
      legal: `Realize uma análise jurídica detalhada:`
    };

    const prompt = `${analysisPrompts[analysisType as keyof typeof analysisPrompts]}

DOCUMENTO: ${documentType}
CONTEÚDO: ${documentText}

Organize sua resposta com:
1. **RESUMO EXECUTIVO**
2. **PONTOS CRÍTICOS**
3. **CRONOGRAMA DE PRAZOS**
4. **RISCOS IDENTIFICADOS**
5. **OPORTUNIDADES**
6. **RECOMENDAÇÕES ESTRATÉGICAS**

Seja preciso, técnico e prático.`;

    await sendMessage(prompt, undefined, 'analyzer');
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const exportConversation = () => {
    const conversationText = messages.map(m => 
      `[${(m.timestamp || new Date()).toLocaleString('pt-BR')}] ${m.role.toUpperCase()}: ${m.content}`
    ).join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversa-ia-sibal-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    messages,
    isLoading,
    isStreaming,
    analysisHistory,
    sendMessage,
    analyzeDocument,
    clearMessages,
    exportConversation,
  };
}
