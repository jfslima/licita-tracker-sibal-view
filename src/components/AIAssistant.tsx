
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, Bot, User, Loader2, X, FileText, Sparkles, 
  Brain, BookOpen, AlertCircle, TrendingUp, Target,
  Download, Share2, Bookmark, History, Settings
} from 'lucide-react';
import { useGroqAI } from '@/hooks/useGroqAI';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  documentContext?: {
    text: string;
    type: string;
    title: string;
    data?: any;
  };
}

const aiModes = [
  { 
    id: 'consultant', 
    name: 'Consultor Especializado', 
    icon: Brain,
    description: 'Análise jurídica e estratégica',
    color: 'from-blue-600 to-blue-700'
  },
  { 
    id: 'analyzer', 
    name: 'Analisador de Documentos', 
    icon: FileText,
    description: 'Resumos e análises detalhadas',
    color: 'from-purple-600 to-purple-700'
  },
  { 
    id: 'teacher', 
    name: 'Professor de Licitações', 
    icon: BookOpen,
    description: 'Explicações educativas',
    color: 'from-green-600 to-green-700'
  },
  { 
    id: 'advisor', 
    name: 'Conselheiro Estratégico', 
    icon: Target,
    description: 'Orientações para participação',
    color: 'from-orange-600 to-orange-700'
  }
];

const quickActions = [
  { id: 'summarize', label: 'Resumir Documento', icon: Sparkles },
  { id: 'analyze', label: 'Análise Jurídica', icon: AlertCircle },
  { id: 'risks', label: 'Identificar Riscos', icon: TrendingUp },
  { id: 'timeline', label: 'Cronograma', icon: History },
];

