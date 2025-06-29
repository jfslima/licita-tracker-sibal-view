
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, MessageSquare, X, Sparkles, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LovableChatProps {
  isOpen: boolean;
  onClose: () => void;
  documentContext?: {
    text: string;
    type: string;
    title: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function LovableChat({ isOpen, onClose, documentContext }: LovableChatProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const MCP_URL = import.meta.env.VITE_MCP_URL || 'http://localhost:8080';

  useEffect(() => {
    if (isOpen) {
      checkMcpConnection();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [history]);

  const checkMcpConnection = async () => {
    console.log('🔍 Verificando conexão MCP em:', MCP_URL);
    try {
      const response = await fetch(`${MCP_URL}/health`);
      if (response.ok) {
        setConnectionStatus('connected');
        console.log('✅ Servidor MCP conectado');
      } else {
        setConnectionStatus('error');
        console.log('❌ Servidor MCP retornou erro:', response.status);
      }
    } catch (error) {
      setConnectionStatus('error');
      console.log('❌ Erro ao conectar com servidor MCP:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    console.log('📤 Enviando mensagem:', message);
    
    setIsLoading(true);
    const newMessage: ChatMessage = { role: 'user', content: message };
    setHistory(prev => [...prev, newMessage]);
    
    try {
      // Verificar se precisa buscar licitações
      const shouldSearch = message.toLowerCase().includes('buscar') || 
                          message.toLowerCase().includes('encontrar') ||
                          message.toLowerCase().includes('licitações') ||
                          message.toLowerCase().includes('drones');

      let searchResults = '';
      if (shouldSearch) {
        console.log('🔍 Fazendo busca de licitações...');
        try {
          const searchResponse = await fetch(`${MCP_URL}/mcp/search_bids`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: message })
          });

          if (searchResponse.ok) {
            const results = await searchResponse.json();
            console.log('✅ Resultados da busca:', results);
            searchResults = `\n\nResultados encontrados:\n${JSON.stringify(results, null, 2)}`;
          } else {
            console.log('⚠️ Erro na busca:', searchResponse.status);
          }
        } catch (error) {
          console.warn('⚠️ Erro na busca de licitações:', error);
        }
      }

      // Enviar para IA
      console.log('🤖 Enviando para IA via MCP...');
      const systemPrompt = `Você é um assistente especializado em licitações públicas no Brasil. Responda de forma clara e objetiva sobre:
- Processos licitatórios e legislação brasileira
- Lei 8.666/93 e Lei 14.133/21
- Portal Nacional de Contratações Públicas (PNCP)
- Modalidades de licitação e documentação

${documentContext ? `Contexto do documento: ${documentContext.title} (${documentContext.type})\nConteúdo: ${documentContext.text}` : ''}

Responda sempre em português de forma educativa e prática.`;

      const chatResponse = await fetch(`${MCP_URL}/mcp/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: message + searchResults }
          ],
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
        }),
      });

      console.log('📡 Status da resposta da IA:', chatResponse.status);

      if (!chatResponse.ok) {
        throw new Error(`Erro na API MCP: ${chatResponse.status} - ${chatResponse.statusText}`);
      }

      const data = await chatResponse.json();
      console.log('✅ Resposta da IA recebida:', data);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem. Tente novamente.',
      };

      setHistory(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('❌ Erro completo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro na IA",
        description: `Não foi possível processar sua mensagem: ${errorMessage}`,
        variant: "destructive",
      });

      // Adicionar mensagem de erro ao chat
      const errorResponse: ChatMessage = {
        role: 'assistant',
        content: `Desculpe, ocorreu um erro ao processar sua mensagem: ${errorMessage}\n\nVerifique se o servidor MCP está rodando em ${MCP_URL}`,
      };
      setHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
      <div className="w-full max-w-4xl h-[95vh] flex flex-col bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">Assistente IA Sibal</span>
                  <Badge variant="secondary" className={`text-xs border-white/30 ${
                    connectionStatus === 'connected' ? 'bg-green-500/20 text-green-100' :
                    connectionStatus === 'error' ? 'bg-red-500/20 text-red-100' :
                    'bg-yellow-500/20 text-yellow-100'
                  }`}>
                    {connectionStatus === 'connected' ? '✅ Conectado' :
                     connectionStatus === 'error' ? '❌ Desconectado' :
                     '⏳ Verificando...'}
                  </Badge>
                </div>
                <p className="text-sm text-blue-100 font-normal">
                  Especialista em licitações com MCP + Groq AI
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  Servidor: {MCP_URL}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {documentContext && (
            <div className="mt-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-blue-200" />
                <div className="min-w-0 flex-1">
                  <Badge variant="secondary" className="mb-1 bg-white/20 text-white border-white/30 text-xs">
                    {documentContext.type}
                  </Badge>
                  <p className="text-sm font-medium text-white truncate">{documentContext.title}</p>
                  <p className="text-xs text-blue-200">Documento carregado para análise</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                {connectionStatus === 'error' && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <X className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Servidor MCP Desconectado</p>
                        <p className="text-sm text-red-600">
                          Não foi possível conectar com o servidor em {MCP_URL}
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                          Execute: cd mcp-server && npm run dev
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Database className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Assistente IA Especializado
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                      Sistema de IA com conhecimento especializado em licitações públicas do Brasil.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch("Como funciona o processo licitatório no Brasil?")}
                        disabled={isLoading || connectionStatus === 'error'}
                        className="justify-start h-auto p-3 text-left"
                      >
                        <div className="text-left">
                          <div className="font-medium text-sm">Processo Licitatório</div>
                          <div className="text-xs text-gray-500">Como funciona no Brasil?</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch("Quais são os tipos de modalidades de licitação?")}
                        disabled={isLoading || connectionStatus === 'error'}
                        className="justify-start h-auto p-3 text-left"
                      >
                        <div className="text-left">
                          <div className="font-medium text-sm">Modalidades</div>
                          <div className="text-xs text-gray-500">Tipos de licitação</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch("Busque licitações de drones com valor acima de R$ 1 milhão no DF")}
                        disabled={isLoading || connectionStatus === 'error'}
                        className="justify-start h-auto p-3 text-left"
                      >
                        <div className="text-left">
                          <div className="font-medium text-sm">Busca Avançada</div>
                          <div className="text-xs text-gray-500">Drones &gt; R$ 1 mi no DF</div>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch("Explique sobre a Lei 14.133/21 e suas principais mudanças")}
                        disabled={isLoading || connectionStatus === 'error'}
                        className="justify-start h-auto p-3 text-left"
                      >
                        <div className="text-left">
                          <div className="font-medium text-sm">Nova Lei</div>
                          <div className="text-xs text-gray-500">Lei 14.133/21</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((message, index) => (
                      <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.role === 'assistant' && (
                          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shrink-0">
                            <Database className="h-4 w-4 text-blue-700" />
                          </div>
                        )}
                        <div className={`max-w-[80%] p-3 rounded-2xl break-words overflow-wrap-anywhere ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                            : 'bg-gray-50 text-gray-900 border border-gray-200'
                        }`}>
                          <p className="whitespace-pre-wrap leading-relaxed text-sm break-words hyphens-auto">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2 flex items-center gap-1">
                            {message.role === 'assistant' && <Database className="h-3 w-3" />}
                            {new Date().toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shrink-0">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shrink-0">
                          <Database className="h-4 w-4 text-blue-700" />
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600">Processando com IA...</span>
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
          
          {/* Input Area */}
          <div className="p-4 bg-gray-50 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Faça uma pergunta sobre licitações..."
                disabled={isLoading || connectionStatus === 'error'}
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim() || connectionStatus === 'error'}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
              <Database className="h-3 w-3 mr-1" />
              {connectionStatus === 'connected' ? 'Sistema ativo - MCP + Groq AI' :
               connectionStatus === 'error' ? 'Sistema desconectado - Verifique o servidor MCP' :
               'Verificando conexão...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
