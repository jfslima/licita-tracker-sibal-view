import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedMcp, DocumentProcessingResult } from '@/hooks/useAdvancedMcp';
import { 
  FileText, 
  Upload, 
  Download, 
  Table, 
  List, 
  Eye, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentProcessorProps {
  licitacaoId?: string;
}

export function DocumentProcessor({ licitacaoId }: DocumentProcessorProps) {
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentType, setDocumentType] = useState<'edital' | 'anexo' | 'ata' | 'resultado'>('edital');
  const [extractTables, setExtractTables] = useState(true);
  const [extractRequirements, setExtractRequirements] = useState(true);
  const [processingResult, setProcessingResult] = useState<DocumentProcessingResult | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  
  const { processDocument, loading } = useAdvancedMcp();
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simular upload e obter URL
      const url = URL.createObjectURL(file);
      setDocumentUrl(url);
      toast({
        title: "Arquivo Carregado",
        description: `${file.name} pronto para processamento.`,
      });
    }
  }, [toast]);

  const handleProcessDocument = async () => {
    if (!documentUrl) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um documento primeiro.",
        variant: "destructive",
      });
      return;
    }

    console.log('Iniciando processamento do documento:', {
      documentUrl,
      documentType,
      licitacaoId,
      extractTables,
      extractRequirements
    });

    try {
      toast({
        title: "Processando...",
        description: "Iniciando processamento do documento.",
      });

      const result = await processDocument(
        documentUrl,
        documentType,
        licitacaoId,
        {
          extractTables,
          extractRequirements
        }
      );
      
      console.log('Resultado do processamento:', result);
      setProcessingResult(result);
      setActiveTab('results');
      
      toast({
        title: "Sucesso!",
        description: "Documento processado com sucesso.",
      });
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro no Processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido ao processar documento",
        variant: "destructive",
      });
    }
  };

  const downloadExtractedData = () => {
    if (!processingResult) return;
    
    const data = {
      extractedText: processingResult.extractedText,
      tables: processingResult.tables,
      requirements: processingResult.requirements,
      metadata: processingResult.metadata
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documento_processado_${documentType}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Processamento Inteligente de Documentos
          </CardTitle>
          <p className="text-sm text-gray-600">
            Extraia informações estruturadas de editais, anexos e outros documentos de licitação
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload & Configuração</TabsTrigger>
          <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração do Processamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload de arquivo */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Selecionar Documento</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Carregar
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Formatos suportados: PDF, Word (.doc, .docx), Excel (.xls, .xlsx)
                </p>
              </div>

              {/* URL alternativa */}
              <div className="space-y-2">
                <Label htmlFor="document-url">Ou inserir URL do documento</Label>
                <Input
                  id="document-url"
                  placeholder="https://exemplo.com/documento.pdf"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDocumentUrl('https://httpbin.org/json')}
                  >
                    Teste JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDocumentUrl('https://httpbin.org/html')}
                  >
                    Teste HTML
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDocumentUrl('teste-documento-local')}
                  >
                    Teste Local
                  </Button>
                </div>
              </div>

              {/* Tipo de documento */}
              <div className="space-y-2">
                <Label>Tipo de Documento</Label>
                <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edital">Edital</SelectItem>
                    <SelectItem value="anexo">Anexo</SelectItem>
                    <SelectItem value="ata">Ata</SelectItem>
                    <SelectItem value="resultado">Resultado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Opções de extração */}
              <div className="space-y-3">
                <Label>Opções de Extração</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="extract-tables" 
                      checked={extractTables}
                      onCheckedChange={(checked) => setExtractTables(checked as boolean)}
                    />
                    <Label htmlFor="extract-tables" className="text-sm">
                      Extrair tabelas e dados estruturados
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="extract-requirements" 
                      checked={extractRequirements}
                      onCheckedChange={(checked) => setExtractRequirements(checked as boolean)}
                    />
                    <Label htmlFor="extract-requirements" className="text-sm">
                      Identificar requisitos técnicos e legais
                    </Label>
                  </div>
                </div>
              </div>

              {/* Botão de processamento */}
              <Button 
                onClick={handleProcessDocument}
                disabled={loading || !documentUrl}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando Documento...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Processar Documento
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Pré-visualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documentUrl ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Documento selecionado:</p>
                    <p className="text-sm text-gray-600 break-all">{documentUrl}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipo:</span> {documentType}
                    </div>
                    <div>
                      <span className="font-medium">Extrair tabelas:</span> {extractTables ? 'Sim' : 'Não'}
                    </div>
                    <div>
                      <span className="font-medium">Extrair requisitos:</span> {extractRequirements ? 'Sim' : 'Não'}
                    </div>
                    <div>
                      <span className="font-medium">Licitação ID:</span> {licitacaoId || 'Não vinculado'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum documento selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {processingResult ? (
            <>
              {/* Resumo dos resultados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Processamento Concluído
                    </span>
                    <Button onClick={downloadExtractedData} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Dados
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {processingResult.metadata.pages}
                      </div>
                      <div className="text-gray-600">Páginas</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {processingResult.tables.length}
                      </div>
                      <div className="text-gray-600">Tabelas</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {processingResult.requirements.length}
                      </div>
                      <div className="text-gray-600">Requisitos</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {processingResult.metadata.size}
                      </div>
                      <div className="text-gray-600">Tamanho</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Texto extraído */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Texto Extraído
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg text-sm">
                    <pre className="whitespace-pre-wrap">
                      {processingResult.extractedText}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Tabelas extraídas */}
              {processingResult.tables.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Table className="h-5 w-5" />
                      Tabelas Identificadas ({processingResult.tables.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {processingResult.tables.map((table, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Tabela {index + 1}</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse border border-gray-300">
                              <tbody>
                                {table.rows?.map((row: any[], rowIndex: number) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                      <td key={cellIndex} className="border border-gray-300 p-2">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Requisitos identificados */}
              {processingResult.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <List className="h-5 w-5" />
                      Requisitos Identificados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {processingResult.requirements.map((req, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{req}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Nenhum resultado disponível</p>
                <p className="text-sm text-gray-400">Processe um documento primeiro</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}