import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define tipos para mensagens
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Implementação do cliente MCP usando o formato JSON-RPC com fallback
const mcpClient = {
  async callTool(name: string, args: any): Promise<any> {
    try {
      // Tenta fazer a chamada real ao MCP
      const response = await fetch(import.meta.env.VITE_MCP_URL || '/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [import.meta.env.VITE_MCP_HEADER || 'api-key']: import.meta.env.VITE_MCP_TOKEN || 'local-dev'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: name,
            arguments: args
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na comunicação com MCP: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Verificar se há erro na resposta do MCP
      if (responseData.error) {
        throw new Error(responseData.error.message || 'Erro desconhecido');
      }
      
      return responseData.result;
    } catch (error) {
      console.error('Erro na comunicação com MCP:', error);
      throw error;
    }
  }
};

export function useMcpAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const { toast } = useToast();
  
  // Adiciona uma mensagem de boas-vindas
  useEffect(() => {
    setMessages([{
      role: 'system',
      content: 'Bem-vindo ao SIBAL Licita Tracker! Sou seu assistente especializado em licitações públicas. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    }]);
  }, []);

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
      const systemPrompt = `Você é um assistente especializado em licitações públicas no Brasil. 
      Seu papel é ajudar usuários com dúvidas sobre:
      - Processos licitatórios (editais, atas, contratos)
      - Legislação de licitações (Lei 8.666/93, Lei 14.133/21)
      - Portal Nacional de Contratações Públicas (PNCP)
      - Modalidades de licitação
      - Documentação necessária
      - Prazos e procedimentos
      ${context ? `\n\nContexto adicional do documento: ${context}` : ''}`;

      // Preparar mensagens para o MCP
      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        })),
        { role: 'user', content }
      ];

      // Chamar a ferramenta chat_with_ai no servidor MCP
      const result = await mcpClient.callTool('chat_with_ai', {
        messages: apiMessages,
        mode: 'consultant'
      });

      // Adicionar a resposta do assistente
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro na IA",
        description: error instanceof Error ? error.message : "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const summarizeDocument = async (text: string, type: string) => {
    if (!text.trim()) return;
    
    setLoading(true);

    try {
      // Chamar a ferramenta chat_with_ai para análise de documento
      const result = await mcpClient.callTool('chat_with_ai', {
        messages: [{ 
          role: 'system', 
          content: 'Você é um especialista em análise de editais de licitação. Forneça resumos concisos e destaque pontos importantes.' 
        }],
        documentContent: text,
        analysisType: 'summary'
      });

      // Adicionar a resposta como mensagem do sistema
      const systemMessage: Message = {
        role: 'system',
        content: `Análise do documento ${type}:`,
        timestamp: new Date()
      };
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, systemMessage, assistantMessage]);
    } catch (error) {
      console.error('Erro ao analisar documento:', error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível analisar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
