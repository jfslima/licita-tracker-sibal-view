import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import sharp from 'sharp';

export interface ProcessedDocument {
  text: string;
  metadata: {
    pages?: number;
    fileSize: number;
    fileName: string;
    fileType: string;
    processingTime: number;
    confidence?: number;
  };
  structuredData?: {
    tables?: Record<string, unknown>[];
    images?: string[];
    headers?: string[];
    sections?: { title: string; content: string }[];
  };
  analysis?: {
    keyTerms: string[];
    entities: string[];
    summary: string;
    riskLevel: 'low' | 'medium' | 'high';
    opportunities: string[];
  };
}

export class DocumentProcessor {
  private static instance: DocumentProcessor;
  
  public static getInstance(): DocumentProcessor {
    if (!DocumentProcessor.instance) {
      DocumentProcessor.instance = new DocumentProcessor();
    }
    return DocumentProcessor.instance;
  }

  async processFile(file: File): Promise<ProcessedDocument> {
    const startTime = Date.now();
    const fileType = this.getFileType(file);
    
    try {
      let result: ProcessedDocument;
      
      switch (fileType) {
        case 'pdf':
          result = await this.processPDF(file);
          break;
        case 'docx':
        case 'doc':
          result = await this.processWord(file);
          break;
        case 'xlsx':
        case 'xls':
          result = await this.processExcel(file);
          break;
        case 'image':
          result = await this.processImage(file);
          break;
        case 'txt':
          result = await this.processText(file);
          break;
        default:
          throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
      }
      
      const processingTime = Date.now() - startTime;
      result.metadata.processingTime = processingTime;
      result.metadata.fileName = file.name;
      result.metadata.fileSize = file.size;
      result.metadata.fileType = fileType;
      
      // Adicionar análise inteligente
      result.analysis = await this.analyzeContent(result.text);
      
      return result;
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      throw new Error(`Falha no processamento: ${error.message}`);
    }
  }

