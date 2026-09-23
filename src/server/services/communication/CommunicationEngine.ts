import {
  NotificationEventType,
  NotificationChannel,
  NotificationPriority,
  NotificationEventPayload,
  NotificationItem,
  NotificationTemplate,
  NotificationPreferences,
  UserRole,
  CommunicationStats
} from '../../../types/communication';
import { TemplateEngine } from './TemplateEngine';
import { PreferenceService } from './PreferenceService';
import { ChannelRouter } from './Providers';
import { QueueService } from './QueueService';
import { SchedulerService } from './SchedulerService';

type RealtimeListener = (notification: NotificationItem) => void;

export class CommunicationEngine {
  private static instance: CommunicationEngine;

  private templateEngine: TemplateEngine;
  private preferenceService: PreferenceService;
  private channelRouter: ChannelRouter;
  private queueService: QueueService;
  private schedulerService: SchedulerService;

  private notifications: NotificationItem[] = [];
  private realtimeListeners: Set<RealtimeListener> = new Set();

  private constructor() {
    this.templateEngine = new TemplateEngine();
    this.preferenceService = new PreferenceService();
    this.channelRouter = new ChannelRouter();
    this.queueService = new QueueService(this.channelRouter);
    this.schedulerService = new SchedulerService();

    // Attach scheduler callback
    this.schedulerService.setOnTrigger((payload) => {
      this.publishEvent(payload);
    });
  }

  public static getInstance(): CommunicationEngine {
    if (!CommunicationEngine.instance) {
      CommunicationEngine.instance = new CommunicationEngine();
    }
    return CommunicationEngine.instance;
  }

  // Subscribe to real-time notifications (for bell icon & instant toast)
  public subscribeRealtime(listener: RealtimeListener): () => void {
    this.realtimeListeners.add(listener);
    return () => {
      this.realtimeListeners.delete(listener);
    };
  }

  private notifyRealtime(notification: NotificationItem) {
    this.realtimeListeners.forEach(listener => {
      try {
        listener(notification);
      } catch (err) {
        console.error('[CommunicationEngine] Realtime listener error:', err);
      }
    });
  }

  /**
   * Main Event Bus Entrypoint.
   * The Booking Engine or external system publishes events here.
   */
  public async publishEvent(payload: NotificationEventPayload): Promise<{
    eventId: string;
    notificationsCreated: number;
    queuedCount: number;
  }> {
    const priority = payload.priority || this.getEventPriority(payload.eventType);
    const channels: NotificationChannel[] = ['in_app', 'push', 'whatsapp', 'sms', 'email'];

    let notificationsCreated = 0;
    let queuedCount = 0;

    for (const channel of channels) {
      // Check user preferences
      const isAllowed = this.preferenceService.isChannelAllowed(
        payload.recipientId,
        payload.recipientRole,
        channel,
        priority
      );

      if (!isAllowed) {
        continue;
      }

      // Render template
      const { title, body } = this.templateEngine.render(
        payload.eventType,
        channel,
        payload.variables
      );

      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      if (channel === 'in_app') {
        const inAppItem: NotificationItem = {
          id: notifId,
          eventId: payload.eventId,
          eventType: payload.eventType,
          userId: payload.recipientId,
          userRole: payload.recipientRole,
          channel: 'in_app',
          priority,
          title,
          message: body,
          data: payload.variables,
          status: 'delivered',
          isRead: false,
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          actionUrl: payload.metadata?.actionUrl
        };

        this.notifications.unshift(inAppItem);
        notificationsCreated++;

        // Notify real-time subscribers
        this.notifyRealtime(inAppItem);
      } else {
        // Enqueue for external channel delivery
        const contact = this.getRecipientContact(channel, payload);
        this.queueService.enqueue({
          notificationId: notifId,
          eventId: payload.eventId,
          eventType: payload.eventType,
          channel,
          recipientId: payload.recipientId,
          recipientContact: contact,
          title,
          body,
          priority,
          actionUrl: payload.metadata?.actionUrl
        });

        queuedCount++;
      }
    }

    return {
      eventId: payload.eventId,
      notificationsCreated,
      queuedCount
    };
  }

  private getEventPriority(eventType: NotificationEventType): NotificationPriority {
    switch (eventType) {
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_CANCELLED':
      case 'DRIVER_ASSIGNED':
      case 'TRIP_STARTED':
      case 'TRIP_COMPLETED':
      case 'PAYMENT_RECEIVED':
        return 'high';
      case 'BOOKING_CREATED':
      case 'BOOKING_ASSIGNED':
      case 'DRIVER_CHANGED':
      case 'DRIVER_ARRIVING':
      case 'QUOTE_REQUESTED':
      case 'QUOTE_SUBMITTED':
      case 'QUOTE_ACCEPTED':
      case 'OPERATOR_APPROVED':
      case 'CUSTOMER_REVIEW_REQUESTED':
        return 'medium';
      case 'OPERATOR_ONLINE':
      case 'OPERATOR_OFFLINE':
      case 'OPERATOR_SUSPENDED':
      case 'BOOKING_EXPIRED':
      case 'QUOTE_EXPIRED':
      case 'REFUND_ISSUED':
      default:
        return 'low';
    }
  }

  private getRecipientContact(channel: NotificationChannel, payload: NotificationEventPayload): string {
    if (channel === 'email' && payload.recipientEmail) {
      return payload.recipientEmail;
    }
    if ((channel === 'sms' || channel === 'whatsapp' || channel === 'push') && payload.recipientPhone) {
      return payload.recipientPhone;
    }
    return payload.recipientId;
  }

  // --- IN-APP NOTIFICATION METHODS ---

  public getUserNotifications(userId: string, filterRole?: UserRole): NotificationItem[] {
    return this.notifications.filter(
      n => n.userId === userId && (!filterRole || n.userRole === filterRole) && !n.isArchived
    );
  }

  public getUnreadCount(userId: string): number {
    return this.notifications.filter(
      n => n.userId === userId && !n.isRead && !n.isArchived
    ).length;
  }

  public markAsRead(notificationId: string): boolean {
    const item = this.notifications.find(n => n.id === notificationId);
    if (!item) return false;
    item.isRead = true;
    item.readAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    return true;
  }

  public markAllAsRead(userId: string): number {
    let count = 0;
    const now = new Date().toISOString();
    this.notifications.forEach(n => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        n.readAt = now;
        n.updatedAt = now;
        count++;
      }
    });
    return count;
  }

  public deleteNotification(notificationId: string): boolean {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index === -1) return false;
    this.notifications.splice(index, 1);
    return true;
  }

  public archiveNotification(notificationId: string): boolean {
    const item = this.notifications.find(n => n.id === notificationId);
    if (!item) return false;
    item.isArchived = true;
    item.updatedAt = new Date().toISOString();
    return true;
  }

  // --- PREFERENCES METHODS ---

  public getUserPreferences(userId: string, role: UserRole): NotificationPreferences {
    return this.preferenceService.getPreferences(userId, role);
  }

  public updateUserPreferences(userId: string, prefs: Partial<NotificationPreferences>): NotificationPreferences {
    return this.preferenceService.updatePreferences(userId, prefs);
  }

  // --- TEMPLATES METHODS ---

  public getTemplates(): NotificationTemplate[] {
    return this.templateEngine.getAllTemplates();
  }

  public saveTemplate(template: NotificationTemplate) {
    this.templateEngine.registerTemplate(template);
  }

  // --- SCHEDULER METHODS ---

  public scheduleReminder(
    taskType: 'journey_tomorrow' | 'journey_2hr' | 'quote_expiry' | 'operator_reminder' | 'review_reminder',
    triggerAt: Date,
    payload: NotificationEventPayload
  ) {
    return this.schedulerService.scheduleReminder(taskType, triggerAt, payload);
  }

  // --- ADMIN METRICS & QUEUE MANAGEMENT ---

  public getStats(): CommunicationStats {
    const stats = this.queueService.getStats();
    stats.read = this.notifications.filter(n => n.isRead).length;
    return stats;
  }

  public getQueue() {
    return this.queueService.getQueue();
  }

  public getDeliveryLogs() {
    return this.queueService.getDeliveryLogs();
  }

  public getFailures() {
    return this.queueService.getFailures();
  }

  public manualRetry(queueItemId: string) {
    return this.queueService.manualRetry(queueItemId);
  }
}

export const communicationEngine = CommunicationEngine.getInstance();
