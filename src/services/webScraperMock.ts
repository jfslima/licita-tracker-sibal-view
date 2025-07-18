// Mock do WebScraper para uso no frontend
export interface ScrapingResult {
  url: string;
  title: string;
  content: string;
  metadata: {
    timestamp: Date;
    statusCode?: number;
    loadTime: number;
    wordCount: number;
  };
  links: string[];
  images: string[];
  tables?: Record<string, unknown>[];
  forms?: Record<string, unknown>[];
}

export interface ScrapingOptions {
  waitForSelector?: string;
  timeout?: number;
  screenshot?: boolean;
  pdf?: boolean;
  extractTables?: boolean;
  extractForms?: boolean;
  userAgent?: string;
  viewport?: { width: number; height: number };
  headers?: Record<string, string>;
}

export class WebScraperMock {
  private static instance: WebScraperMock;
  
  public static getInstance(): WebScraperMock {
    if (!WebScraperMock.instance) {
      WebScraperMock.instance = new WebScraperMock();
    }
    return WebScraperMock.instance;
  }

  async initialize(): Promise<void> {
    console.log('WebScraper Mock inicializado (frontend)');
  }

  async scrapeUrl(url: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    console.warn('WebScraper não disponível no frontend. Retornando dados mock.');
    
    return {
      url,
      title: 'Título Mock - WebScraper não disponível no frontend',
      content: 'Conteúdo mock. O web scraping real só está disponível no backend.',
      metadata: {
        timestamp: new Date(),
        statusCode: 200,
        loadTime: 1000,
        wordCount: 10
      },
      links: [],
      images: [],
      tables: options.extractTables ? [] : undefined,
      forms: options.extractForms ? [] : undefined
    };
  }

  async scrapeMultipleUrls(urls: string[], options: ScrapingOptions = {}): Promise<ScrapingResult[]> {
    console.warn('WebScraper não disponível no frontend. Retornando dados mock.');
    
    return urls.map(url => ({
      url,
      title: `Título Mock para ${url}`,
      content: 'Conteúdo mock. O web scraping real só está disponível no backend.',
      metadata: {
        timestamp: new Date(),
        statusCode: 200,
        loadTime: 1000,
        wordCount: 10
      },
      links: [],
      images: [],
      tables: options.extractTables ? [] : undefined,
      forms: options.extractForms ? [] : undefined
    }));
  }

  async searchLicitacoes(searchTerm: string, maxPages: number = 3): Promise<ScrapingResult[]> {
    console.warn('Busca de licitações não disponível no frontend. Retornando dados mock.');
    
    return [
      {
        url: 'https://pncp.gov.br/mock',
        title: `Resultados mock para: ${searchTerm}`,
        content: `Busca mock por "${searchTerm}". O web scraping real só está disponível no backend.`,
        metadata: {
          timestamp: new Date(),
          statusCode: 200,
          loadTime: 2000,
          wordCount: 15
        },
        links: [],
        images: [],
        tables: [],
        forms: []
      }
    ];
  }

  async monitorPage(url: string, checkInterval: number = 60000): Promise<void> {
    console.warn(`Monitoramento de ${url} não disponível no frontend.`);
  }

  async close(): Promise<void> {
    console.log('WebScraper Mock fechado');
  }

  async cleanup(): Promise<void> {
    console.log('WebScraper Mock limpo');
  }
}

// Instância singleton mock
export const webScraperMock = WebScraperMock.getInstance();