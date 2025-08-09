// Sistema de métricas de performance para monitoramento da aplicação

import { logger } from './logger';

export interface MetricEntry {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface PerformanceMetrics {
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  cacheHitRate: number;
  lastRequestTime: number;
}

export interface PNCPMetrics extends PerformanceMetrics {
  searchRequests: number;
  filterRequests: number;
  contractRequests: number;
  ataRequests: number;
  timeoutErrors: number;
  rateLimitErrors: number;
}

class MetricsCollector {
  private metrics: Map<string, MetricEntry[]> = new Map();
  private counters: Map<string, number> = new Map();
  private timers: Map<string, number> = new Map();
  private maxMetricsPerType = 1000;

  // Contadores
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    const currentValue = this.counters.get(name) || 0;
    this.counters.set(name, currentValue + value);
    
    this.addMetric(name, value, tags);
    logger.debug(`Métrica incrementada: ${name} = ${currentValue + value}`, 'METRICS');
  }

  decrement(name: string, value: number = 1, tags?: Record<string, string>): void {
    const currentValue = this.counters.get(name) || 0;
    this.counters.set(name, Math.max(0, currentValue - value));
    
    this.addMetric(name, -value, tags);
    logger.debug(`Métrica decrementada: ${name} = ${Math.max(0, currentValue - value)}`, 'METRICS');
  }

  // Gauges (valores absolutos)
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.counters.set(name, value);
    this.addMetric(name, value, tags);
    logger.debug(`Gauge atualizado: ${name} = ${value}`, 'METRICS');
  }

  // Timers
  startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn(`Timer não encontrado: ${name}`, 'METRICS');
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);
    this.addMetric(name, duration, tags);
    
    logger.debug(`Timer finalizado: ${name} = ${duration}ms`, 'METRICS');
    return duration;
  }

  // Histograma simples
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    this.addMetric(name, value, tags);
  }

  private addMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const entries = this.metrics.get(name)!;
    entries.push({
      name,
      value,
      timestamp: Date.now(),
      tags
    });

    // Limitar o número de métricas na memória
    if (entries.length > this.maxMetricsPerType) {
      entries.shift();
    }
  }

  // Obter valor atual de um contador
  getCounter(name: string): number {
    return this.counters.get(name) || 0;
  }

  // Obter estatísticas de uma métrica
  getStats(name: string, timeWindow?: number): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } {
    const entries = this.metrics.get(name) || [];
    const now = Date.now();
    
    const filteredEntries = timeWindow 
      ? entries.filter(entry => now - entry.timestamp <= timeWindow)
      : entries;

    if (filteredEntries.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0, p95: 0 };
    }

    const values = filteredEntries.map(entry => entry.value).sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const count = values.length;
    const avg = sum / count;
    const min = values[0];
    const max = values[count - 1];
    const p95Index = Math.floor(count * 0.95);
    const p95 = values[p95Index] || max;

    return { count, sum, avg, min, max, p95 };
  }

  // Métricas específicas para PNCP
  getPNCPMetrics(): PNCPMetrics {
    const responseTimeStats = this.getStats('pncp.response_time', 15 * 60 * 1000); // 15 minutos
    const cacheHits = this.getCounter('pncp.cache.hits');
    const cacheMisses = this.getCounter('pncp.cache.misses');
    const totalCacheRequests = cacheHits + cacheMisses;
    
    return {
      requestCount: this.getCounter('pncp.requests'),
      errorCount: this.getCounter('pncp.errors'),
      avgResponseTime: responseTimeStats.avg,
      minResponseTime: responseTimeStats.min,
      maxResponseTime: responseTimeStats.max,
      cacheHitRate: totalCacheRequests > 0 ? (cacheHits / totalCacheRequests) * 100 : 0,
      lastRequestTime: this.getCounter('pncp.last_request_time'),
      searchRequests: this.getCounter('pncp.search.requests'),
      filterRequests: this.getCounter('pncp.filters.requests'),
      contractRequests: this.getCounter('pncp.contracts.requests'),
      ataRequests: this.getCounter('pncp.atas.requests'),
      timeoutErrors: this.getCounter('pncp.errors.timeout'),
      rateLimitErrors: this.getCounter('pncp.errors.rate_limit')
    };
  }

  // Obter todas as métricas
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    // Contadores
    for (const [name, value] of this.counters.entries()) {
      result[name] = value;
    }
    
    // Estatísticas dos últimos 15 minutos
    const timeWindow = 15 * 60 * 1000;
    for (const [name] of this.metrics.entries()) {
      const stats = this.getStats(name, timeWindow);
      result[`${name}_stats`] = stats;
    }
    
    return result;
  }

  // Limpar métricas antigas
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 horas por padrão
    const now = Date.now();
    
    for (const [name, entries] of this.metrics.entries()) {
      const filteredEntries = entries.filter(entry => now - entry.timestamp <= maxAge);
      this.metrics.set(name, filteredEntries);
    }
    
    logger.info('Limpeza de métricas antigas concluída', 'METRICS');
  }

  // Reset de métricas
  reset(): void {
    this.metrics.clear();
    this.counters.clear();
    this.timers.clear();
    logger.info('Métricas resetadas', 'METRICS');
  }

  // Exportar métricas para formato Prometheus (opcional)
  exportPrometheus(): string {
    const lines: string[] = [];
    
    for (const [name, value] of this.counters.entries()) {
      const metricName = name.replace(/\./g, '_');
      lines.push(`# TYPE ${metricName} counter`);
      lines.push(`${metricName} ${value}`);
    }
    
    return lines.join('\n');
  }
}

