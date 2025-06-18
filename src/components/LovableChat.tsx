
import React, { useState } from 'react';
import { useLovable } from '@lovable/chat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, MessageSquare, X, Sparkles, Database } from 'lucide-react';

interface LovableChatProps {
  isOpen: boolean;
  onClose: () => void;
  documentContext?: {
    text: string;
    type: string;
    title: string;
  };
}

export function LovableChat({ isOpen, onClose, documentContext }: LovableChatProps) {
  const [input, setInput] = useState('');
  const { sendMessage, history, isLoading } = useLovable();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    
    // Se há contexto de documento, incluir na mensagem
    const contextualMessage = documentContext 
      ? `Documento: ${documentContext.title}\nTipo: ${documentContext.type}\nConteúdo: ${documentContext.text}\n\nPergunta: ${message}`
      : message;
    
    await sendMessage(contextualMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickSearch = async (query: string) => {
    await sendMessage(query);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border-0">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">Assistente IA Avançado</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    MCP + Qdrant
                  </Badge>
                </div>
                <p className="text-sm text-blue-100 font-normal mt-1">
                  Especialista em licitações com busca vetorial inteligente
                </p>
              </div>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {documentContext && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-200" />
                <div>
                  <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-white/30">
                    {documentContext.type}
                  </Badge>
                  <p className="text-sm font-medium text-white">{documentContext.title}</p>
                  <p className="text-xs text-blue-200">Documento carregado para análise avançada</p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Database className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Busca Inteligente com MCP + Qdrant
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Sistema avançado de busca vetorial para encontrar licitações similares e fazer análises profundas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch("Busque licitações de drones com valor acima de R$ 1 milhão no DF")}
                    disabled={isLoading}
                    className="justify-start h-auto p-4 text-left"
                  >
                    <div className="text-left">
                      <div className="font-medium">Busca Avançada</div>
                      <div className="text-xs text-gray-500">Drones > R$ 1 mi no DF</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch("Encontre licitações similares de tecnologia para segurança pública")}
                    disabled={isLoading}
                    className="justify-start h-auto p-4 text-left"
                  >
                    <div className="text-left">
                      <div className="font-medium">Busca Semântica</div>
                      <div className="text-xs text-gray-500">Tecnologia + Segurança</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch("Analise padrões de licitações de TI nos últimos 6 meses")}
                    disabled={isLoading}
                    className="justify-start h-auto p-4 text-left"
                  >
                    <div className="text-left">
                      <div className="font-medium">Análise de Padrões</div>
                      <div className="text-xs text-gray-500">TI - últimos 6 meses</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSearch("Compare preços de equipamentos médicos em diferentes estados")}
                    disabled={isLoading}
                    className="justify-start h-auto p-4 text-left"
                  >
                    <div className="text-left">
                      <div className="font-medium">Comparação</div>
                      <div className="text-xs text-gray-500">Preços por região</div>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {history.map((message, index) => (
                  <div key={index} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shrink-0">
                        <Database className="h-5 w-5 text-blue-700" />
                      </div>
                    )}
                    <div className={`max-w-[75%] p-4 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                        : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-3 flex items-center gap-1">
                        {message.role === 'assistant' && <Database className="h-3 w-3" />}
                        {new Date().toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shrink-0">
                      <Database className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-600">Pesquisando na base vetorial...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <Separator />
          
          <div className="p-6 bg-gray-50">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Faça uma busca inteligente sobre licitações..."
                disabled={isLoading}
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
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
            
            <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
              <Database className="h-3 w-3 mr-1" />
              Conectado ao MCP + Qdrant para busca vetorial avançada
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
