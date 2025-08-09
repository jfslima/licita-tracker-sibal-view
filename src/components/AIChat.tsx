
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMcpAI } from '@/hooks/useMcpAI';
import { Send, Bot, User, Brain, GraduationCap, BarChart3, Sparkles, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIChatProps {
  context?: any;
  onClose?: () => void;
  className?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
}

export function AIChat({ context, onClose, className }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou sua IA especializada em licitações públicas. Como posso ajudá-lo hoje?',
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        'Analisar uma licitação específica',
        'Explicar processo licitatório',
        'Gerar insights de mercado'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [mode, setMode] = useState<'consultor' | 'professor' | 'analista'>('consultor');
  const { sendMessage, loading, isOffline } = useMcpAI();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Preparar mensagens para o contexto
      const contextMessage = context ? `Contexto: ${JSON.stringify(context)}\n\n` : '';
      const modePrompt = {
        consultor: 'Você é um consultor especializado em licitações públicas com 20 anos de experiência.',
        professor: 'Você é um professor universitário especializado em direito administrativo e licitações.',
        analista: 'Você é um analista de dados especializado em métricas de licitações públicas.'
      };
      
      const fullMessage = `${modePrompt[mode]}\n\n${contextMessage}${inputMessage}`;
      
      const response = await sendMessage(fullMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content || 'Desculpe, não consegui processar sua mensagem.',
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          'Posso ajudar com mais análises',
          'Gostaria de explorar outros aspectos?',
          'Tem alguma dúvida específica?'
        ]
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro no chat:', error);
      
      // Adicionar mensagem de erro
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: isOffline 
          ? 'Sistema offline. Verifique sua conexão e tente novamente.'
          : 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erro no Chat",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [inputMessage, loading, sendMessage, context, mode, toast, isOffline]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputMessage(suggestion);
  }, []);

  const getModeIcon = (currentMode: string) => {
    switch (currentMode) {
      case 'consultor': return <Brain className="h-4 w-4" />;
      case 'professor': return <GraduationCap className="h-4 w-4" />;
      case 'analista': return <BarChart3 className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getModeDescription = (currentMode: string) => {
    switch (currentMode) {
      case 'consultor': return 'Especialista em estratégias de licitação';
      case 'professor': return 'Educador em processos licitatórios';
      case 'analista': return 'Analista de dados e métricas';
      default: return 'Assistente IA';
    }
  };

  return (
    <Card className={`h-[600px] flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chat com IA Especializada
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['consultor', 'professor', 'analista'] as const).map((modeOption) => (
                <Button
                  key={modeOption}
                  variant={mode === modeOption ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode(modeOption)}
                  className="flex items-center gap-1"
                >
                  {getModeIcon(modeOption)}
                  {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
                </Button>
              ))}
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {getModeDescription(mode)}
        </p>
      </CardHeader>
       
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className={`flex items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  <div className={`flex-1 space-y-2 ${message.sender === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-muted"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {message.id !== messages[messages.length - 1].id && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="inline-block bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">IA está pensando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua pergunta sobre licitações..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !inputMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