  private async processPDF(file: File): Promise<ProcessedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(arrayBuffer));
    
    return {
      text: data.text,
      metadata: {
        pages: data.numpages,
        fileSize: file.size,
        fileName: file.name,
        fileType: 'pdf',
        processingTime: 0
      },
      structuredData: {
        sections: this.extractSections(data.text)
      }
    };
  }

  private async processWord(file: File): Promise<ProcessedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return {
      text: result.value,
      metadata: {
        fileSize: file.size,
        fileName: file.name,
        fileType: 'docx',
        processingTime: 0
      },
      structuredData: {
        sections: this.extractSections(result.value)
      }
    };
  }

  private async processExcel(file: File): Promise<ProcessedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    let allText = '';
    const tables: Record<string, unknown>[] = [];
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      tables.push({
        sheetName,
        data: jsonData
      });
      
      // Converter para texto
      const sheetText = XLSX.utils.sheet_to_csv(worksheet);
      allText += `\n\n=== ${sheetName} ===\n${sheetText}`;
    });
    
    return {
      text: allText,
      metadata: {
        fileSize: file.size,
        fileName: file.name,
        fileType: 'xlsx',
        processingTime: 0
      },
      structuredData: {
        tables
      }
    };
  }

  private async processImage(file: File): Promise<ProcessedDocument> {
    // Otimizar imagem para OCR
    const arrayBuffer = await file.arrayBuffer();
    const optimizedBuffer = await sharp(Buffer.from(arrayBuffer))
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .normalize()
      .png()
      .toBuffer();
    
    // Executar OCR
    const { data: { text, confidence } } = await Tesseract.recognize(
      optimizedBuffer,
      'por',
      {
        logger: m => console.log(m)
      }
    );
    
    return {
      text,
      metadata: {
        fileSize: file.size,
        fileName: file.name,
        fileType: 'image',
        processingTime: 0,
        confidence
      }
    };
  }

  private async processText(file: File): Promise<ProcessedDocument> {
    const text = await file.text();
    
    return {
      text,
      metadata: {
        fileSize: file.size,
        fileName: file.name,
        fileType: 'txt',
        processingTime: 0
      },
      structuredData: {
        sections: this.extractSections(text)
      }
    };
  }

  private extractSections(text: string): { title: string; content: string }[] {
    const sections: { title: string; content: string }[] = [];
    
    // Padrões comuns em editais
    const sectionPatterns = [
      /(?:^|\n)\s*(?:CAPÍTULO|SEÇÃO|ITEM|CLÁUSULA)\s+([IVX\d.]+)\s*[-–—]?\s*(.+?)(?=\n\s*(?:CAPÍTULO|SEÇÃO|ITEM|CLÁUSULA)|$)/gims,
      /(?:^|\n)\s*(\d+\.\d*\s*.+?)\n([\s\S]*?)(?=\n\s*\d+\.\d*|$)/gims,
      /(?:^|\n)\s*([A-Z][A-Z\s]{10,})\s*\n([\s\S]*?)(?=\n\s*[A-Z][A-Z\s]{10,}|$)/gims
    ];
    
    for (const pattern of sectionPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const title = match[1]?.trim() || 'Seção';
        const content = match[2]?.trim() || '';
        
        if (content.length > 50) {
          sections.push({ title, content });
        }
      }
    }
    
    return sections;
  }

  private async analyzeContent(text: string): Promise<ProcessedDocument['analysis']> {
    // Análise básica de conteúdo
    const keyTerms = this.extractKeyTerms(text);
    const entities = this.extractEntities(text);
    const riskLevel = this.assessRiskLevel(text);
    const opportunities = this.identifyOpportunities(text);
    const summary = this.generateSummary(text);
    
    return {
      keyTerms,
      entities,
      summary,
      riskLevel,
      opportunities
    };
  }

  private extractKeyTerms(text: string): string[] {
    const licitationTerms = [
      'pregão eletrônico', 'concorrência', 'tomada de preços', 'convite',
      'registro de preços', 'ata de registro', 'proposta comercial',
      'habilitação', 'documentação', 'certidão', 'atestado',
      'valor estimado', 'lance', 'disputa', 'adjudicação',
      'homologação', 'recurso', 'impugnação', 'esclarecimento'
    ];
    
    const foundTerms = licitationTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );
    
    return foundTerms;
  }

  private extractEntities(text: string): string[] {
    const entities: string[] = [];
    
    // CNPJ
    const cnpjPattern = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g;
    const cnpjs = text.match(cnpjPattern) || [];
    entities.push(...cnpjs);
    
    // CPF
    const cpfPattern = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;
    const cpfs = text.match(cpfPattern) || [];
    entities.push(...cpfs);
    
    // Valores monetários
    const valuePattern = /R\$\s*[\d.,]+/g;
    const values = text.match(valuePattern) || [];
    entities.push(...values);
    
    // Datas
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{4}/g;
    const dates = text.match(datePattern) || [];
    entities.push(...dates);
    
    return [...new Set(entities)];
  }

  private assessRiskLevel(text: string): 'low' | 'medium' | 'high' {
    const riskIndicators = [
      'exclusivo', 'específico', 'marca', 'modelo',
      'experiência mínima', 'atestado específico',
      'prazo reduzido', 'documentação complexa'
    ];
    
    const riskCount = riskIndicators.filter(indicator => 
      text.toLowerCase().includes(indicator.toLowerCase())
    ).length;
    
    if (riskCount >= 4) return 'high';
    if (riskCount >= 2) return 'medium';
    return 'low';
  }

  private identifyOpportunities(text: string): string[] {
    const opportunities: string[] = [];
    
    if (text.toLowerCase().includes('micro') || text.toLowerCase().includes('pequena empresa')) {
      opportunities.push('Benefícios para ME/EPP');
    }
    
    if (text.toLowerCase().includes('registro de preços')) {
      opportunities.push('Sistema de Registro de Preços');
    }
    
    if (text.toLowerCase().includes('pregão eletrônico')) {
      opportunities.push('Modalidade Pregão Eletrônico');
    }
    
    return opportunities;
  }

  private generateSummary(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const firstSentences = sentences.slice(0, 3).join('. ');
    
    return firstSentences.length > 200 
      ? firstSentences.substring(0, 200) + '...'
      : firstSentences;
  }

  private getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'docx';
      case 'xls':
      case 'xlsx':
        return 'xlsx';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return 'image';
      case 'txt':
        return 'txt';
      default:
        return 'unknown';
    }
  }
}

export const documentProcessor = DocumentProcessor.getInstance();