import { AuditLogRecord } from '../../../types/platform';
import { loggingService } from './LoggingService';

class AuditService {
  private auditLogs: AuditLogRecord[] = [
    {
      id: 'audit-101',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actorId: 'usr-admin-1',
      actorRole: 'SUPER_ADMIN',
      module: 'Homestays',
      action: 'UPDATE_LISTING_COMMISSION',
      targetEntity: 'homestay-sitong-01',
      previousState: { commissionRate: 0.10 },
      newState: { commissionRate: 0.12 },
      requestId: 'req-init-audit-1',
      ipAddress: '102.168.1.45'
    },
    {
      id: 'audit-102',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      actorId: 'usr-driver-8',
      actorRole: 'TAXI_OPERATOR',
      module: 'Taxi',
      action: 'UPDATE_VEHICLE_RATE',
      targetEntity: 'tax-bolero-darj-01',
      previousState: { perKmRate: 35 },
      newState: { perKmRate: 38 },
      requestId: 'req-init-audit-2',
      ipAddress: '102.168.1.88'
    }
  ];

  public recordAudit(
    actorId: string,
    actorRole: string,
    module: string,
    action: string,
    targetEntity?: string,
    previousState?: Record<string, any>,
    newState?: Record<string, any>,
    requestId?: string,
    ipAddress?: string
  ): AuditLogRecord {
    const record: AuditLogRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorId,
      actorRole,
      module,
      action,
      targetEntity,
      previousState,
      newState,
      requestId: requestId || `req-${Math.random().toString(36).substring(2, 8)}`,
      ipAddress
    };

    this.auditLogs.unshift(record);
    loggingService.log('audit', module, `AUDIT ACTION [${action}] by ${actorId} (${actorRole})`, { targetEntity, action }, record.requestId, actorId, ipAddress);
    return record;
  }

  public getAuditTrail(limit: number = 50, module?: string, actorId?: string): AuditLogRecord[] {
    let filtered = [...this.auditLogs];
    if (module) {
      filtered = filtered.filter(a => a.module.toLowerCase() === module.toLowerCase());
    }
    if (actorId) {
      filtered = filtered.filter(a => a.actorId === actorId);
    }
    return filtered.slice(0, limit);
  }
}

export const auditService = new AuditService();
