
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GroqResponse {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
}

export function useGroqAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const GROQ_API_KEY = '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';
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  const sendMessage = async (userMessage: string, context?: string) => {
    if (!userMessage.trim()) return;

    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const systemPrompt = `Você é um assistente especializado em licitações públicas no Brasil. Seu papel é ajudar usuários com dúvidas sobre:

- Processos licitatórios (editais, atas, contratos)
- Legislação de licitações (Lei 8.666/93, Lei 14.133/21)
- Portal Nacional de Contratações Públicas (PNCP)
- Modalidades de licitação
- Documentação necessária
- Prazos e procedimentos

${context ? `Contexto adicional do documento: ${context}` : ''}

Responda de forma clara, objetiva e sempre baseada na legislação brasileira atual.`;

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: true,
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
                const parsed: GroqResponse = JSON.parse(data);
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

  const summarizeDocument = async (documentText: string, documentType: string) => {
    const prompt = `Analise e resuma o seguinte documento de licitação (${documentType}):

${documentText}

Forneça um resumo estruturado com:
1. Tipo de documento e objeto principal
2. Valor estimado (se disponível)
3. Prazos importantes
4. Principais exigências
5. Pontos de atenção para licitantes`;

    await sendMessage(prompt);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    summarizeDocument,
    clearMessages,
  };
}
