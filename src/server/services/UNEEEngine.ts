import { dbStore } from '../db';
import { 
  UNEEEvent, 
  EventSubscriber, 
  UNEEPreferences, 
  NotificationTemplate, 
  DeadLetterEvent,
  UNEESourceModule,
  UNEEEntityType
} from '../../types/unee';
import { UNENotification } from '../../types';

// ============================================================================
// 1. EVENT BUS SERVICE
// ============================================================================
export class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, Set<EventSubscriber>> = new Map();
  private processedEventIds: Set<string> = new Set();
  private processedIdempotencyKeys: Set<string> = new Set();

  private constructor() {
    this.loadProcessedHistory();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private loadProcessedHistory() {
    try {
      const raw = (dbStore as any).data;
      if (raw.uneeEvents) {
        // Keep last 500 in memory for fast deduplication check
        const recent = raw.uneeEvents.slice(-500);
        recent.forEach((ev: any) => {
          if (ev.eventId) this.processedEventIds.add(ev.eventId);
          if (ev.metadata?.idempotencyKey) this.processedIdempotencyKeys.add(ev.metadata.idempotencyKey);
        });
      }
    } catch (err) {
      console.error('UNEE: Failed to load event history:', err);
    }
  }

  /**
   * Subscribe to exact event type or wildcard patterns (e.g. "booking.*" or "business.*")
   */
  public subscribe(eventTypePattern: string, handler: EventSubscriber): void {
    if (!this.subscribers.has(eventTypePattern)) {
      this.subscribers.set(eventTypePattern, new Set());
    }
    this.subscribers.get(eventTypePattern)!.add(handler);
    console.log(`[UNEE EventBus] Registered subscriber for pattern: "${eventTypePattern}"`);
  }

  /**
   * Unsubscribe a handler
   */
  public unsubscribe(eventTypePattern: string, handler: EventSubscriber): void {
    const handlers = this.subscribers.get(eventTypePattern);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.subscribers.delete(eventTypePattern);
      }
    }
  }

  /**
   * Publish an event to the bus. Evaluates idempotency and runs handlers asynchronously.
   */
  public async publish(event: UNEEEvent): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> {
    // 1. Idempotency and Deduplication Check
    if (this.processedEventIds.has(event.eventId)) {
      console.log(`[UNEE EventBus] Event ID "${event.eventId}" already processed. Skipping (deduplicated).`);
      return { success: true, isDuplicate: true };
    }
    if (event.metadata?.idempotencyKey && this.processedIdempotencyKeys.has(event.metadata.idempotencyKey)) {
      console.log(`[UNEE EventBus] Idempotency Key "${event.metadata.idempotencyKey}" already processed. Skipping.`);
      return { success: true, isDuplicate: true };
    }

    // Mark as processed
    this.processedEventIds.add(event.eventId);
    if (event.metadata?.idempotencyKey) {
      this.processedIdempotencyKeys.add(event.metadata.idempotencyKey);
    }

    // 2. Persist Event to database Event Log
    try {
      const raw = (dbStore as any).data;
      if (!raw.uneeEvents) raw.uneeEvents = [];
      raw.uneeEvents.push(event);
      dbStore.save();
    } catch (saveErr) {
      console.error('[UNEE EventBus] Failed to persist event log:', saveErr);
    }

    // 3. Find matching subscribers (exact match or wildcard match)
    const matchedSubscribers: EventSubscriber[] = [];
    for (const [pattern, handlers] of this.subscribers.entries()) {
      if (this.isPatternMatch(pattern, event.eventType)) {
        matchedSubscribers.push(...Array.from(handlers));
      }
    }

    // 4. Asynchronously process matched subscribers with retry logic
    if (matchedSubscribers.length > 0) {
      setImmediate(() => {
        this.dispatchAsync(event, matchedSubscribers);
      });
    }

    return { success: true, isDuplicate: false };
  }

  private isPatternMatch(pattern: string, eventType: string): boolean {
    if (pattern === '*' || pattern === eventType) return true;
    if (pattern.includes('*')) {
      const regexStr = '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
      const regex = new RegExp(regexStr);
      return regex.test(eventType);
    }
    return false;
  }

  private async dispatchAsync(event: UNEEEvent, subscribers: EventSubscriber[]): Promise<void> {
    const promises = subscribers.map(async (subscriber) => {
      let attempts = 0;
      const maxAttempts = 3;
      let success = false;
      let lastError = '';

      while (attempts < maxAttempts && !success) {
        attempts++;
        try {
          await subscriber(event);
          success = true;
        } catch (err: any) {
          lastError = err?.message || String(err);
          console.warn(`[UNEE EventBus] Subscriber attempt ${attempts}/${maxAttempts} failed for event "${event.eventType}" (${event.eventId}). Error: ${lastError}`);
          if (attempts < maxAttempts) {
            // Backoff delay
            await new Promise(resolve => setTimeout(resolve, attempts * 500));
          }
        }
      }

      if (!success) {
        console.error(`[UNEE EventBus] Subscriber completely failed after ${maxAttempts} attempts for event "${event.eventId}". Sending to DLQ.`);
        await this.routeToDLQ(event, lastError, attempts);
      }
    });

    await Promise.allSettled(promises);
  }

  private async routeToDLQ(event: UNEEEvent, errorReason: string, retryAttempts: number): Promise<void> {
    try {
      const raw = (dbStore as any).data;
      if (!raw.uneeDlq) raw.uneeDlq = [];

      const dlqItem: DeadLetterEvent = {
        ...event,
        failedAt: new Date().toISOString(),
        errorReason,
        retryAttempts
      };

      raw.uneeDlq.push(dlqItem);
      dbStore.save();
      console.error(`[UNEE DLQ] Dead letter event recorded: "${event.eventId}" | Error: ${errorReason}`);
    } catch (err) {
      console.error('[UNEE DLQ] Failed to write to Dead Letter Queue:', err);
    }
  }

  /**
   * Helper to construct a standard event
   */
  public static createEvent(
    eventType: string,
    sourceModule: UNEESourceModule,
    entityId: string,
    entityType: UNEEEntityType,
    actor: string,
    payload: Record<string, any>,
    idempotencyKey?: string,
    correlationId?: string
  ): UNEEEvent {
    return {
      eventId: `EV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      eventType,
      sourceModule,
      entityId,
      entityType,
      timestamp: new Date().toISOString(),
      actor,
      payload,
      metadata: {
        correlationId: correlationId || `CORR-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        idempotencyKey,
        version: 1
      },
      version: 1
    };
  }
}

