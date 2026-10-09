import { loggingService } from './LoggingService';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private hits = 0;
  private misses = 0;

  public set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public invalidateByPattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    loggingService.info('CacheService', `Invalidated ${count} keys matching pattern: ${pattern}`);
    return count;
  }

  public clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  public getStats() {
    const total = this.hits + this.misses;
    const hitRatioPercentage = total > 0 ? Math.round((this.hits / total) * 100) : 100;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRatioPercentage
    };
  }
}

export const cacheService = new CacheService();
