// Sistema de cache em memória para otimização de requisições

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  sets: number;
}

class Cache {
  private store = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    size: 0,
    hits: 0,
    misses: 0,
    sets: 0
  };
  private maxSize: number;
  private defaultTtl: number;

  constructor(maxSize: number = 100, defaultTtl: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      this.stats.size--;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Limpar cache se estiver muito grande
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
        this.stats.size--;
      }
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl
    };

    this.store.set(key, entry);
    this.stats.size++;
    this.stats.sets++;
  }

  delete(key: string): boolean {
    const deleted = this.store.delete(key);
    if (deleted) {
      this.stats.size--;
    }
    return deleted;
  }

  clear(): void {
    this.store.clear();
    this.stats.size = 0;
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      this.stats.size--;
      return false;
    }
    
    return true;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Limpar entradas expiradas
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.store.delete(key);
        cleaned++;
      }
    }
    
    this.stats.size -= cleaned;
    return cleaned;
  }

  // Obter todas as chaves
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  // Obter tamanho atual
  size(): number {
    return this.store.size;
  }
}

// Instância singleton
export const cache = new Cache();

// Função para criar cache com configuração específica
export function createCache(maxSize?: number, defaultTtl?: number): Cache {
  return new Cache(maxSize, defaultTtl);
}
