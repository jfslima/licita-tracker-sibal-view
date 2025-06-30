import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define tipos para mensagens e respostas
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

interface MCPResponse {
  choices?: Array<{
    message?: Message;
  }>;
}

interface ChatRequest {
  model: string;
  messages: Message[];
}

// Implementação simplificada de cliente MCP usando fetch
const mcpClient = {
  async chat(request: ChatRequest): Promise<MCPResponse> {
    const response = await fetch(import.meta.env.VITE_MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [import.meta.env.VITE_MCP_HEADER]: import.meta.env.VITE_MCP_TOKEN
      },
      body: JSON.stringify({
        type: "chat",
        arguments: request
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro na comunicação com MCP: ${response.status}`);
    }
    
    return await response.json();
  }
};

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
      // Definir prompt do sistema para licitações
      const systemPrompt = `Você é um assistente especializado em licitações públicas no Brasil. Seu papel é ajudar usuários com dúvidas sobre:

- Processos licitatórios (editais, atas, contratos)
- Legislação de licitações (Lei 8.666/93, Lei 14.133/21)
- Portal Nacional de Contratações Públicas (PNCP)
- Modalidades de licitação
- Documentação necessária
- Prazos e procedimentos

${context ? `Contexto adicional do documento: ${context}` : ''}

Responda de forma clara, objetiva e sempre baseada na legislação brasileira atual.`;

      // Preparar mensagens para o MCP
      const mcpMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...messages,
        { role: 'user', content: content }
      ];

      const res = await mcpClient.chat({
        model: import.meta.env.VITE_LOVABLE_MODEL,
        messages: mcpMessages
      });

      if (res.choices?.[0]?.message) {
        const assistantMessage: Message = {
          ...res.choices[0].message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
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
