
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface McpResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export function useMcpAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

  const MCP_URL = import.meta.env.VITE_MCP_URL || 'http://localhost:8080';

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

      // Primeiro, verificar se precisa buscar licitações
      const shouldSearch = userMessage.toLowerCase().includes('buscar') || 
                          userMessage.toLowerCase().includes('encontrar') ||
                          userMessage.toLowerCase().includes('licitações');

      let searchResults = '';
      if (shouldSearch) {
        try {
          const searchResponse = await fetch(`${MCP_URL}/mcp/search_bids`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userMessage })
          });

          if (searchResponse.ok) {
            const results = await searchResponse.json();
            searchResults = `\n\nResultados da busca por licitações:\n${JSON.stringify(results, null, 2)}`;
          }
        } catch (error) {
          console.warn('Erro na busca de licitações:', error);
        }
      }

      const chatResponse = await fetch(`${MCP_URL}/mcp/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage + searchResults }
          ],
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`Erro na API MCP: ${chatResponse.status}`);
      }

      const data: McpResponse = await chatResponse.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro na IA",
        description: "Não foi possível processar sua mensagem. Verifique se o servidor MCP está rodando.",
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