// Instância singleton
export const metrics = new MetricsCollector();

// Funções de conveniência para PNCP
export const pncpMetrics = {
  // Requisições
  requestStarted: (type: string = 'general') => {
    metrics.increment('pncp.requests');
    metrics.increment(`pncp.${type}.requests`);
    metrics.gauge('pncp.last_request_time', Date.now());
    metrics.startTimer(`pncp.request.${Date.now()}`);
  },
  
  requestCompleted: (startTime: number, status: number, type: string = 'general') => {
    const duration = Date.now() - startTime;
    metrics.histogram('pncp.response_time', duration);
    
    if (status >= 400) {
      metrics.increment('pncp.errors');
      
      if (status === 429) {
        metrics.increment('pncp.errors.rate_limit');
      } else if (status >= 500) {
        metrics.increment('pncp.errors.server');
      }
    }
  },
  
  requestTimeout: (type: string = 'general') => {
    metrics.increment('pncp.errors');
    metrics.increment('pncp.errors.timeout');
    metrics.increment(`pncp.${type}.errors`);
  },
  
  // Cache
  cacheHit: (key: string) => {
    metrics.increment('pncp.cache.hits');
    logger.debug(`Cache hit: ${key}`, 'CACHE');
  },
  
  cacheMiss: (key: string) => {
    metrics.increment('pncp.cache.misses');
    logger.debug(`Cache miss: ${key}`, 'CACHE');
  },
  
  cacheSet: (key: string, size?: number) => {
    metrics.increment('pncp.cache.sets');
    if (size) {
      metrics.histogram('pncp.cache.entry_size', size);
    }
  },
  
  // Estatísticas de uso
  searchPerformed: (resultCount: number, hasFilters: boolean) => {
    metrics.increment('pncp.searches');
    metrics.histogram('pncp.search.results', resultCount);
    
    if (hasFilters) {
      metrics.increment('pncp.searches.with_filters');
    }
  }
};

// Middleware para coleta automática de métricas
export function withMetrics<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  metricName: string,
  tags?: Record<string, string>
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    metrics.startTimer(metricName);
    
    try {
      const result = await fn(...args);
      const duration = metrics.endTimer(metricName, tags);
      metrics.increment(`${metricName}.success`, 1, tags);
      
      return result;
    } catch (error) {
      metrics.endTimer(metricName, tags);
      metrics.increment(`${metricName}.error`, 1, tags);
      throw error;
    }
  }) as T;
}

// Inicializar limpeza automática de métricas
setInterval(() => {
  metrics.cleanup();
}, 60 * 60 * 1000); // A cada hora