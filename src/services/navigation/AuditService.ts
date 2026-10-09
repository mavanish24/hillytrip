export interface RoleSwitchAuditLog {
  id: string;
  superAdminId: string;
  superAdminName: string;
  originalRole: string;
  switchedRole: string;
  targetUserId?: string;
  targetUserName?: string;
  timestamp: string;
  ipAddress: string;
  reason?: string;
  actionType: 'ROLE_SWITCH' | 'USER_IMPERSONATION' | 'EXIT_IMPERSONATION' | 'SENSITIVE_ACTION_BLOCKED';
  details?: string;
}

const STORAGE_KEY = 'hillytrip_role_audit_logs';

class AuditService {
  private listeners: ((logs: RoleSwitchAuditLog[]) => void)[] = [];

  public getLogs(): RoleSwitchAuditLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    }
    // Default initial logs for demonstration
    return [
      {
        id: 'audit-1001',
        superAdminId: 'usr-sa-707',
        superAdminName: 'Amrit Murarka',
        originalRole: 'SUPER_ADMIN',
        switchedRole: 'TAXI_OPERATOR',
        targetUserId: 'usr-tax-303',
        targetUserName: 'Rajesh Gurung',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        ipAddress: '192.168.1.101',
        reason: 'Investigating booking dispatch issue in Darjeeling zone',
        actionType: 'USER_IMPERSONATION',
        details: 'Entered View-Only Impersonation for Rajesh Gurung'
      },
      {
        id: 'audit-1000',
        superAdminId: 'usr-sa-707',
        superAdminName: 'Amrit Murarka',
        originalRole: 'SUPER_ADMIN',
        switchedRole: 'BUSINESS_OWNER',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        ipAddress: '192.168.1.101',
        reason: 'Testing homestay listing submission workflow',
        actionType: 'ROLE_SWITCH',
        details: 'Switched active interface context to BUSINESS_OWNER'
      }
    ];
  }

  public logEvent(event: Omit<RoleSwitchAuditLog, 'id' | 'timestamp' | 'ipAddress'> & { ipAddress?: string }): RoleSwitchAuditLog {
    const logs = this.getLogs();
    const newLog: RoleSwitchAuditLog = {
      ...event,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ipAddress: event.ipAddress || '192.168.1.101 (Client)'
    };

    const updatedLogs = [newLog, ...logs].slice(0, 200); // Keep last 200 logs
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    }

    this.notifyListeners(updatedLogs);
    return newLog;
  }

  public clearLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.notifyListeners([]);
  }

  public subscribe(listener: (logs: RoleSwitchAuditLog[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(logs: RoleSwitchAuditLog[]) {
    this.listeners.forEach(l => l(logs));
  }
}

export const auditService = new AuditService();
