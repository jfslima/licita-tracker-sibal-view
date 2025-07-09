
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Search, FileText } from 'lucide-react';
import { useMcp } from '@/hooks/useMcp';

export function McpTestPanel() {
  const { loading, error, callTool, listResources } = useMcp();
  const [text, setText] = useState('');
  const [companyProfile, setCompanyProfile] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState<string>('');
  const [licitations, setLicitations] = useState<any[]>([]);

  const handleSummary = async () => {
    if (!text.trim()) return;
    
    const summary = await callTool('bid_summary', { text });
    if (summary) {
      setResult(summary);
    }
  };

  const handleAnalysis = async () => {
    if (!text.trim() || !companyProfile.trim()) return;
    
    const analysis = await callTool('bid_analysis', { text, company_profile: companyProfile });
    if (analysis) {
      setResult(analysis);
    }
  };

  const handleSearch = async () => {
    const resources = await listResources('licitations', searchQuery);
    if (resources) {
      setLicitations(resources);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Painel de Teste MCP</h2>
        <Badge variant="outline" className="ml-2">
          {loading ? 'Processando...' : 'Pronto'}
        </Badge>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Entrada */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Texto do Edital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Cole aqui o texto do edital para análise..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfil da Empresa (para análise)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Descreva o perfil da empresa: porte, área de atuação, experiência..."
                value={companyProfile}
                onChange={(e) => setCompanyProfile(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              onClick={handleSummary} 
              disabled={loading || !text.trim()}
              className="flex-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Gerar Resumo
            </Button>
            <Button 
              onClick={handleAnalysis} 
              disabled={loading || !text.trim() || !companyProfile.trim()}
              variant="outline"
              className="flex-1"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Analisar Viabilidade
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Licitações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite termos para busca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel de Resultados */}
        <div className="space-y-4">
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Resultado da Análise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {licitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Licitações Encontradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {licitations.map((licitation, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50">
                      <h4 className="font-medium">{licitation.title}</h4>
                      <p className="text-sm text-gray-600">CNPJ: {licitation.cnpj}</p>
                      <p className="text-sm text-gray-600">Objeto: {licitation.object}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