// ============================================================================
// 2. TEMPLATE SERVICE
// ============================================================================
export class TemplateService {
  private static defaultTemplates: NotificationTemplate[] = [
    // --- BUSINESS lifecycle templates ---
    {
      id: 'tmpl-business-created-inApp',
      name: 'Business Registration Submitted (In-App)',
      category: 'system',
      channel: 'inApp',
      titleTemplate: 'Business Profile Registered: {Business Name}',
      bodyTemplate: 'Hi {Traveler Name}, your business application for "{Business Name}" has been received and is awaiting admin approval. Status: {Verification Status}.',
      language: 'en'
    },
    {
      id: 'tmpl-business-approved-inApp',
      name: 'Business Verification Success (In-App)',
      category: 'system',
      channel: 'inApp',
      titleTemplate: '🎉 Business Verified! - {Business Name}',
      bodyTemplate: 'Congratulations! Your business "{Business Name}" has been verified and approved by HillyTrip Admins. You can now receive active bookings and lead notifications.',
      language: 'en'
    },
    {
      id: 'tmpl-business-suspended-inApp',
      name: 'Business Suspension Warning (In-App)',
      category: 'system',
      channel: 'inApp',
      titleTemplate: '⚠️ Action Required: Business Suspended',
      bodyTemplate: 'Your business "{Business Name}" has been suspended due to: {Reason}. Please update your verification documents or contact partner support.',
      language: 'en'
    },
    // --- BOOKING lifecycle templates ---
    {
      id: 'tmpl-booking-created-inApp',
      name: 'Booking Request Submitted (In-App)',
      category: 'bookings',
      channel: 'inApp',
      titleTemplate: 'New Booking Enquired - #{Booking Number}',
      bodyTemplate: 'Your booking request for "{Inventory Name}" on {Dates} has been registered! Total amount: INR {Amount}. We are holding this request for you.',
      language: 'en'
    },
    {
      id: 'tmpl-booking-reserved-inApp',
      name: 'Provisional Reservation Lock (In-App)',
      category: 'bookings',
      channel: 'inApp',
      titleTemplate: '⏰ Provisional Hold Locked - #{Booking Number}',
      bodyTemplate: 'Inventory for "{Inventory Name}" has been provisionally reserved for you until {ExpiryTime}. Complete payment of INR {Amount} to finalize.',
      language: 'en'
    },
    {
      id: 'tmpl-booking-confirmed-inApp',
      name: 'Booking Confirmed (In-App)',
      category: 'bookings',
      channel: 'inApp',
      titleTemplate: '✅ Booking Confirmed! - #{Booking Number}',
      bodyTemplate: 'Excellent, {Traveler Name}! Your booking for "{Inventory Name}" starting {Dates} is fully confirmed. Preparing for check-in.',
      language: 'en'
    },
    {
      id: 'tmpl-booking-cancelled-inApp',
      name: 'Booking Cancelled (In-App)',
      category: 'bookings',
      channel: 'inApp',
      titleTemplate: '❌ Booking Cancelled - #{Booking Number}',
      bodyTemplate: 'Booking #{Booking Number} for "{Inventory Name}" has been cancelled. Refund status: {Reason}.',
      language: 'en'
    },
    {
      id: 'tmpl-booking-completed-inApp',
      name: 'Trip Completed Review Request (In-App)',
      category: 'reviews',
      channel: 'inApp',
      titleTemplate: '⭐ Share Your Feedback - #{Booking Number}',
      bodyTemplate: 'We hope you enjoyed your stay at "{Inventory Name}". Tap here to review your experience and help future travelers!',
      language: 'en'
    },
    // --- AVAILABILITY and INVENTORY templates ---
    {
      id: 'tmpl-inventory-warning-inApp',
      name: 'Low Inventory Alert (In-App)',
      category: 'system',
      channel: 'inApp',
      titleTemplate: '🚨 Inventory Warning: Low Rooms/Vehicles',
      bodyTemplate: 'Warning! "{Inventory Name}" is running low on active inventory. Please update listings to prevent double-bookings.',
      language: 'en'
    },
    // --- REVIEWS templates ---
    {
      id: 'tmpl-review-created-inApp',
      name: 'New Review Notification (In-App)',
      category: 'reviews',
      channel: 'inApp',
      titleTemplate: 'New {Rating} Star Review Left',
      bodyTemplate: 'Traveler {Traveler Name} left a {Rating}-star rating for "{Inventory Name}": "{ReviewText}"',
      language: 'en'
    },
    // --- GENERAL email/sms placeholders to mock delivery structure ---
    {
      id: 'tmpl-booking-confirmed-email',
      name: 'Booking Confirmation Email Template',
      category: 'bookings',
      channel: 'email',
      titleTemplate: 'HillyTrip - Confirmed Booking #{Booking Number}',
      bodyTemplate: 'Dear {Traveler Name},\n\nWe are pleased to confirm your reservation at "{Inventory Name}".\nDates: {Dates}\nTotal Paid: INR {Amount}\nEnjoy your hilly vacation!\n\nBest wishes,\nHillyTrip Team',
      language: 'en'
    },
    {
      id: 'tmpl-booking-confirmed-whatsapp',
      name: 'Booking Confirmation WhatsApp Template',
      category: 'bookings',
      channel: 'whatsapp',
      titleTemplate: 'Booking Confirmed! ✅',
      bodyTemplate: 'Hi {Traveler Name}, your HillyTrip booking #{Booking Number} for "{Inventory Name}" ({Dates}) is CONFIRMED. Total: INR {Amount}. Need help? Ask us here!',
      language: 'en'
    }
  ];

