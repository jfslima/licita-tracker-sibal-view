import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define tipos para mensagens e respostas
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export function useMcpAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (content: string, context?: string) => {
    if (!content.trim()) return;
    
    const newUserMessage: Message = {
      role: 'user',
      content: content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // Sistema avançado para análise profunda de licitações
      const systemPrompt = `Você é SIBAL Pro - o assistente de IA mais avançado do Brasil para licitações públicas. 

🧠 CAPACIDADES ESPECIALIZADAS:
- Análise multimodal completa de documentos
- Processamento avançado de dados PNCP
- Interpretação jurídica especializada
- Análise preditiva e scoring inteligente
- Recomendações estratégicas personalizadas

📋 ESPECIALIZAÇÃO EM:
- Lei 8.666/93 e Lei 14.133/21 (Marco Legal das Licitações)
- Portal Nacional de Contratações Públicas (PNCP)
- Modalidades: Concorrência, Tomada de Preços, Convite, Concurso, Leilão, Dispensa, Inexigibilidade, Pregão
- Documentação: DFD, Termo de Referência, Edital, Atas, Contratos
- Habilitação jurídica, técnica, fiscal e econômico-financeira
- Análise de riscos e oportunidades competitivas

${context ? `📊 CONTEXTO DO DOCUMENTO ANALISADO:\n${context}\n` : ''}

🎯 INSTRUÇÕES:
- Forneça análises profundas e detalhadas
- Use formatação clara com emojis e seções
- Inclua recomendações estratégicas específicas
- Cite artigos legais quando relevante
- Identifique oportunidades e riscos com precisão
- Seja proativo em sugestões de melhoria

Responda sempre de forma estruturada, clara e baseada na legislação brasileira atual.`;

      // Preparar mensagens para a Edge Function
      const conversationMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: content }
      ];

      // Usar a Edge Function ai-chat do Supabase
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: conversationMessages,
          model: 'llama-3.3-70b-versatile'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Erro na IA: ${error.message}`);
      }

      if (data?.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('No response from AI:', data);
        throw new Error('Resposta vazia da IA');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro na IA",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const summarizeDocument = async (documentText: string, documentType: string) => {
    const prompt = `Analise e resuma o seguinte documento de licitação (${documentType}):\n\n${documentText}\n\nForneça um resumo estruturado com:\n1. Tipo de documento e objeto principal\n2. Valor estimado (se disponível)\n3. Prazos importantes\n4. Principais exigências\n5. Pontos de atenção para licitantes`;
    await sendMessage(prompt);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return { 
    messages, 
    loading, 
    sendMessage,
    summarizeDocument,
    clearMessages
  };
}
