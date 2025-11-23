import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define tipos para mensagens
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Cliente para comunicação com Lovable AI através da Edge Function
const aiChatClient = {
  async sendMessage(messages: any[]): Promise<any> {
    try {
      console.log('Chamando Edge Function chat-ai com Lovable AI...');
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { messages }
      });
      
      if (error) {
        console.error('Erro na Edge Function:', error);
        throw new Error(error.message || 'Erro ao chamar Edge Function');
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Resposta inválida da IA');
      }
      
      return { content: data.response };
    } catch (error) {
      console.error('Erro na comunicação com IA:', error);
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

  const sendMessage = useCallback(async (content: string, context?: string) => {
    if (!content.trim()) {
      return { content: 'Por favor, digite uma mensagem.' };
    }
    
    const newUserMessage: Message = {
      role: 'user',
      content: content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);
    setOfflineMode(false);

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

      console.log('Enviando mensagem para IA:', { apiMessages });

      // Chamar a função ai-chat do Supabase
      const result = await aiChatClient.sendMessage(apiMessages);

      console.log('Resposta da IA:', result);

      // Adicionar a resposta do assistente
      const assistantMessage: Message = {
        role: 'assistant',
        content: result.content || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      return result;

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setOfflineMode(true);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro na IA",
        description: error instanceof Error ? error.message : "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [messages, toast]);

  const summarizeDocument = async (text: string, type: string) => {
    if (!text.trim()) return;
    
    setLoading(true);

    try {
      // Chamar a função ai-chat do Supabase para análise de documento
      const analysisMessages = [
        { 
          role: 'system', 
          content: 'Você é um especialista em análise de editais de licitação. Forneça resumos concisos e destaque pontos importantes.' 
        },
        {
          role: 'user',
          content: `Analise o seguinte documento do tipo ${type}:\n\n${text}`
        }
      ];
      
      const result = await aiChatClient.sendMessage(analysisMessages);

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
    isOffline: offlineMode,
    sendMessage,
    summarizeDocument,
    clearMessages
  };
}