  public static getTemplates(): NotificationTemplate[] {
    const raw = (dbStore as any).data;
    if (!raw.uneeTemplates) {
      raw.uneeTemplates = [...TemplateService.defaultTemplates];
      dbStore.save();
    }
    return raw.uneeTemplates;
  }

  public static getTemplate(eventType: string, channel: 'inApp' | 'email' | 'sms' | 'whatsapp' | 'push' | 'browserPush', language: string = 'en'): NotificationTemplate | null {
    const templates = this.getTemplates();
    
    // Map event type directly or fallback
    let lookupCategory = 'system';
    if (eventType.startsWith('booking.')) lookupCategory = 'bookings';
    else if (eventType.startsWith('business.')) lookupCategory = 'system';
    else if (eventType.startsWith('review.')) lookupCategory = 'reviews';
    else if (eventType.startsWith('inventory.')) lookupCategory = 'system';

    const cleanChannel = channel === 'browserPush' ? 'inApp' : channel;
    const exactId = `tmpl-${eventType.replace(/\./g, '-')}-${cleanChannel}`;

    const match = templates.find(t => t.id === exactId && t.language === language) ||
                  templates.find(t => t.category === lookupCategory && t.channel === cleanChannel && t.language === language) ||
                  templates.find(t => t.channel === cleanChannel && t.language === 'en');
    return match || null;
  }

