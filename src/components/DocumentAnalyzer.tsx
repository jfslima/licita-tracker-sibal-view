import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Upload,
  FileText,
  Image,
  File,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Eye,
  Brain,
  Search,
  Target,
  TrendingUp,
  Shield,
  DollarSign,
  Calendar,
  Users,
  Trash2,
  RefreshCw,
  Zap,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  FileImage,
  X
} from 'lucide-react';
import { documentProcessor, ProcessedDocument } from '@/services/documentProcessor';
import { advancedLicitationAnalyzer, LicitationAnalysis, CompanyProfile } from '@/services/advancedLicitationAnalyzer';

interface DocumentAnalyzerProps {
  onAnalysisComplete?: (analysis: LicitationAnalysis) => void;
  companyProfile?: CompanyProfile;
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  processedDocument?: ProcessedDocument;
  analysis?: LicitationAnalysis;
  error?: string;
}

export const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({
  onAnalysisComplete,
  companyProfile
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>('comprehensive');
  const [customPrompt, setCustomPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process each file
    for (const uploadedFile of newFiles) {
      try {
        // Update status to processing
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'processing', progress: 25 }
            : f
        ));

        // Process document
        const processedDocument = await documentProcessor.processFile(uploadedFile.file);
        
        // Update with processed document
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, processedDocument, progress: 75 }
            : f
        ));

        // Analyze document if it's a bidding document
        if (processedDocument.analysis && 
            (processedDocument.text.toLowerCase().includes('licitação') || 
             processedDocument.text.toLowerCase().includes('pregão'))) {
          
          const analysis = await advancedLicitationAnalyzer.analyzeLicitation(
            processedDocument,
            companyProfile
          );

          // Update with analysis
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, analysis, status: 'completed', progress: 100 }
              : f
          ));

          if (onAnalysisComplete) {
            onAnalysisComplete(analysis);
          }
        } else {
          // Mark as completed without analysis
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          ));
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Erro desconhecido' }
            : f
        ));
      }
    }
  }, [companyProfile, onAnalysisComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const reprocessFile = async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'processing', progress: 0, error: undefined }
        : f
    ));

    try {
      const processedDocument = await documentProcessor.processFile(file.file);
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, processedDocument, progress: 75 }
          : f
      ));

      if (processedDocument.analysis && 
          (processedDocument.text.toLowerCase().includes('licitação') || 
           processedDocument.text.toLowerCase().includes('pregão'))) {
        
        const analysis = await advancedLicitationAnalyzer.analyzeLicitation(
          processedDocument,
          companyProfile
        );

        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, analysis, status: 'completed', progress: 100 }
            : f
        ));
      } else {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'completed', progress: 100 }
            : f
        ));
      }
    } catch (error) {
      console.error('Error reprocessing file:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Erro desconhecido' }
          : f
      ));
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    if (type.includes('image')) return <FileImage className="h-6 w-6 text-blue-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    if (type.includes('word')) return <FileText className="h-6 w-6 text-blue-600" />;
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <Upload className="h-4 w-4 text-blue-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getViabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analisador de Documentos</h1>
          <p className="text-muted-foreground">
            Faça upload e analise documentos de licitação com IA avançada
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload de Arquivos</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.tiff"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Upload Area */}
      <Card
        className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Arraste arquivos aqui ou clique para fazer upload</h3>
          <p className="text-muted-foreground text-center mb-4">
            Suporte para PDF, Word, Excel, e imagens (JPG, PNG, TIFF)
            <br />
            Máximo de 10MB por arquivo
          </p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Selecionar Arquivos
          </Button>
        </CardContent>
      </Card>

      {/* Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Carregados</CardTitle>
            <CardDescription>
              {uploadedFiles.length} arquivo(s) • {uploadedFiles.filter(f => f.status === 'completed').length} processado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile) => (
                <div key={uploadedFile.id} className="flex items-center space-x-4 p-4 rounded-lg border">
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadedFile.file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{uploadedFile.file.name}</h4>
                      {getStatusIcon(uploadedFile.status)}
                      <Badge variant="outline">
                        {uploadedFile.status === 'uploading' && 'Enviando'}
                        {uploadedFile.status === 'processing' && 'Processando'}
                        {uploadedFile.status === 'completed' && 'Concluído'}
                        {uploadedFile.status === 'error' && 'Erro'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(uploadedFile.file.size)}</span>
                      {uploadedFile.processedDocument && (
                        <span>Tipo: {uploadedFile.processedDocument.metadata.fileType}</span>
                      )}
                    </div>
                    
                    {uploadedFile.status !== 'completed' && uploadedFile.status !== 'error' && (
                      <Progress value={uploadedFile.progress} className="mt-2" />
                    )}
                    
                    {uploadedFile.error && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{uploadedFile.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadedFile.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFile(uploadedFile)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    )}
                    
                    {uploadedFile.status === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reprocessFile(uploadedFile.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Tentar Novamente
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(uploadedFile.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Details */}
      {selectedFile && selectedFile.processedDocument && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Detalhes do Documento</CardTitle>
                <CardDescription>{selectedFile.file.name}</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                <TabsTrigger value="metadata">Metadados</TabsTrigger>
                <TabsTrigger value="analysis">Análise</TabsTrigger>
                {selectedFile.analysis && (
                  <TabsTrigger value="licitation">Licitação</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="content" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Texto Extraído</Label>
                    <ScrollArea className="h-64 w-full rounded-md border p-4">
                      <pre className="text-sm whitespace-pre-wrap">
                        {selectedFile.processedDocument.text}
                      </pre>
                    </ScrollArea>
                  </div>
                  
                  {selectedFile.processedDocument.structuredData?.tables && selectedFile.processedDocument.structuredData.tables.length > 0 && (
                    <div>
                      <Label>Tabelas Extraídas ({selectedFile.processedDocument.structuredData.tables.length})</Label>
                      <div className="space-y-2">
                        {selectedFile.processedDocument.structuredData.tables.map((table, index) => (
                          <Card key={index}>
                            <CardHeader>
                              <CardTitle className="text-sm">Tabela {index + 1}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-32">
                                <pre className="text-xs">{JSON.stringify(table, null, 2)}</pre>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="metadata" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Informações do Arquivo</Label>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nome:</strong> {selectedFile.processedDocument.metadata.fileName}</div>
                      <div><strong>Tamanho:</strong> {formatFileSize(selectedFile.processedDocument.metadata.fileSize)}</div>
                      <div><strong>Tipo:</strong> {selectedFile.processedDocument.metadata.fileType}</div>
                      <div><strong>Páginas:</strong> {selectedFile.processedDocument.metadata.pages || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Processamento</Label>
                    <div className="space-y-2 text-sm">
                      <div><strong>Tempo:</strong> {selectedFile.processedDocument.metadata.processingTime}ms</div>
                      {selectedFile.processedDocument.metadata.confidence && (
                        <div><strong>Confiança:</strong> {(selectedFile.processedDocument.metadata.confidence * 100).toFixed(1)}%</div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nível de Risco</Label>
                    <div className="space-y-2">
                      <Badge variant="outline" className={getCompetitionColor(selectedFile.processedDocument.analysis?.riskLevel || 'low')}>
                        {selectedFile.processedDocument.analysis?.riskLevel || 'Baixo'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Termos-chave</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedFile.processedDocument.analysis?.keyTerms?.slice(0, 10).map((term, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {term}
                        </Badge>
                      )) || <span className="text-sm text-muted-foreground">Nenhum termo identificado</span>}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Entidades Identificadas</Label>
                  <div className="grid grid-cols-1 gap-4 mt-2">
                    {selectedFile.processedDocument.analysis?.entities && selectedFile.processedDocument.analysis.entities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedFile.processedDocument.analysis.entities.slice(0, 10).map((entity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Nenhuma entidade identificada</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Resumo</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFile.processedDocument.analysis?.summary || 'Resumo não disponível'}
                  </p>
                </div>
                
                {selectedFile.processedDocument.analysis?.opportunities && selectedFile.processedDocument.analysis.opportunities.length > 0 && (
                  <div>
                    <Label>Oportunidades</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedFile.processedDocument.analysis.opportunities.map((opportunity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {opportunity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {selectedFile.analysis && (
                <TabsContent value="licitation" className="space-y-6">
                  {/* Viability Score */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Target className="h-4 w-4 mr-2" />
                          Viabilidade
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {selectedFile.analysis.viabilityScore}%
                        </div>
                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getViabilityColor(selectedFile.analysis.viabilityScore)}`}>
                          {selectedFile.analysis.viabilityScore >= 80 ? 'Alta' :
                           selectedFile.analysis.viabilityScore >= 60 ? 'Média' :
                           selectedFile.analysis.viabilityScore >= 40 ? 'Baixa' : 'Muito Baixa'}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Concorrência
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold capitalize">
                          {selectedFile.analysis.competitionLevel}
                        </div>
                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${getCompetitionColor(selectedFile.analysis.competitionLevel)}`}>
                          {selectedFile.analysis.competitionLevel === 'low' ? 'Baixa' :
                           selectedFile.analysis.competitionLevel === 'medium' ? 'Média' : 'Alta'}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Custo Estimado
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0
                          }).format(selectedFile.analysis.estimatedCost.min)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          até {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0
                          }).format(selectedFile.analysis.estimatedCost.max)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Requirements */}
                  <div>
                    <Label className="text-base font-semibold">Requisitos Identificados</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Técnicos</h4>
                        <ul className="space-y-1">
                          {selectedFile.analysis.requirements.technical.map((req, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Legais</h4>
                        <ul className="space-y-1">
                          {selectedFile.analysis.requirements.legal.map((req, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <Shield className="h-3 w-3 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div>
                    <Label className="text-base font-semibold">Cronograma</Label>
                    <div className="space-y-2 mt-2">
                      {selectedFile.analysis.timeline.map((event, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 rounded border">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{event.phase}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Risks and Opportunities */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-base font-semibold text-red-600">Riscos</Label>
                      <div className="space-y-2 mt-2">
                        {selectedFile.analysis.risks.map((risk, index) => (
                          <Alert key={index}>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              <strong>{risk.type}:</strong> {risk.description}
                              <div className="text-xs text-muted-foreground mt-1">
                                Severidade: {risk.severity}
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-base font-semibold text-green-600">Oportunidades</Label>
                      <div className="space-y-2 mt-2">
                        {selectedFile.analysis.opportunities.map((opportunity, index) => (
                          <Alert key={index} className="border-green-200">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-sm">
                              <strong>{opportunity.type}:</strong> {opportunity.description}
                              <div className="text-xs text-muted-foreground mt-1">
                                Impacto: {opportunity.impact}
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Recommendations */}
                  <div>
                    <Label className="text-base font-semibold">Recomendações</Label>
                    <div className="space-y-2 mt-2">
                      {selectedFile.analysis.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 rounded border-l-4 border-blue-500 bg-blue-50">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline">{rec.priority}</Badge>
                            <span className="text-sm font-medium">{rec.category}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentAnalyzer;