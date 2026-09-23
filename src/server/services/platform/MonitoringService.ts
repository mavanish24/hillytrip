import { PerformanceMetricItem, PlatformAnalyticsSummary } from '../../../types/platform';
import { cacheService } from './CacheService';

class MonitoringService {
  private metrics: PerformanceMetricItem[] = [
    {
      id: 'metric-1',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      endpoint: '/api/v1/search',
      method: 'GET',
      durationMs: 42,
      statusCode: 200,
      dbQueryTimeMs: 12,
      cacheHit: true
    },
    {
      id: 'metric-2',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      endpoint: '/api/v1/homestays',
      method: 'GET',
      durationMs: 68,
      statusCode: 200,
      dbQueryTimeMs: 34,
      cacheHit: false
    },
    {
      id: 'metric-3',
      timestamp: new Date(Date.now() - 180000).toISOString(),
      endpoint: '/api/v1/taxi/fare-estimate',
      method: 'POST',
      durationMs: 85,
      statusCode: 200,
      dbQueryTimeMs: 20,
      cacheHit: true
    },
    {
      id: 'metric-4',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      endpoint: '/api/ai/search-interpret',
      method: 'POST',
      durationMs: 320,
      statusCode: 200,
      dbQueryTimeMs: 5,
      cacheHit: false
    }
  ];

  public recordMetric(endpoint: string, method: string, durationMs: number, statusCode: number, dbQueryTimeMs?: number, cacheHit?: boolean): PerformanceMetricItem {
    const item: PerformanceMetricItem = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      durationMs,
      statusCode,
      dbQueryTimeMs,
      cacheHit
    };

    this.metrics.unshift(item);
    if (this.metrics.length > 500) {
      this.metrics = this.metrics.slice(0, 500);
    }

    return item;
  }

  public getMetrics(limit: number = 50): PerformanceMetricItem[] {
    return this.metrics.slice(0, limit);
  }

  public getPlatformAnalyticsSummary(): PlatformAnalyticsSummary {
    const totalRequests = this.metrics.length;
    const successfulRequests = this.metrics.filter(m => m.statusCode < 400).length;
    const apiSuccessRate = totalRequests > 0 ? Math.round((successfulRequests / totalRequests) * 100) : 100;

    const avgResponseTimeMs = totalRequests > 0
      ? Math.round(this.metrics.reduce((acc, curr) => acc + curr.durationMs, 0) / totalRequests)
      : 45;

    const cacheStats = cacheService.getStats();

    return {
      timestamp: new Date().toISOString(),
      totalUsersCount: 14820,
      activeUsers24h: 3240,
      totalBookingsCount: 890,
      totalRevenueINR: 1845000,
      apiSuccessRate,
      avgResponseTimeMs,
      cacheHitRatio: cacheStats.hitRatioPercentage
    };
  }
}

export const monitoringService = new MonitoringService();
