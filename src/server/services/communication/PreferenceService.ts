import { NotificationPreferences, NotificationChannel, NotificationPriority, UserRole } from '../../../types/communication';

export class PreferenceService {
  private preferencesMap: Map<string, NotificationPreferences> = new Map();

  public getPreferences(userId: string, userRole: UserRole = 'customer'): NotificationPreferences {
    if (this.preferencesMap.has(userId)) {
      return this.preferencesMap.get(userId)!;
    }

    // Default preferences
    const defaultPrefs: NotificationPreferences = {
      userId,
      userRole,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: true,
      whatsappEnabled: true,
      marketingEnabled: true,
      updatedAt: new Date().toISOString()
    };

    this.preferencesMap.set(userId, defaultPrefs);
    return defaultPrefs;
  }

  public updatePreferences(userId: string, partial: Partial<NotificationPreferences>): NotificationPreferences {
    const existing = this.getPreferences(userId, partial.userRole || 'customer');
    const updated: NotificationPreferences = {
      ...existing,
      ...partial,
      userId,
      updatedAt: new Date().toISOString()
    };
    this.preferencesMap.set(userId, updated);
    return updated;
  }

  /**
   * System & High priority notifications ignore user preference channel disables.
   * Medium and Low priority honor channel preferences.
   * Marketing notifications honor marketingEnabled.
   */
  public isChannelAllowed(
    userId: string,
    userRole: UserRole,
    channel: NotificationChannel,
    priority: NotificationPriority,
    isMarketing: boolean = false
  ): boolean {
    if (channel === 'in_app') return true; // In-app is always enabled

    const prefs = this.getPreferences(userId, userRole);

    if (isMarketing && !prefs.marketingEnabled) {
      return false;
    }

    // High priority system notifications always delivered
    if (priority === 'high') {
      return true;
    }

    switch (channel) {
      case 'push':
        return prefs.pushEnabled;
      case 'email':
        return prefs.emailEnabled;
      case 'sms':
        return prefs.smsEnabled;
      case 'whatsapp':
        return prefs.whatsappEnabled;
      default:
        return true;
    }
  }
}
