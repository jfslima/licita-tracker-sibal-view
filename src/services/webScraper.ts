// Importação condicional do Puppeteer apenas no ambiente Node.js
import type * as Puppeteer from 'puppeteer';
let puppeteer: typeof Puppeteer | null = null;
let puppeteerLoaded = false;

// Função para carregar o Puppeteer dinamicamente
async function loadPuppeteer() {
  if (puppeteerLoaded) return;
  
  // Verificar se estamos no ambiente Node.js
  if (typeof window === 'undefined' && typeof process !== 'undefined') {
    try {
      const puppeteerModule = await import('puppeteer');
      puppeteer = puppeteerModule as typeof Puppeteer;
      puppeteerLoaded = true;
    } catch (error) {
      console.warn('Puppeteer não disponível no ambiente atual:', error);
    }
  }
}

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

export class WebScraper {
  private static instance: WebScraper;
  private browser: Puppeteer.Browser | null = null;
  
  public static getInstance(): WebScraper {
    if (!WebScraper.instance) {
      WebScraper.instance = new WebScraper();
    }
    return WebScraper.instance;
  }

  async initialize(): Promise<void> {
    // Verificar se estamos no ambiente do navegador
    if (typeof window !== 'undefined') {
      throw new Error('WebScraper não pode ser usado no navegador. Use apenas no backend.');
    }
    
    await loadPuppeteer();
    
    if (!puppeteer) {
      throw new Error('Puppeteer não está disponível neste ambiente');
    }
    
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
  }

  async scrapeUrl(url: string, options: ScrapingOptions = {}): Promise<ScrapingResult> {
    await this.initialize();
    
    if (!this.browser) {
      throw new Error('Browser não inicializado');
    }

    const page = await this.browser.newPage();
    const startTime = Date.now();

    try {
      // Configurar viewport
      if (options.viewport) {
        await page.setViewport(options.viewport);
      }

      // Configurar user agent
      if (options.userAgent) {
        await page.setUserAgent(options.userAgent);
      }

      // Configurar headers
      if (options.headers) {
        await page.setExtraHTTPHeaders(options.headers);
      }

      // Navegar para a URL
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: options.timeout || 30000
      });

