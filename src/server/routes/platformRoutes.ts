import { Router, Request, Response } from 'express';
import { gatewayService } from '../services/platform/GatewayService';
import { healthService } from '../services/platform/HealthService';
import { monitoringService } from '../services/platform/MonitoringService';
import { loggingService } from '../services/platform/LoggingService';
import { jobService } from '../services/platform/JobService';
import { configurationService } from '../services/platform/ConfigurationService';
import { auditService } from '../services/platform/AuditService';
import { securityService } from '../services/platform/SecurityService';
import { cacheService } from '../services/platform/CacheService';

const router = Router();

// GET /api/system/health
router.get('/health', async (req: Request, res: Response) => {
  try {
    const report = await healthService.getHealthReport();
    return gatewayService.sendSuccess(res, report, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'HEALTH_CHECK_FAILED', 500, null, req);
  }
});

// GET /api/system/metrics
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const metrics = monitoringService.getMetrics();
    const analytics = monitoringService.getPlatformAnalyticsSummary();
    return gatewayService.sendSuccess(res, { metrics, analytics }, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'METRICS_FETCH_FAILED', 500, null, req);
  }
});

// GET /api/system/logs
router.get('/logs', (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const level = req.query.level as any;
    const module = req.query.module as string;
    const logs = loggingService.getLogs(limit, level, module);
    return gatewayService.sendSuccess(res, logs, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'LOGS_FETCH_FAILED', 500, null, req);
  }
});

// GET /api/system/jobs
router.get('/jobs', (req: Request, res: Response) => {
  try {
    const status = req.query.status as any;
    const jobs = jobService.getJobs(status);
    return gatewayService.sendSuccess(res, jobs, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'JOBS_FETCH_FAILED', 500, null, req);
  }
});

// POST /api/system/jobs/enqueue
router.post('/jobs/enqueue', (req: Request, res: Response) => {
  try {
    const { jobType, payload, maxRetries } = req.body;
    if (!jobType) {
      return gatewayService.sendError(res, 'Job type is required', 'VALIDATION_ERROR', 400, null, req);
    }
    const job = jobService.enqueueJob(jobType, payload || {}, maxRetries || 3);
    return gatewayService.sendSuccess(res, job, 201, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'JOB_ENQUEUE_FAILED', 500, null, req);
  }
});

// POST /api/system/jobs/retry/:jobId
router.post('/jobs/retry/:jobId', (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const retriedJob = jobService.retryFailedJob(jobId);
    if (!retriedJob) {
      return gatewayService.sendError(res, 'Job not found', 'NOT_FOUND', 404, null, req);
    }
    return gatewayService.sendSuccess(res, retriedJob, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'JOB_RETRY_FAILED', 500, null, req);
  }
});

// GET /api/system/flags
router.get('/flags', (req: Request, res: Response) => {
  try {
    const flags = configurationService.getAllFeatureFlags();
    return gatewayService.sendSuccess(res, flags, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'FLAGS_FETCH_FAILED', 500, null, req);
  }
});

// PUT /api/system/flags/:key
router.put('/flags/:key', (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { enabled, updatedBy } = req.body;
    const updated = configurationService.updateFeatureFlag(key, Boolean(enabled), updatedBy);
    return gatewayService.sendSuccess(res, updated, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'FLAG_UPDATE_FAILED', 500, null, req);
  }
});

// GET /api/system/config
router.get('/config', (req: Request, res: Response) => {
  try {
    const configs = configurationService.getAllSystemConfigs();
    return gatewayService.sendSuccess(res, configs, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'CONFIG_FETCH_FAILED', 500, null, req);
  }
});

// PUT /api/system/config/:key
router.put('/config/:key', (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value, updatedBy } = req.body;
    const updated = configurationService.updateSystemConfig(key, value, updatedBy);
    return gatewayService.sendSuccess(res, updated, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'CONFIG_UPDATE_FAILED', 500, null, req);
  }
});

// GET /api/system/audit
router.get('/audit', (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const module = req.query.module as string;
    const actorId = req.query.actorId as string;
    const trail = auditService.getAuditTrail(limit, module, actorId);
    return gatewayService.sendSuccess(res, trail, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'AUDIT_FETCH_FAILED', 500, null, req);
  }
});

// GET /api/system/security-scan
router.get('/security-scan', (req: Request, res: Response) => {
  try {
    const report = securityService.runSecurityScan();
    return gatewayService.sendSuccess(res, report, 200, req);
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'SECURITY_SCAN_FAILED', 500, null, req);
  }
});

// POST /api/system/cache/clear
router.post('/cache/clear', (req: Request, res: Response) => {
  try {
    const { pattern } = req.body;
    if (pattern) {
      const count = cacheService.invalidateByPattern(pattern);
      return gatewayService.sendSuccess(res, { invalidatedKeys: count }, 200, req);
    } else {
      cacheService.clear();
      return gatewayService.sendSuccess(res, { cleared: true }, 200, req);
    }
  } catch (err: any) {
    return gatewayService.sendError(res, err.message, 'CACHE_CLEAR_FAILED', 500, null, req);
  }
});

export default router;