  public static interpolate(text: string, variables: Record<string, any>): string {
    return text.replace(/{([^{}]+)}/g, (match, key) => {
      const cleanKey = key.trim();
      return variables[cleanKey] !== undefined ? String(variables[cleanKey]) : match;
    });
  }
}

// ============================================================================
// 3. PREFERENCE SERVICE
// ============================================================================
export class PreferenceService {
  public static getPreferences(userId: string): UNEEPreferences {
    const raw = (dbStore as any).data;
    if (!raw.uneePreferences) raw.uneePreferences = [];

    let prefs = raw.uneePreferences.find((p: any) => p.userId === userId);
    if (!prefs) {
      prefs = {
        userId,
        taxi: true,
        homestays: true,
        bookings: true,
        messages: true,
        reviews: true,
        marketing: true,
        announcements: true,
        system: true,
        channels: {
          inApp: true,
          browserPush: true,
          email: true,
          whatsapp: false,
          sms: false
        },
        language: 'en',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '07:00'
        }
      };
      raw.uneePreferences.push(prefs);
      dbStore.save();
    }
    return prefs;
  }

  public static savePreferences(userId: string, prefs: Partial<UNEEPreferences>): UNEEPreferences {
    const raw = (dbStore as any).data;
    if (!raw.uneePreferences) raw.uneePreferences = [];

    const index = raw.uneePreferences.findIndex((p: any) => p.userId === userId);
    const existing = this.getPreferences(userId);
    const updated: UNEEPreferences = {
      ...existing,
      ...prefs,
      channels: { ...existing.channels, ...(prefs.channels || {}) },
      quietHours: { ...existing.quietHours, ...(prefs.quietHours || {}) },
      userId
    };

    if (index >= 0) {
      raw.uneePreferences[index] = updated;
    } else {
      raw.uneePreferences.push(updated);
    }
    dbStore.save();
    return updated;
  }

  /**
   * Determine if a category and channel should deliver for a given user, respecting Quiet Hours
   */
  public static shouldDeliver(userId: string, category: string, channel: 'inApp' | 'email' | 'sms' | 'whatsapp' | 'push' | 'browserPush'): { deliver: boolean; reason?: string } {
    const prefs = this.getPreferences(userId);

    // 1. Check Category Subscription booleans
    let catKey: keyof UNEEPreferences = 'system';
    const normCategory = category.toLowerCase();
    
    if (normCategory.includes('taxi')) catKey = 'taxi';
    else if (normCategory.includes('homestay') || normCategory.includes('stay')) catKey = 'homestays';
    else if (normCategory.includes('booking')) catKey = 'bookings';
    else if (normCategory.includes('message') || normCategory.includes('chat')) catKey = 'messages';
    else if (normCategory.includes('review')) catKey = 'reviews';
    else if (normCategory.includes('marketing') || normCategory.includes('offer')) catKey = 'marketing';
    else if (normCategory.includes('announcement')) catKey = 'announcements';

    if (prefs[catKey] === false) {
      return { deliver: false, reason: `Opted-out of category: ${category}` };
    }

    // 2. Check Channel Enabled
    const cleanChannel = channel === 'push' ? 'browserPush' : channel;
    const channelEnabled = (prefs.channels as any)[cleanChannel] !== false;
    if (!channelEnabled) {
      return { deliver: false, reason: `Opted-out of channel delivery: ${channel}` };
    }

    // 3. Check Quiet Hours
    if (prefs.quietHours?.enabled && channel !== 'inApp') {
      const inQuietHours = this.isCurrentlyInQuietHours(prefs.quietHours.start, prefs.quietHours.end);
      if (inQuietHours) {
        return { deliver: false, reason: 'Recipient currently in Quiet Hours window' };
      }
    }

    return { deliver: true };
  }

  private static isCurrentlyInQuietHours(start: string, end: string): boolean {
    try {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes();

      const [sHr, sMin] = start.split(':').map(Number);
      const [eHr, eMin] = end.split(':').map(Number);

      const startMin = sHr * 60 + sMin;
      const endMin = eHr * 60 + eMin;

      if (startMin <= endMin) {
        return currentMin >= startMin && currentMin <= endMin;
      } else {
        // Quiet hours cross midnight
        return currentMin >= startMin || currentMin <= endMin;
      }
    } catch {
      return false;
    }
  }
}

