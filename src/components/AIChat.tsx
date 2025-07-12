
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, MessageSquare, X, FileText, Sparkles } from 'lucide-react';
import { useMcpAI } from '@/hooks/useMcpAI';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  documentContext?: {
    text: string;
    type: string;
    title: string;
  };
  autoSendMessage?: string;
}

export function AIChat({ isOpen, onClose, documentContext, autoSendMessage }: AIChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, loading: isLoading, sendMessage, summarizeDocument, clearMessages } = useMcpAI();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isStreaming = false; // Streaming não disponível na implementação MCP atual

  // Auto-send message when provided
  useEffect(() => {
    if (autoSendMessage && isOpen) {
      sendMessage(autoSendMessage);
    }
  }, [autoSendMessage, isOpen, sendMessage]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    
    const context = documentContext 
      ? `Documento: ${documentContext.title}\nTipo: ${documentContext.type}\nConteúdo: ${documentContext.text}` 
      : undefined;

    await sendMessage(message, context);
  };

  const handleSummarizeDocument = async () => {
    if (!documentContext) return;
    await summarizeDocument(documentContext.text, documentContext.type);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border-0">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">Assistente IA</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Sibal Pro
                  </Badge>
                </div>
                <p className="text-sm text-blue-100 font-normal mt-1">
                  Especialista em licitações públicas do Brasil
                </p>
              </div>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {documentContext && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-200" />
                  <div>
                    <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-white/30">
                      {documentContext.type}
                    </Badge>
                    <p className="text-sm font-medium text-white">{documentContext.title}</p>
                    <p className="text-xs text-blue-200">Documento carregado para análise</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSummarizeDocument}
                  disabled={isLoading}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Resumir
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <MessageSquare className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Como posso ajudar hoje?
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Sou especialista em licitações públicas brasileiras. Faça perguntas sobre processos, documentos ou legislação.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage("Como funciona o processo licitatório no Brasil?")}
                        disabled={isLoading}
                        className="justify-start h-auto p-4 text-left"
                      >
                        <div className="text-left">
                          <div className="font-medium">Processo Licitatório</div>
                          <div className="text-xs text-gray-500">Como funciona no Brasil?</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage("Quais são os tipos de modalidades de licitação?")}
                        disabled={isLoading}
                        className="justify-start h-auto p-4 text-left"
                      >
                        <div className="text-left">
                          <div className="font-medium">Modalidades</div>
                          <div className="text-xs text-gray-500">Tipos de licitação</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage("Como participar de uma licitação pública?")}
                        disabled={isLoading}
                        className="justify-start h-auto p-4 text-left"
                      >
                        <div className="text-left">
                          <div className="font-medium">Participação</div>
                          <div className="text-xs text-gray-500">Como participar?</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage("Explique sobre o Portal Nacional de Contratações Públicas (PNCP)")}
                        disabled={isLoading}
                        className="justify-start h-auto p-4 text-left"
                      >
                        <div className="text-left">
                          <div className="font-medium">PNCP</div>
                          <div className="text-xs text-gray-500">Portal Nacional</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.role === 'assistant' && (
                          <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shrink-0">
                            <Bot className="h-5 w-5 text-blue-700" />
                          </div>
                        )}
                        <div className={`max-w-[80%] p-4 rounded-2xl break-words overflow-wrap-anywhere ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                            : 'bg-gray-50 text-gray-900 border border-gray-200'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed text-sm break-words hyphens-auto">{message.content}</p>
                          <p className="text-xs opacity-70 mt-3 flex items-center gap-1">
                            {message.role === 'assistant' && <Bot className="h-3 w-3" />}
                            {message.timestamp.toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shrink-0">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isStreaming && (
                      <div className="flex gap-4 justify-start">
                        <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shrink-0">
                          <Bot className="h-5 w-5 text-blue-700" />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Pensando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator />
          
          <div className="p-6 bg-gray-50 flex-shrink-0">
            <div className="flex gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre licitações..."
                disabled={isLoading}
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {messages.length > 0 && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessages}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Conversa
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
