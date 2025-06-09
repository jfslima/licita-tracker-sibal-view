
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, MessageSquare, X } from 'lucide-react';
import { useGroqAI } from '@/hooks/useGroqAI';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  documentContext?: {
    text: string;
    type: string;
    title: string;
  };
}

export function AIChat({ isOpen, onClose, documentContext }: AIChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, isStreaming, sendMessage, summarizeDocument, clearMessages } = useGroqAI();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    
    const context = documentContext ? 
      `Documento: ${documentContext.title}\nTipo: ${documentContext.type}\nConteúdo: ${documentContext.text}` : 
      undefined;

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
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <span className="text-xl">Assistente IA - Sibal</span>
                <p className="text-sm text-gray-600 font-normal">
                  Especialista em licitações públicas
                </p>
              </div>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {documentContext && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">
                    {documentContext.type}
                  </Badge>
                  <p className="text-sm font-medium">{documentContext.title}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSummarizeDocument}
                  disabled={isLoading}
                >
                  Resumir Documento
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Como posso ajudar?
                </h3>
                <p className="text-gray-600 mb-6">
                  Faça perguntas sobre licitações, documentos ou o PNCP
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage("Como funciona o processo licitatório no Brasil?")}
                    disabled={isLoading}
                  >
                    Como funciona o processo licitatório?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage("Quais são os tipos de modalidades de licitação?")}
                    disabled={isLoading}
                  >
                    Tipos de modalidades de licitação
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage("Como participar de uma licitação pública?")}
                    disabled={isLoading}
                  >
                    Como participar de uma licitação?
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="p-2 bg-blue-600 rounded-lg shrink-0">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex gap-3 justify-start">
                    <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <Separator />
          
          <div className="p-6">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre licitações..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
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
                >
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
