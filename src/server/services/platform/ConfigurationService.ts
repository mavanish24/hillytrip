import { FeatureFlag, SystemConfigItem } from '../../../types/platform';
import { auditService } from './AuditService';
import { loggingService } from './LoggingService';

class ConfigurationService {
  private featureFlags: Map<string, FeatureFlag> = new Map([
    [
      'AI_POWERED_SEARCH',
      {
        key: 'AI_POWERED_SEARCH',
        name: 'AI Natural Language Search Engine',
        description: 'Enables intent extraction and structured search filtering powered by Gemini Flash',
        enabled: true,
        rolloutPercentage: 100,
        category: 'AI',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
      }
    ],
    [
      'DYNAMIC_PRICING_ENGINE',
      {
        key: 'DYNAMIC_PRICING_ENGINE',
        name: 'Hill Region Demand Pricing Adjuster',
        description: 'Auto-adjusts taxi & homestay base rates during high tourist season peak days',
        enabled: true,
        rolloutPercentage: 80,
        category: 'Bookings',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
      }
    ],
    [
      'RAZORPAY_SPLIT_PAYMENTS',
      {
        key: 'RAZORPAY_SPLIT_PAYMENTS',
        name: 'Vendor Split Payout Automation',
        description: 'Automatically routes homestay host & taxi driver commissions directly via Razorpay Route',
        enabled: true,
        rolloutPercentage: 100,
        category: 'Payments',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
      }
    ],
    [
      'REALTIME_DRIVER_GEOLOCATION',
      {
        key: 'REALTIME_DRIVER_GEOLOCATION',
        name: 'GPS Driver Live Tracking',
        description: 'Enables WebSocket driver location broadcast during active taxi rides',
        enabled: true,
        rolloutPercentage: 100,
        category: 'Taxi',
        updatedAt: new Date().toISOString(),
        updatedBy: 'System'
      }
    ]
  ]);

  private systemConfigs: Map<string, SystemConfigItem> = new Map([
    [
      'SYSTEM_CURRENCY',
      {
        key: 'SYSTEM_CURRENCY',
        value: 'INR',
        category: 'General',
        isSecret: false,
        description: 'Primary platform operational currency',
        updatedAt: new Date().toISOString()
      }
    ],
    [
      'PLATFORM_COMMISSION_PERCENT',
      {
        key: 'PLATFORM_COMMISSION_PERCENT',
        value: '10.0',
        category: 'Finance',
        isSecret: false,
        description: 'Default commission percentage charged on booking payouts',
        updatedAt: new Date().toISOString()
      }
    ],
    [
      'MAX_API_RATE_LIMIT_PER_MIN',
      {
        key: 'MAX_API_RATE_LIMIT_PER_MIN',
        value: '120',
        category: 'Security',
        isSecret: false,
        description: 'Maximum permitted API calls per client IP per minute',
        updatedAt: new Date().toISOString()
      }
    ]
  ]);

  public getFeatureFlag(key: string): FeatureFlag | undefined {
    return this.featureFlags.get(key);
  }

  public isFeatureEnabled(key: string): boolean {
    const flag = this.featureFlags.get(key);
    return flag ? flag.enabled : false;
  }

  public getAllFeatureFlags(): FeatureFlag[] {
    return Array.from(this.featureFlags.values());
  }

  public updateFeatureFlag(key: string, enabled: boolean, updatedBy: string = 'Admin'): FeatureFlag {
    const flag = this.featureFlags.get(key);
    if (!flag) {
      throw new Error(`Feature flag with key '${key}' not found.`);
    }

    const previousState = { ...flag };
    flag.enabled = enabled;
    flag.updatedAt = new Date().toISOString();
    flag.updatedBy = updatedBy;

    this.featureFlags.set(key, flag);

    auditService.recordAudit(
      updatedBy,
      'ADMIN',
      'SystemConfig',
      'TOGGLE_FEATURE_FLAG',
      key,
      previousState,
      flag
    );

    loggingService.info('ConfigurationService', `Feature flag '${key}' set to ${enabled} by ${updatedBy}`);
    return flag;
  }

  public getSystemConfig(key: string): SystemConfigItem | undefined {
    return this.systemConfigs.get(key);
  }

  public getAllSystemConfigs(): SystemConfigItem[] {
    return Array.from(this.systemConfigs.values()).map(c => {
      if (c.isSecret) {
        return { ...c, value: '********' };
      }
      return c;
    });
  }

  public updateSystemConfig(key: string, value: string, updatedBy: string = 'Admin'): SystemConfigItem {
    const config = this.systemConfigs.get(key);
    if (!config) {
      throw new Error(`System config with key '${key}' not found.`);
    }

    const previousState = { ...config };
    config.value = value;
    config.updatedAt = new Date().toISOString();

    this.systemConfigs.set(key, config);

    auditService.recordAudit(
      updatedBy,
      'ADMIN',
      'SystemConfig',
      'UPDATE_SYSTEM_CONFIG',
      key,
      previousState,
      config
    );

    return config;
  }
}

export const configurationService = new ConfigurationService();