      // Aguardar seletor específico se fornecido
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.timeout || 10000
        });
      }

      // Extrair dados básicos
      const title = await page.title();
      const content = await page.evaluate(() => {
        // Remover scripts e estilos
        const scripts = document.querySelectorAll('script, style, noscript');
        scripts.forEach(el => el.remove());
        
        return document.body.innerText || '';
      });

      // Extrair links
      const links = await page.evaluate(() => {
        const linkElements = document.querySelectorAll('a[href]');
        return Array.from(linkElements).map(link => {
          const href = link.getAttribute('href');
          return href ? new URL(href, window.location.href).href : '';
        }).filter(href => href);
      });

      // Extrair imagens
      const images = await page.evaluate(() => {
        const imgElements = document.querySelectorAll('img[src]');
        return Array.from(imgElements).map(img => {
          const src = img.getAttribute('src');
          return src ? new URL(src, window.location.href).href : '';
        }).filter(src => src);
      });

      let tables: Record<string, unknown>[] = [];
      let forms: Record<string, unknown>[] = [];

      // Extrair tabelas se solicitado
      if (options.extractTables) {
        tables = await this.extractTables(page);
      }

      // Extrair formulários se solicitado
      if (options.extractForms) {
        forms = await this.extractForms(page);
      }

      // Screenshot se solicitado
      if (options.screenshot) {
        await page.screenshot({ 
          path: `screenshot-${Date.now()}.png`,
          fullPage: true 
        });
      }

      // PDF se solicitado
      if (options.pdf) {
        await page.pdf({ 
          path: `page-${Date.now()}.pdf`,
          format: 'A4' 
        });
      }

      const loadTime = Date.now() - startTime;

      return {
        url,
        title,
        content,
        metadata: {
          timestamp: new Date(),
          statusCode: response?.status(),
          loadTime,
          wordCount: content.split(/\s+/).length
        },
        links,
        images,
        tables: options.extractTables ? tables : undefined,
        forms: options.extractForms ? forms : undefined
      };

    } finally {
      await page.close();
    }
  }

  private async extractTables(page: Puppeteer.Page): Promise<Record<string, unknown>[]> {
    return await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      return Array.from(tables).map((table, index) => {
        const rows = table.querySelectorAll('tr');
        const data = Array.from(rows).map(row => {
          const cells = row.querySelectorAll('td, th');
          return Array.from(cells).map(cell => cell.textContent?.trim() || '');
        });
        
        return {
          index,
          headers: data[0] || [],
          rows: data.slice(1),
          rowCount: data.length - 1,
          columnCount: data[0]?.length || 0
        };
      }) as Record<string, unknown>[];
    });
  }

  private async extractForms(page: Puppeteer.Page): Promise<Record<string, unknown>[]> {
    return await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      return Array.from(forms).map((form, index) => {
        const inputs = form.querySelectorAll('input, select, textarea');
        const fields = Array.from(inputs).map(input => ({
          name: input.getAttribute('name') || '',
          type: input.getAttribute('type') || input.tagName.toLowerCase(),
          required: input.hasAttribute('required'),
          placeholder: input.getAttribute('placeholder') || ''
        }));
        
        return {
          index,
          action: form.getAttribute('action') || '',
          method: form.getAttribute('method') || 'GET',
          fields,
          fieldCount: fields.length
        };
      }) as Record<string, unknown>[];
    });
  }

  async scrapeMultipleUrls(urls: string[], options: ScrapingOptions = {}): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];
    
    for (const url of urls) {
      try {
        const result = await this.scrapeUrl(url, options);
        results.push(result);
        
        // Delay entre requisições para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Erro ao fazer scraping de ${url}:`, error);
        // Continuar com as próximas URLs mesmo se uma falhar
      }
    }
    
    return results;
  }

  async searchLicitacoes(searchTerm: string, maxPages: number = 3): Promise<ScrapingResult[]> {
    const results: ScrapingResult[] = [];
    
    // URLs de portais de licitação conhecidos
    const portals = [
      {
        name: 'Portal Nacional de Contratações Públicas',
        baseUrl: 'https://pncp.gov.br',
        searchUrl: `https://pncp.gov.br/app/editais?q=${encodeURIComponent(searchTerm)}`
      },
      {
        name: 'Compras Governamentais',
        baseUrl: 'https://www.gov.br/compras',
        searchUrl: `https://www.gov.br/compras/pt-br/acesso-a-informacao/licitacoes-e-contratos?q=${encodeURIComponent(searchTerm)}`
      }
    ];

    for (const portal of portals) {
      try {
        console.log(`Buscando em ${portal.name}...`);
        
        const result = await this.scrapeUrl(portal.searchUrl, {
          waitForSelector: 'body',
          timeout: 15000,
          extractTables: true,
          extractForms: true
        });
        
        results.push(result);
        
        // Delay entre portais
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Erro ao buscar em ${portal.name}:`, error);
      }
    }
    
    return results;
  }

  async monitorPage(url: string, checkInterval: number = 60000): Promise<void> {
    console.log(`Iniciando monitoramento de ${url}`);
    
    let lastContent = '';
    
    const check = async () => {
      try {
        const result = await this.scrapeUrl(url, { timeout: 10000 });
        
        if (lastContent && result.content !== lastContent) {
          console.log(`Mudança detectada em ${url}`);
          // Aqui você pode implementar notificações
          // Por exemplo, enviar email, webhook, etc.
        }
        
        lastContent = result.content;
      } catch (error) {
        console.error(`Erro no monitoramento de ${url}:`, error);
      }
    };
    
    // Primeira verificação
    await check();
    
    // Verificações periódicas
    setInterval(check, checkInterval);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Método para limpar recursos quando a aplicação for fechada
  async cleanup(): Promise<void> {
    await this.close();
  }
}

// Instância singleton
export const webScraper = WebScraper.getInstance();

// Limpar recursos quando a aplicação for fechada
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    webScraper.cleanup();
  });
} else if (typeof process !== 'undefined') {
  process.on('exit', () => {
    webScraper.cleanup();
  });
  
  process.on('SIGINT', () => {
    webScraper.cleanup();
    process.exit(0);
  });
}