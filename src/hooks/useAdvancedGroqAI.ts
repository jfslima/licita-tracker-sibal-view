
import { useCallback } from 'react';
import { useGroqAI } from './useGroqAI';

export function useAdvancedGroqAI() {
  const base = useGroqAI();

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

  const sendMessage = useCallback(
    async (userMessage: string, context?: string) => {
      const systemPrompt = getModePrompt('consultant');
      const fullContext = context ? `${systemPrompt}\n\n${context}` : systemPrompt;
      await base.sendMessage(userMessage, fullContext);
    },
    [base]
  );

  const analyzeDocument = useCallback(
    async (text: string, type: string, analysisType: 'complete' | 'summary' | 'risks' | 'timeline' | 'legal' = 'complete') => {
      const analysisPrompts = {
        complete: `Realize uma análise completa e estruturada do seguinte documento de licitação:`,
        summary: `Crie um resumo executivo do documento:`,
        risks: `Identifique os principais riscos e pontos de atenção:`,
        timeline: `Liste todas as datas e prazos relevantes:`,
        legal: `Realize uma análise jurídica detalhada:`,
      } as const;

      const systemIntro = getModePrompt('analyzer');
      const prompt = `${systemIntro}\n\n${analysisPrompts[analysisType]}\n\nDOCUMENTO: ${type}\n---\n${text.slice(0, 12_000)}`;

      await base.sendMessage(prompt);
    },
    [base]
  );

  const clearMessages = () => {
    base.clearMessages();
  };

  const exportConversation = () => {
    const conversationText = base.messages.map(m => 
      `[${m.timestamp.toLocaleString('pt-BR')}] ${m.role.toUpperCase()}: ${m.content}`
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
    ...base,
    sendMessage,
    analyzeDocument,
    clearMessages,
    exportConversation,
    getModePrompt,
  };
}
