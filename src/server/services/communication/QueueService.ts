import {
  NotificationQueueItem,
  NotificationDeliveryLog,
  NotificationFailure,
  NotificationDeliveryStatus,
  CommunicationStats,
  NotificationChannel,
  NotificationPriority
} from '../../../types/communication';
import { ChannelRouter } from './Providers';

export class QueueService {
  private queue: NotificationQueueItem[] = [];
  private deliveryLogs: NotificationDeliveryLog[] = [];
  private failures: NotificationFailure[] = [];
  private router: ChannelRouter;

  // Retry delays in milliseconds: 1m, 5m, 15m, 1h, 1h
  private retryBackoffMs = [
    1 * 60 * 1000,
    5 * 60 * 1000,
    15 * 60 * 1000,
    60 * 60 * 1000,
    60 * 60 * 1000
  ];

  constructor(router: ChannelRouter) {
    this.router = router;
  }

  public enqueue(item: Omit<NotificationQueueItem, 'id' | 'status' | 'attemptCount' | 'maxAttempts' | 'nextAttemptAt' | 'createdAt' | 'updatedAt'>): NotificationQueueItem {
    const queueItem: NotificationQueueItem = {
      ...item,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      status: 'queued',
      attemptCount: 0,
      maxAttempts: 5,
      nextAttemptAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.queue.push(queueItem);
    // Process queue asynchronously
    setImmediate(() => this.processNextBatch());
    return queueItem;
  }

  public async processNextBatch(): Promise<number> {
    const now = new Date();
    const readyItems = this.queue.filter(
      item => item.status === 'queued' && new Date(item.nextAttemptAt) <= now
    );

    let processedCount = 0;

    for (const item of readyItems) {
      item.status = 'processing';
      item.attemptCount += 1;
      item.updatedAt = new Date().toISOString();

      try {
        const result = await this.router.dispatch({
          notificationId: item.notificationId,
          recipientId: item.recipientId,
          recipientContact: item.recipientContact,
          title: item.title,
          body: item.body,
          channel: item.channel,
          priority: item.priority,
          actionUrl: item.actionUrl
        });

        const log: NotificationDeliveryLog = {
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          notificationId: item.notificationId,
          eventType: item.eventType,
          channel: item.channel,
          providerName: result.providerName,
          recipient: item.recipientContact || item.recipientId,
          status: result.success ? 'delivered' : 'failed',
          attemptCount: item.attemptCount,
          errorReason: result.error,
          responsePayload: result.rawResponse,
          timestamp: new Date().toISOString()
        };
        this.deliveryLogs.push(log);

        if (result.success) {
          item.status = 'delivered';
          item.updatedAt = new Date().toISOString();
          processedCount++;
        } else {
          this.handleFailure(item, result.error || 'Delivery failed');
        }
      } catch (err: any) {
        this.handleFailure(item, err.message || 'Unknown network error');
      }
    }

    return processedCount;
  }

  private handleFailure(item: NotificationQueueItem, errorReason: string) {
    item.lastError = errorReason;

    if (item.attemptCount >= item.maxAttempts) {
      item.status = 'failed';
      item.updatedAt = new Date().toISOString();

      const failureRecord: NotificationFailure = {
        id: `fail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        queueItemId: item.id,
        notificationId: item.notificationId,
        eventType: item.eventType,
        channel: item.channel,
        recipient: item.recipientContact || item.recipientId,
        failureReason: errorReason,
        finalAttemptCount: item.attemptCount,
        failedAt: new Date().toISOString()
      };
      this.failures.push(failureRecord);
    } else {
      // Schedule next retry with exponential backoff
      const backoffMs = this.retryBackoffMs[item.attemptCount - 1] || 60 * 60 * 1000;
      const nextAttemptTime = new Date(Date.now() + backoffMs);
      item.status = 'queued';
      item.nextAttemptAt = nextAttemptTime.toISOString();
      item.updatedAt = new Date().toISOString();
    }
  }

  public manualRetry(queueItemId: string): { success: boolean; message: string } {
    const item = this.queue.find(q => q.id === queueItemId);
    if (!item) {
      return { success: false, message: 'Queue item not found' };
    }

    item.status = 'queued';
    item.nextAttemptAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();

    setImmediate(() => this.processNextBatch());
    return { success: true, message: 'Notification queued for retry' };
  }

  public getQueue(): NotificationQueueItem[] {
    return this.queue;
  }

  public getDeliveryLogs(): NotificationDeliveryLog[] {
    return this.deliveryLogs;
  }

  public getFailures(): NotificationFailure[] {
    return this.failures;
  }

  public getStats(): CommunicationStats {
    const byChannel: Record<NotificationChannel, number> = {
      in_app: 0,
      push: 0,
      whatsapp: 0,
      sms: 0,
      email: 0
    };

    const byPriority: Record<NotificationPriority, number> = {
      high: 0,
      medium: 0,
      low: 0
    };

    const byEventType: Record<string, number> = {};

    let totalSent = this.deliveryLogs.length;
    let delivered = 0;
    let failed = 0;
    let queued = 0;
    let processing = 0;
    let retryCount = 0;

    this.queue.forEach(item => {
      if (item.status === 'queued') queued++;
      if (item.status === 'processing') processing++;
      if (item.attemptCount > 1) retryCount += (item.attemptCount - 1);
      byChannel[item.channel] = (byChannel[item.channel] || 0) + 1;
      byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
      byEventType[item.eventType] = (byEventType[item.eventType] || 0) + 1;
    });

    this.deliveryLogs.forEach(log => {
      if (log.status === 'delivered') delivered++;
      if (log.status === 'failed') failed++;
    });

    return {
      totalSent,
      queued,
      processing,
      delivered,
      failed,
      read: 0,
      retryCount,
      byChannel,
      byPriority,
      byEventType
    };
  }
}
