import React, { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface DocumentAnalysis {
  title?: string
  agency?: string
  uf?: string
  modality?: string
  value_estimated?: string
  deadline_days?: number
  summary?: string
  risks?: string[]
  fit_score?: number
  key_dates?: {
    site_visit?: string | null
    proposal?: string | null
    auction?: string | null
  }
  sources?: string[]
}

interface DocumentUploadProps {
  onAnalysisComplete?: (analysis: DocumentAnalysis, extractedText: string) => void
}

export function DocumentUpload({ onAnalysisComplete }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setAnalysis(null)
    setUploading(true)
    setProgress(0)

    try {
      console.log('Starting file upload:', file.name, file.size)

      // Verificar tipo de arquivo
      const allowedTypes = ['.pdf', '.txt', '.doc', '.docx']
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
      
      if (!allowedTypes.includes(fileExtension)) {
        throw new Error(`Tipo de arquivo não suportado. Tipos aceitos: ${allowedTypes.join(', ')}`)
      }

      // Verificar tamanho (máximo 10MB)
      const maxSize = 10 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 10MB')
      }

      setProgress(20)

      // Fazer upload para o Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `documentos/${fileName}`

      console.log('Uploading to:', filePath)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos-editais')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`Erro no upload: ${uploadError.message}`)
      }

      setProgress(50)
      console.log('Upload successful:', uploadData)

      // Obter URL pública do arquivo
      const { data: urlData } = supabase.storage
        .from('documentos-editais')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Erro ao obter URL do arquivo')
      }

      setUploading(false)
      setAnalyzing(true)
      setProgress(60)

      console.log('Starting document analysis for:', urlData.publicUrl)

      // Chamar a edge function para análise do documento
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('document-analyzer', {
        body: {
          fileUrl: urlData.publicUrl,
          fileName: file.name
        }
      })

      setProgress(90)

      if (analysisError) {
        console.error('Analysis error:', analysisError)
        throw new Error(`Erro na análise: ${analysisError.message}`)
      }

      if (!analysisData?.success) {
        console.error('Analysis failed:', analysisData)
        throw new Error(analysisData?.error || 'Erro na análise do documento')
      }

      setProgress(100)
      setAnalysis(analysisData.analysis)
      
      console.log('Analysis completed:', analysisData.analysis)

      toast({
        title: "Documento analisado com sucesso!",
        description: `Arquivo ${file.name} foi processado pela IA.`,
      })

      // Callback para componente pai
      if (onAnalysisComplete && analysisData.analysis) {
        onAnalysisComplete(analysisData.analysis, analysisData.extracted_text || '')
      }

    } catch (error) {
      console.error('Document upload/analysis error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)
      
      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setAnalyzing(false)
      setProgress(0)
    }
  }, [onAnalysisComplete])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload de Documento de Edital
        </CardTitle>
        <CardDescription>
          Faça upload de documentos de editais (PDF, DOC, DOCX, TXT) para análise automática pela IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input de arquivo */}
        <div className="flex items-center justify-center w-full">
          <label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Clique para enviar</span> ou arraste e solte
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT (máx. 10MB)</p>
            </div>
            <input 
              id="document-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={uploading || analyzing}
            />
          </label>
        </div>

        {/* Progress bar */}
        {(uploading || analyzing) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{uploading ? 'Fazendo upload...' : 'Analisando documento...'}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analysis results */}
        {analysis && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">Análise concluída!</p>
                {analysis.title && <p><strong>Título:</strong> {analysis.title}</p>}
                {analysis.agency && <p><strong>Órgão:</strong> {analysis.agency}</p>}
                {analysis.value_estimated && <p><strong>Valor:</strong> {analysis.value_estimated}</p>}
                {analysis.fit_score !== undefined && (
                  <p><strong>Score de Adequação:</strong> {analysis.fit_score}/100</p>
                )}
                {analysis.summary && (
                  <p><strong>Resumo:</strong> {analysis.summary}</p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}