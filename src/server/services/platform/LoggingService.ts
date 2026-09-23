import { SystemLogItem, SystemLogLevel } from '../../../types/platform';

class LoggingService {
  private logs: SystemLogItem[] = [];
  private maxLogsMemory = 1000;

  public log(level: SystemLogLevel, module: string, message: string, metadata?: Record<string, any>, requestId?: string, userId?: string, ip?: string): SystemLogItem {
    const item: SystemLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      metadata,
      requestId: requestId || `req-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      ip
    };

    this.logs.unshift(item);
    if (this.logs.length > this.maxLogsMemory) {
      this.logs = this.logs.slice(0, this.maxLogsMemory);
    }

    if (process.env.NODE_ENV !== 'test') {
      const color = level === 'error' ? '\x1b[31m' : level === 'warn' ? '\x1b[33m' : '\x1b[36m';
      console.log(`${color}[${item.timestamp}] [${level.toUpperCase()}] [${module}] ${message}\x1b[0m`, metadata ? JSON.stringify(metadata) : '');
    }

    return item;
  }

  public info(module: string, message: string, metadata?: Record<string, any>, requestId?: string): SystemLogItem {
    return this.log('info', module, message, metadata, requestId);
  }

  public warn(module: string, message: string, metadata?: Record<string, any>, requestId?: string): SystemLogItem {
    return this.log('warn', module, message, metadata, requestId);
  }

  public error(module: string, message: string, metadata?: Record<string, any>, requestId?: string): SystemLogItem {
    return this.log('error', module, message, metadata, requestId);
  }

  public debug(module: string, message: string, metadata?: Record<string, any>, requestId?: string): SystemLogItem {
    return this.log('debug', module, message, metadata, requestId);
  }

  public getLogs(limit: number = 100, level?: SystemLogLevel, module?: string): SystemLogItem[] {
    let filtered = [...this.logs];
    if (level) {
      filtered = filtered.filter(l => l.level === level);
    }
    if (module) {
      filtered = filtered.filter(l => l.module.toLowerCase() === module.toLowerCase());
    }
    return filtered.slice(0, limit);
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const loggingService = new LoggingService();
