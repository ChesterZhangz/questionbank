import type { CacheEntry, RenderStats } from '../types';

export class RenderCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0
  };

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (entry) {
      // 检查是否过期（24小时）
      if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
        this.cache.delete(key);
        this.stats.misses++;
        return null;
      }
      this.stats.hits++;
      return entry.value;
    }
    this.stats.misses++;
    return null;
  }

  set(key: string, value: string): void {
    const size = this.calculateSize(key, value);
    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      size
    };

    // 如果缓存已满，清理最旧的条目
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
    this.stats.sets++;
  }

  private calculateSize(key: string, value: string): number {
    return key.length + value.length;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
  }

  getStats(): RenderStats {
    // const totalRequests = this.stats.hits + this.stats.misses;
    // const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      renderTime: 0, // 由渲染器设置
      cacheHit: this.stats.hits > 0,
      errorCount: 0, // 由渲染器设置
      warningCount: 0 // 由渲染器设置
    };
  }

  getCacheStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses)
    };
  }
}

// 全局缓存实例
export const globalRenderCache = new RenderCache(200); 