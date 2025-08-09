// Sistema de logging estruturado para monitoramento da aplicação

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
  requestId?: string;
  userId?: string;
  duration?: number;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  maxFileSize: number;
  maxFiles: number;
}

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private maxMemoryLogs = 1000;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...config
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    const duration = entry.duration ? ` (${entry.duration}ms)` : '';
    
    return `${timestamp} ${level} ${context} ${entry.message}${duration}`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error
    };

    // Adicionar à memória
    this.logs.push(entry);
    if (this.logs.length > this.maxMemoryLogs) {
      this.logs.shift();
    }

    // Log no console
    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(entry);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage, data);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage, data);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage, data);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage, error || data);
          break;
      }
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, error?: Error, data?: any): void;
  warn(message: string, context?: string, data?: any): void;
  warn(message: string, contextOrError?: string | Error, data?: any): void {
    if (contextOrError instanceof Error) {
      // Chamada com (message, error, data)
      this.log(LogLevel.WARN, message, undefined, data, contextOrError);
    } else {
      // Chamada com (message, context, data)
      this.log(LogLevel.WARN, message, contextOrError, data);
    }
  }

  error(message: string, error?: Error, data?: any): void;
  error(message: string, context?: string, error?: Error, data?: any): void;
  error(message: string, contextOrError?: string | Error, errorOrData?: Error | any, data?: any): void {
    if (contextOrError instanceof Error) {
      // Chamada com (message, error, data)
      this.log(LogLevel.ERROR, message, undefined, errorOrData, contextOrError);
    } else {
      // Chamada com (message, context, error, data)
      this.log(LogLevel.ERROR, message, contextOrError, data, errorOrData as Error);
    }
  }

  // Métodos específicos para PNCP
  pncpRequest(url: string, params?: any, requestId?: string): void {
    this.info(`Requisição PNCP iniciada: ${url}`, 'PNCP', { params, requestId });
  }

  pncpResponse(url: string, status: number, duration: number, requestId?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message: `Resposta PNCP: ${url} - Status: ${status}`,
      context: 'PNCP',
      duration,
      requestId
    };
    
    this.logs.push(entry);
    if (this.config.enableConsole) {
      console.info(this.formatMessage(entry));
    }
  }

  pncpError(url: string, error: Error, requestId?: string): void {
    this.error(`Erro PNCP: ${url} - ${error.message}`, 'PNCP', error, { requestId });
  }

  cacheHit(key: string, context?: string): void {
    this.debug(`Cache hit: ${key}`, context || 'CACHE');
  }

  cacheMiss(key: string, context?: string): void {
    this.debug(`Cache miss: ${key}`, context || 'CACHE');
  }

  cacheSet(key: string, ttl?: number, context?: string): void {
    this.debug(`Cache set: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''}`, context || 'CACHE');
  }

  // Métodos para análise
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  getLogsByLevel(level: LogLevel, count: number = 100): LogEntry[] {
    return this.logs
      .filter(log => log.level === level)
      .slice(-count);
  }

  getLogsByContext(context: string, count: number = 100): LogEntry[] {
    return this.logs
      .filter(log => log.context === context)
      .slice(-count);
  }

  getErrorStats(): { total: number; byContext: Record<string, number> } {
    const errorLogs = this.logs.filter(log => log.level === LogLevel.ERROR);
    const byContext: Record<string, number> = {};
    
    errorLogs.forEach(log => {
      const context = log.context || 'unknown';
      byContext[context] = (byContext[context] || 0) + 1;
    });

    return {
      total: errorLogs.length,
      byContext
    };
  }

  getPerformanceStats(): { avgDuration: number; requestCount: number } {
    const logsWithDuration = this.logs.filter(log => log.duration !== undefined);
    const totalDuration = logsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0);
    
    return {
      avgDuration: logsWithDuration.length > 0 ? totalDuration / logsWithDuration.length : 0,
      requestCount: logsWithDuration.length
    };
  }

  // Limpar logs antigos
  clearLogs(): void {
    this.logs = [];
  }

  // Configurar nível de log
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }
}

// Instância singleton
export const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableFile: false
});

// Função para criar logger com contexto específico
export function createContextLogger(context: string) {
  return {
    debug: (message: string, data?: any) => logger.debug(message, context, data),
    info: (message: string, data?: any) => logger.info(message, context, data),
    warn: (message: string, data?: any) => logger.warn(message, context, data),
    error: (message: string, error?: Error, data?: any) => logger.error(message, context, error, data)
  };
}

// Decorator para logging automático de métodos
export function LogMethod(context?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const logContext = context || target.constructor.name;
      
      logger.debug(`Método ${propertyName} iniciado`, logContext, { args });
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;
        
        logger.debug(`Método ${propertyName} concluído`, logContext, { duration });
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error(
          `Erro no método ${propertyName}`,
          logContext,
          error as Error,
          { args, duration }
        );
        throw error;
      }
    };
  };
}