// ============================================================================
// 4. NOTIFICATION ENGINE SERVICE
// ============================================================================
export class NotificationService {
  /**
   * Consumes an EventBus event and generates targeted notifications
   */
  public static async processEvent(event: UNEEEvent): Promise<void> {
    console.log(`[UNEE NotificationService] Processing event "${event.eventType}" (${event.eventId})`);
    
    // Resolve standard variables
    const variables: Record<string, any> = {
      'Business Name': event.payload.businessName || event.payload.serviceName || 'HillyTrip Business',
      'Traveler Name': event.payload.customerName || event.payload.userName || 'HillyTrip Traveler',
      'Booking Number': event.payload.bookingId || event.entityId || 'N/A',
      'Dates': event.payload.checkInDate ? `${event.payload.checkInDate}${event.payload.checkOutDate ? ' to ' + event.payload.checkOutDate : ''}` : 'N/A',
      'Inventory Name': event.payload.serviceName || event.payload.homestayName || event.payload.cabDriverName || 'HillyTrip Service',
      'Amount': event.payload.bookingAmount || event.payload.amount || 'N/A',
      'Verification Status': event.payload.verificationStatus || event.payload.status || 'Pending',
      'Reason': event.payload.notes || event.payload.reason || 'No details provided',
      'Rating': event.payload.rating || '5',
      'ReviewText': event.payload.reviewText || '',
      'ExpiryTime': event.payload.reservationExpiresAt ? new Date(event.payload.reservationExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '15 mins'
    };

    // Determine targeted users and roles
    const recipients: { userId: string; role: 'customer' | 'partner' | 'admin' }[] = [];

    const actorId = event.actor;
    const customerId = event.payload.customerEmail || event.payload.customerMobile || event.payload.customerUserId;
    const partnerId = event.payload.assignedPartnerId || event.payload.partnerId || event.payload.ownerId;

    // Dispatch rules
    if (event.eventType.startsWith('booking.')) {
      if (customerId) {
        recipients.push({ userId: customerId, role: 'customer' });
      }
      if (partnerId) {
        recipients.push({ userId: partnerId, role: 'partner' });
      }
      if (['booking.cancelled', 'booking.disputed'].includes(event.eventType)) {
        recipients.push({ userId: 'admin', role: 'admin' });
      }
    } else if (event.eventType.startsWith('business.')) {
      if (partnerId) {
        recipients.push({ userId: partnerId, role: 'partner' });
      }
      if (['business.created', 'business.suspended'].includes(event.eventType)) {
        recipients.push({ userId: 'admin', role: 'admin' });
      }
    } else if (event.eventType.startsWith('review.')) {
      if (partnerId) {
        recipients.push({ userId: partnerId, role: 'partner' });
      }
      if (['review.reported', 'review.created'].includes(event.eventType)) {
        recipients.push({ userId: 'admin', role: 'admin' });
      }
    } else if (event.eventType.startsWith('inventory.') || event.eventType.startsWith('availability.')) {
      if (partnerId) {
        recipients.push({ userId: partnerId, role: 'partner' });
      }
    }

    // Ensure system actor if distinct
    if (actorId && actorId !== 'system' && !recipients.some(r => r.userId === actorId)) {
      recipients.push({ userId: actorId, role: 'customer' });
    }

    // Deliver
    for (const recipient of recipients) {
      await this.deliverToRecipient(recipient.userId, recipient.role, event, variables);
    }
  }

  private static async deliverToRecipient(
    userId: string,
    role: 'customer' | 'partner' | 'admin',
    event: UNEEEvent,
    variables: Record<string, any>
  ): Promise<void> {
    const prefs = PreferenceService.getPreferences(userId);
    const channels: ('inApp' | 'email' | 'sms' | 'whatsapp' | 'browserPush')[] = ['inApp', 'email', 'sms', 'whatsapp', 'browserPush'];

    for (const channel of channels) {
      let category = event.sourceModule as string;
      if (category === 'booking') category = 'bookings';
      
      const check = PreferenceService.shouldDeliver(userId, category, channel);
      if (!check.deliver) {
        continue;
      }

      // Fetch template
      const template = TemplateService.getTemplate(event.eventType, channel, prefs.language);
      if (!template) {
        continue;
      }

      // Resolve variables
      const finalTitle = TemplateService.interpolate(template.titleTemplate, variables);
      const finalBody = TemplateService.interpolate(template.bodyTemplate, variables);

      // Dispatch
      if (channel === 'inApp' || channel === 'browserPush') {
        await this.createInAppNotification(userId, role, event, finalTitle, finalBody);
      } else {
        await this.logExternalDelivery(userId, role, channel, finalTitle, finalBody, event);
      }
    }
  }

  private static async createInAppNotification(
    userId: string,
    role: string,
    event: UNEEEvent,
    title: string,
    message: string
  ): Promise<void> {
    try {
      const notifId = `UNEE-NOTIF-${Date.now()}-${Math.floor(Math.random() * 9000)}`;
      let calculatedPriority: 'critical' | 'high' | 'normal' | 'low' = 'normal';
      if (['booking.cancelled', 'booking.completed', 'business.suspended'].includes(event.eventType)) {
        calculatedPriority = 'critical';
      } else if (['booking.reserved', 'booking.confirmed', 'business.approved'].includes(event.eventType)) {
        calculatedPriority = 'high';
      }

      // Save a record to bookingNotifications which feed into the existing dropdown
      const newNotif = {
        id: notifId,
        userId: userId,
        role: role,
        leadId: event.entityType === 'booking' ? event.entityId : undefined,
        title,
        message,
        category: event.eventType,
        isRead: false,
        createdAt: new Date().toISOString()
      };

      await dbStore.saveRecord('bookingNotifications', newNotif);
      console.log(`[UNEE Delivery] In-app notification created successfully for user "${userId}": "${title}"`);
    } catch (err) {
      console.error('[UNEE Delivery] Failed to create InApp notification:', err);
    }
  }

  private static async logExternalDelivery(
    userId: string,
    role: string,
    channel: 'email' | 'sms' | 'whatsapp' | 'browserPush',
    title: string,
    body: string,
    event: UNEEEvent
  ): Promise<void> {
    try {
      const raw = (dbStore as any).data;
      if (!raw.uneeDeliveryLog) raw.uneeDeliveryLog = [];

      const logEntry = {
        id: `LOG-DELIVER-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        userId,
        role,
        channel,
        title,
        body,
        status: 'queued_ready_for_production',
        sentAt: new Date().toISOString(),
        metadata: {
          correlationId: event.metadata.correlationId,
          eventId: event.eventId,
          eventType: event.eventType
        }
      };

      raw.uneeDeliveryLog.push(logEntry);
      dbStore.save();
      console.log(`[UNEE Delivery Log] Simulated ${channel.toUpperCase()} dispatch to "${userId}" (Subject: "${title}")`);
    } catch (err) {
      console.error('[UNEE Delivery Log] Failed to log external dispatch:', err);
    }
  }
}

// ============================================================================
// 5. NOTIFICATION CENTER SERVICE
// ============================================================================
export class NotificationCenterService {
  public static fetchUserNotifications(
    userId: string,
    role: string,
    filters: { category?: string; status?: 'read' | 'unread' | 'all'; query?: string; smartGrouping?: boolean }
  ): UNENotification[] {
    const prefs = PreferenceService.getPreferences(userId);
    const list: UNENotification[] = [];

    // 1. System announcements
    if (prefs.system !== false) {
      const appNotifs = dbStore.getAppNotifications().filter(n => n.status === 'published');
      appNotifs.forEach(n => {
        let category: any = 'system';
        if (n.type === 'route_alert') category = 'taxi';
        else if (n.type === 'homestay_added') category = 'homestay';

        let priority: any = 'normal';
        if (n.priority === 'urgent') priority = 'critical';
        else if (n.priority === 'important') priority = 'high';

        list.push({
          id: n.id,
          userId: 'all',
          title: n.title,
          message: n.message,
          type: n.type || 'announcement',
          category,
          priority,
          isRead: false,
          isArchived: false,
          isDeleted: false,
          createdAt: n.createdAt,
          actionUrl: n.type === 'homestay_added' ? '/homestays' : n.type === 'route_alert' ? '/routes' : undefined,
          actionLabel: n.type === 'homestay_added' ? 'View Homestays' : n.type === 'route_alert' ? 'View Routes' : undefined
        });
      });
    }

    // 2. Booking notifications
    const bookingNotifs = dbStore.getBookingNotifications().filter(
      n => n.userId && n.userId.toLowerCase() === userId.toLowerCase()
    );
    bookingNotifs.forEach(n => {
      let category: any = 'bookings';
      const msgLower = (n.message || '').toLowerCase();
      const titleLower = (n.title || '').toLowerCase();

      if (msgLower.includes('taxi') || titleLower.includes('taxi') || msgLower.includes('quote') || titleLower.includes('quote')) {
        category = 'taxi';
      } else if (msgLower.includes('homestay') || titleLower.includes('homestay') || msgLower.includes('room') || titleLower.includes('room')) {
        category = 'homestay';
      }

      if (category === 'taxi' && prefs.taxi === false) return;
      if (category === 'homestay' && prefs.homestays === false) return;
      if (category === 'bookings' && prefs.bookings === false) return;

      let priority: any = 'normal';
      if (msgLower.includes('urgent') || msgLower.includes('immediate') || msgLower.includes('warn') || msgLower.includes('alarm')) {
        priority = 'high';
      }

      list.push({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.category || 'booking_update',
        category,
        priority,
        isRead: !!n.isRead,
        isArchived: false,
        isDeleted: false,
        createdAt: n.createdAt,
        actionUrl: n.leadId ? `/booking/${n.leadId}` : undefined,
        actionLabel: 'Open Booking'
      });
    });

    // 3. Chat direct message notifications
    if (prefs.messages !== false) {
      const chatNotifs = dbStore.getChatNotifications().filter(n => n.receiver_id === userId);
      chatNotifs.forEach(n => {
        list.push({
          id: n.id,
          userId: n.receiver_id,
          title: n.title,
          message: n.body,
          type: n.type || 'new_message',
          category: 'messages',
          priority: 'high',
          isRead: !!n.is_read,
          isArchived: false,
          isDeleted: false,
          createdAt: n.created_at,
          actionUrl: n.reference_id ? `open_chat_${n.reference_id}` : undefined,
          actionLabel: 'View Message'
        });
      });
    }

    // 4. Review alerts
    const genericNotifs = dbStore.getNotifications().filter(n => n.userId === userId);
    genericNotifs.forEach(n => {
      let category: any = 'system';
      if (n.type && (n.type.includes('review') || n.message.toLowerCase().includes('review'))) {
        category = 'reviews';
      }

      if (category === 'reviews' && prefs.reviews === false) return;

      list.push({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type || 'generic',
        category,
        priority: 'normal',
        isRead: !!n.isRead,
        isArchived: false,
        isDeleted: false,
        createdAt: n.createdAt
      });
    });

    let filtered = list;
    if (filters.status === 'read') {
      filtered = filtered.filter(n => n.isRead);
    } else if (filters.status === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(n => n.category === filters.category);
    }

    if (filters.query?.trim()) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        n => (n.title || '').toLowerCase().includes(q) || (n.message || '').toLowerCase().includes(q)
      );
    }

    if (filters.smartGrouping && !filters.query) {
      const grouped: UNENotification[] = [];
      const messagesGroup: UNENotification[] = [];
      const quotesGroup: UNENotification[] = [];

      filtered.forEach(item => {
        if (!item.isRead) {
          if (item.category === 'messages') {
            messagesGroup.push(item);
          } else if (item.category === 'taxi' && item.type.includes('submitted')) {
            quotesGroup.push(item);
          } else {
            grouped.push(item);
          }
        } else {
          grouped.push(item);
        }
      });

      if (messagesGroup.length > 1) {
        grouped.unshift({
          id: `group_msg_${Date.now()}`,
          userId: userId,
          title: '💬 Unread Live Messages Group',
          message: `You have ${messagesGroup.length} unread direct messages waiting for review.`,
          type: 'new_message_group',
          category: 'messages',
          priority: 'high',
          isRead: false,
          isArchived: false,
          isDeleted: false,
          createdAt: messagesGroup[0].createdAt,
          actionUrl: '/messages',
          actionLabel: 'Open Inbox'
        });
      } else if (messagesGroup.length === 1) {
        grouped.push(messagesGroup[0]);
      }

      if (quotesGroup.length > 1) {
        grouped.unshift({
          id: `group_taxi_${Date.now()}`,
          userId: userId,
          title: '🚕 Multiple New Driver Quotes',
          message: `You received ${quotesGroup.length} new transport bids for your hilly trip route.`,
          type: 'taxi_quote_group',
          category: 'taxi',
          priority: 'high',
          isRead: false,
          isArchived: false,
          isDeleted: false,
          createdAt: quotesGroup[0].createdAt,
          actionUrl: '/messages',
          actionLabel: 'View Bids'
        });
      } else if (quotesGroup.length === 1) {
        grouped.push(quotesGroup[0]);
      }

      filtered = grouped;
    }

    filtered.sort((a, b) => {
      const pA = a.priority === 'critical' ? 3 : a.priority === 'high' ? 2 : a.priority === 'normal' ? 1 : 0;
      const pB = b.priority === 'critical' ? 3 : b.priority === 'high' ? 2 : b.priority === 'normal' ? 1 : 0;

      if (pA !== pB) return pB - pA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }
}

// ============================================================================
// 6. EVENT SUBSCRIBER REGISTRY
// ============================================================================
export class EventSubscriberRegistry {
  private static registered = false;

  public static registerAll(): void {
    if (this.registered) return;

    const bus = EventBus.getInstance();

    // Subscribe to all events
    bus.subscribe('*', async (event) => {
      await NotificationService.processEvent(event);
    });

    // Sub-subscribers (custom logic)
    bus.subscribe('inventory.updated', async (event) => {
      const quantity = Number(event.payload.quantity);
      if (!isNaN(quantity) && quantity <= 1) {
        const warningEvent = EventBus.createEvent(
          'inventory.warning',
          'inventory',
          event.entityId,
          'inventory',
          'system',
          { ...event.payload, warningType: 'low_stock' }
        );
        await bus.publish(warningEvent);
      }
    });

    bus.subscribe('business.approved', async (event) => {
      console.log(`[UNEE Registry] Business approved: ${event.payload.businessName}`);
    });

    this.registered = true;
    console.log('[UNEE SubscriberRegistry] Registered subscribers successfully.');
  }
}

// Auto-register on startup
EventSubscriberRegistry.registerAll();
