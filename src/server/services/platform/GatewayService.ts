import { Request, Response, NextFunction } from 'express';
import { securityService } from './SecurityService';
import { loggingService } from './LoggingService';
import { monitoringService } from './MonitoringService';

export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    requestId: string;
    timestamp: string;
    latencyMs?: number;
  };
}

class GatewayService {
  // Middleware for Rate Limiting & Gateway Headers
  public gatewayMiddleware(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId = (req.headers['x-request-id'] as string) || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    req.headers['x-request-id'] = requestId;

    res.setHeader('X-Request-Id', requestId);

    // Only rate-limit API calls, skip static assets / Vite HMR / page renders
    const isApiCall = req.originalUrl?.startsWith('/api') || req.path?.startsWith('/api');

    if (isApiCall) {
      const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
      const rateCheck = securityService.checkRateLimit(clientIp);
      res.setHeader('X-RateLimit-Remaining', rateCheck.remainingTokens);

      if (!rateCheck.allowed) {
        res.setHeader('Retry-After', rateCheck.retryAfterSec || 60);
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please slow down and try again.'
          },
          meta: {
            requestId,
            timestamp: new Date().toISOString()
          }
        });
      }
    }

    // Monitor Response Latency
    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      if (isApiCall) {
        monitoringService.recordMetric(req.originalUrl || req.url, req.method, durationMs, res.statusCode);
      }
    });

    next();
  }

  // Helper for standardized success responses
  public sendSuccess<T>(res: Response, data: T, statusCode: number = 200, req?: Request): Response {
    const requestId = (req?.headers['x-request-id'] as string) || `req-${Date.now()}`;
    const responseBody: StandardApiResponse<T> = {
      success: true,
      data,
      meta: {
        requestId,
        timestamp: new Date().toISOString()
      }
    };
    return res.status(statusCode).json(responseBody);
  }

  // Helper for standardized error responses
  public sendError(res: Response, message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: any, req?: Request): Response {
    const requestId = (req?.headers['x-request-id'] as string) || `req-${Date.now()}`;
    loggingService.error('GatewayService', `API Error [${code}]: ${message}`, { statusCode, details }, requestId);

    const responseBody: StandardApiResponse = {
      success: false,
      error: {
        code,
        message,
        details
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString()
      }
    };
    return res.status(statusCode).json(responseBody);
  }
}

export const gatewayService = new GatewayService();
