import React, { useState, useEffect } from 'react';
import { useSupabaseMcp } from '@/hooks/useSupabaseMcp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Brain, List, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}

interface Licitacao {
  id: string;
  objeto: string;
  valor?: number;
  prazo?: string;
  resumo_ia?: string;
  raw_data?: any;
  criado_em: string;
  atualizado_em: string;
}

export function McpDemo() {
  const { 
    loading, 
    error, 
    getLicitacoes, 
    createLicitacao, 
    analizarLicitacao, 
    getToolsList,
    getStats
  } = useSupabaseMcp();
  
  const { toast } = useToast();
  const [tools, setTools] = useState<Tool[]>([]);
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedLicitacao, setSelectedLicitacao] = useState<string>('');
  const [novaLicitacao, setNovaLicitacao] = useState({
    objeto: '',
    valor: '',
    prazo: ''
  });
  const [textoAnalise, setTextoAnalise] = useState('');

  // Carregar ferramentas disponíveis
  useEffect(() => {
    const loadTools = async () => {
      try {
        const toolsList = await getToolsList();
        setTools(toolsList);
      } catch (err) {
        console.error('Erro ao carregar ferramentas:', err);
      }
    };
    loadTools();
  }, [getToolsList]);

  // Carregar licitações
  const handleLoadLicitacoes = async () => {
    try {
      const data = await getLicitacoes();
      setLicitacoes(Array.isArray(data) ? data : [data]);
      toast({
        title: "Sucesso",
        description: `${Array.isArray(data) ? data.length : 1} licitação(ões) carregada(s)`
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao carregar licitações",
        variant: "destructive"
      });
    }
  };

  // Criar nova licitação
  const handleCreateLicitacao = async () => {
    if (!novaLicitacao.objeto.trim()) {
      toast({
        title: "Erro",
        description: "Objeto da licitação é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const data = await createLicitacao({
        objeto: novaLicitacao.objeto,
        valor: novaLicitacao.valor ? parseFloat(novaLicitacao.valor) : undefined,
        prazo: novaLicitacao.prazo || undefined
      });
      
      setLicitacoes(prev => [data, ...prev]);
      setNovaLicitacao({ objeto: '', valor: '', prazo: '' });
      
      toast({
        title: "Sucesso",
        description: "Licitação criada com sucesso"
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao criar licitação",
        variant: "destructive"
      });
    }
  };

  // Analisar licitação com IA
  const handleAnalyzeLicitacao = async () => {
    if (!selectedLicitacao || !textoAnalise.trim()) {
      toast({
        title: "Erro",
        description: "Selecione uma licitação e forneça o texto para análise",
        variant: "destructive"
      });
      return;
    }

    try {
      const data = await analizarLicitacao(selectedLicitacao, textoAnalise);
      
      // Atualizar a licitação na lista
      setLicitacoes(prev => 
        prev.map(l => l.id === selectedLicitacao ? data : l)
      );
      
      setTextoAnalise('');
      
      toast({
        title: "Sucesso",
        description: "Análise IA concluída"
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha na análise IA",
        variant: "destructive"
      });
    }
  };

  // Carregar estatísticas
  const handleLoadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
      toast({
        title: "Sucesso",
        description: "Estatísticas carregadas"
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao carregar estatísticas",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demonstração MCP Server</h1>
          <p className="text-muted-foreground mt-2">
            Teste as funcionalidades do servidor MCP (Model Context Protocol)
          </p>
        </div>
        <Badge variant={error ? "destructive" : "default"}>
          {error ? "Erro" : "Conectado"}
        </Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Ferramentas Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Ferramentas MCP Disponíveis
          </CardTitle>
          <CardDescription>
            Lista das ferramentas disponíveis no servidor MCP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {tools.map((tool, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="font-medium">{tool.name}</div>
                <div className="text-sm text-muted-foreground">{tool.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gerenciar Licitações */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Listar Licitações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Licitações
            </CardTitle>
            <CardDescription>
              Visualizar licitações do banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleLoadLicitacoes} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Carregar Licitações
            </Button>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {licitacoes.map((licitacao) => (
                <div key={licitacao.id} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">{licitacao.objeto}</div>
                  <div className="text-xs text-muted-foreground">
                    ID: {licitacao.id}
                  </div>
                  {licitacao.valor && (
                    <div className="text-xs text-green-600">
                      Valor: R$ {licitacao.valor.toLocaleString()}
                    </div>
                  )}
                  {licitacao.resumo_ia && (
                    <Badge variant="secondary" className="mt-1">
                      Analisado por IA
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Criar Nova Licitação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Licitação
            </CardTitle>
            <CardDescription>
              Criar uma nova licitação no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Objeto da licitação"
              value={novaLicitacao.objeto}
              onChange={(e) => setNovaLicitacao(prev => ({ ...prev, objeto: e.target.value }))}
            />
            <Input
              placeholder="Valor estimado (opcional)"
              type="number"
              value={novaLicitacao.valor}
              onChange={(e) => setNovaLicitacao(prev => ({ ...prev, valor: e.target.value }))}
            />
            <Input
              placeholder="Prazo de execução (opcional)"
              value={novaLicitacao.prazo}
              onChange={(e) => setNovaLicitacao(prev => ({ ...prev, prazo: e.target.value }))}
            />
            <Button 
              onClick={handleCreateLicitacao} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Criar Licitação
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Análise com IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Análise com IA
          </CardTitle>
          <CardDescription>
            Analisar licitação usando inteligência artificial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <select 
            className="w-full p-2 border rounded-md"
            value={selectedLicitacao}
            onChange={(e) => setSelectedLicitacao(e.target.value)}
          >
            <option value="">Selecione uma licitação</option>
            {licitacoes.map((licitacao) => (
              <option key={licitacao.id} value={licitacao.id}>
                {licitacao.objeto.substring(0, 50)}...
              </option>
            ))}
          </select>
          
          <Textarea
            placeholder="Cole aqui o texto do edital para análise..."
            value={textoAnalise}
            onChange={(e) => setTextoAnalise(e.target.value)}
            rows={4}
          />
          
          <Button 
            onClick={handleAnalyzeLicitacao} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Analisar com IA
          </Button>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas do Sistema</CardTitle>
          <CardDescription>
            Métricas e estatísticas do sistema de licitações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLoadStats} 
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Carregar Estatísticas
          </Button>
          
          {stats && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <pre className="text-sm">{JSON.stringify(stats, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}