export function AIAssistant({ isOpen, onClose, documentContext }: AIAssistantProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedMode, setSelectedMode] = useState('consultant');
  const [isExpanded, setIsExpanded] = useState(true);
  const { messages, isLoading, isStreaming, sendMessage, summarizeDocument, clearMessages } = useGroqAI();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage;
    setInputMessage('');
    
    const currentMode = aiModes.find(m => m.id === selectedMode);
    const modeContext = `Modo: ${currentMode?.name} - ${currentMode?.description}`;
    
    const context = documentContext ? 
      `${modeContext}\n\nDocumento: ${documentContext.title}\nTipo: ${documentContext.type}\nConteúdo: ${documentContext.text}` : 
      modeContext;

    await sendMessage(message, context);
  };

  const handleQuickAction = async (actionId: string) => {
    if (!documentContext) return;
    
    const actions = {
      summarize: `Faça um resumo executivo do documento "${documentContext.title}" destacando pontos principais, valores, prazos e requisitos.`,
      analyze: `Realize uma análise jurídica detalhada do documento "${documentContext.title}", identificando cláusulas importantes e aspectos legais relevantes.`,
      risks: `Identifique os principais riscos e pontos de atenção no documento "${documentContext.title}" para empresas interessadas em participar.`,
      timeline: `Crie um cronograma detalhado com todas as datas e prazos importantes mencionados no documento "${documentContext.title}".`
    };
    
    const actionMessage = actions[actionId as keyof typeof actions];
    if (actionMessage) {
      setInputMessage(actionMessage);
      await handleSendMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentMode = aiModes.find(m => m.id === selectedMode);
  const ModeIcon = currentMode?.icon || Brain;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className={`w-full transition-all duration-300 ${
        isExpanded ? 'max-w-6xl h-[90vh]' : 'max-w-4xl h-[80vh]'
      } flex flex-col shadow-2xl border-0 bg-white`}>
        
        {/* Header Avançado */}
        <CardHeader className={`pb-4 bg-gradient-to-r ${currentMode?.color} text-white rounded-t-lg relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 20 0 L 0 0 0 20" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)"/%3E%3C/svg%3E')] opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <ModeIcon className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">Assistente IA Sibal</h1>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-3 py-1">
                      Pro AI
                    </Badge>
                  </div>
                  <p className="text-sm text-white/90 font-medium">{currentMode?.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose} 
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Seletor de Modo */}
            <div className="mb-4">
              <Select value={selectedMode} onValueChange={setSelectedMode}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <SelectItem key={mode.id} value={mode.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{mode.name}</div>
                            <div className="text-xs text-gray-500">{mode.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Contexto do Documento */}
            {documentContext && (
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-white/80" />
                    <div>
                      <Badge variant="secondary" className="mb-1 bg-white/20 text-white border-white/30 text-xs">
                        {documentContext.type.toUpperCase()}
                      </Badge>
                      <p className="text-sm font-medium text-white">{documentContext.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={action.id}
                          variant="secondary"
                          size="sm"
                          onClick={() => handleQuickAction(action.id)}
                          disabled={isLoading}
                          className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs px-2 py-1"
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {action.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Área de Chat */}
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className={`p-8 bg-gradient-to-br ${currentMode?.color} rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center`}>
                  <ModeIcon className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Como posso te ajudar hoje?
                </h3>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                  Sou seu assistente especializado em licitações públicas. Posso analisar documentos, 
                  responder dúvidas legais e fornecer orientações estratégicas.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  {[
                    { q: "Como funciona o processo licitatório no Brasil?", cat: "Processos" },
                    { q: "Quais documentos preciso para participar?", cat: "Documentação" },
                    { q: "Como interpretar um edital complexo?", cat: "Análise" },
                    { q: "Quais são os prazos importantes?", cat: "Cronograma" }
                  ].map((item, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => {
                        setInputMessage(item.q);
                        handleSendMessage();
                      }}
                      disabled={isLoading}
                      className="h-auto p-4 text-left justify-start border-2 hover:border-blue-300 transition-all"
                    >
                      <div>
                        <div className="font-medium text-sm mb-1">{item.cat}</div>
                        <div className="text-xs text-gray-600">{item.q}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className={`p-3 bg-gradient-to-br ${currentMode?.color} rounded-xl shrink-0 shadow-lg`}>
                        <ModeIcon className="h-5 w-5 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[75%] p-4 rounded-2xl shadow-lg ${
                      message.role === 'user' 
                        ? `bg-gradient-to-r ${currentMode?.color} text-white` 
                        : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed text-sm">
                        {message.content}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
                        <p className="text-xs opacity-70 flex items-center gap-1">
                          {message.role === 'assistant' && <ModeIcon className="h-3 w-3" />}
                          {message.timestamp.toLocaleTimeString('pt-BR')}
                        </p>
                        {message.role === 'assistant' && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-70 hover:opacity-100">
                              <Bookmark className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-70 hover:opacity-100">
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className={`p-3 bg-gradient-to-br ${currentMode?.color} rounded-xl shrink-0 shadow-lg`}>
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isStreaming && (
                  <div className="flex gap-4 justify-start">
                    <div className={`p-3 bg-gradient-to-br ${currentMode?.color} rounded-xl shrink-0 shadow-lg`}>
                      <ModeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-lg">
                      <div className="flex items-center gap-3">
                        <Loader2 className={`h-4 w-4 animate-spin text-blue-600`} />
                        <span className="text-sm text-gray-600 font-medium">Analisando...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <Separator />
          
          {/* Input Avançado */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex gap-3 mb-3">
              <Textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Digite sua pergunta para o ${currentMode?.name}...`}
                disabled={isLoading}
                className="flex-1 min-h-[60px] max-h-[120px] resize-none border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                rows={2}
              />
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputMessage.trim()}
                  className={`bg-gradient-to-r ${currentMode?.color} hover:opacity-90 text-white px-6 py-3 h-auto rounded-xl shadow-lg transition-all duration-200`}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
                {documentContext && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction('summarize')}
                    disabled={isLoading}
                    className="px-3 py-2 h-auto"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {messages.length > 0 && (
              <div className="flex justify-between items-center">
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
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
