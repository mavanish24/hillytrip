export type SystemLogLevel = 'info' | 'warn' | 'error' | 'debug' | 'audit';

export interface SystemLogItem {
  id: string;
  timestamp: string;
  level: SystemLogLevel;
  module: string;
  message: string;
  metadata?: Record<string, any>;
  requestId?: string;
  userId?: string;
  ip?: string;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ComponentHealth {
  component: string; // 'database' | 'storage' | 'realtime' | 'queue' | 'ai_providers' | 'payment_providers' | 'notification_providers';
  status: HealthStatus;
  latencyMs: number;
  lastChecked: string;
  details?: string;
}

export interface PlatformHealthReport {
  overallStatus: HealthStatus;
  timestamp: string;
  uptimeSeconds: number;
  components: ComponentHealth[];
  activeJobsCount: number;
  failedJobsCount: number;
  memoryUsageMB: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  environment: string;
  version: string;
}

export interface PerformanceMetricItem {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  durationMs: number;
  statusCode: number;
  dbQueryTimeMs?: number;
  cacheHit?: boolean;
}

export type BackgroundJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';

export interface BackgroundJobItem {
  id: string;
  jobType: string; // 'SEND_NOTIFICATION' | 'REBUILD_SEARCH_INDEX' | 'GENERATE_SITEMAP' | 'DAILY_ANALYTICS' | 'MEDIA_PROCESSING' | 'RETRY_FAILED_PAYMENT';
  payload: Record<string, any>;
  status: BackgroundJobStatus;
  retries: number;
  maxRetries: number;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  executionTimeMs?: number;
}

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  category: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SystemConfigItem {
  key: string;
  value: string;
  category: string;
  isSecret: boolean;
  description: string;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: string;
  module: string;
  action: string;
  targetEntity?: string;
  previousState?: Record<string, any>;
  newState?: Record<string, any>;
  requestId: string;
  ipAddress?: string;
}

export interface SecurityScanReport {
  timestamp: string;
  status: 'passed' | 'warnings' | 'critical';
  checks: {
    name: string;
    category: 'rbac' | 'rate_limiting' | 'input_sanitization' | 'csrf_xss' | 'secrets';
    status: 'pass' | 'fail' | 'warn';
    details: string;
  }[];
}

export interface PlatformAnalyticsSummary {
  timestamp: string;
  totalUsersCount: number;
  activeUsers24h: number;
  totalBookingsCount: number;
  totalRevenueINR: number;
  apiSuccessRate: number;
  avgResponseTimeMs: number;
  cacheHitRatio: number;
}
