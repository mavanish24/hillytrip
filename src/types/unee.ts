export type UNEESourceModule =
  | 'business'
  | 'booking'
  | 'availability'
  | 'inventory'
  | 'review'
  | 'payment'
  | 'messaging'
  | 'ai'
  | 'search'
  | 'traveler'
  | 'admin';

export type UNEEEntityType =
  | 'booking'
  | 'business'
  | 'review'
  | 'inventory'
  | 'payment'
  | 'user'
  | 'system'
  | 'message';

export interface UNEEEvent {
  eventId: string;
  eventType: string; // e.g. 'business.created', 'booking.reserved', etc.
  sourceModule: UNEESourceModule;
  entityId: string;
  entityType: UNEEEntityType;
  timestamp: string;
  actor: string; // 'system' or user ID
  payload: Record<string, any>;
  metadata: {
    correlationId: string;
    idempotencyKey?: string;
    version: number;
    [key: string]: any;
  };
  version: number;
}

export type EventSubscriber = (event: UNEEEvent) => Promise<void> | void;

export interface UNEEQuietHours {
  enabled: boolean;
  start: string; // "HH:MM" 24h format
  end: string; // "HH:MM" 24h format
}

export interface UNEEPreferences {
  userId: string;
  // Top-level categories for compatibility with UserNotificationBell
  taxi: boolean;
  homestays: boolean;
  bookings: boolean;
  messages: boolean;
  reviews: boolean;
  marketing: boolean;
  announcements: boolean;
  system: boolean;
  
  // Channels
  channels: {
    inApp: boolean;
    browserPush: boolean;
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  
  // New Event Engine settings
  language: string; // "en" | "hi" | "mr" etc.
  quietHours: UNEEQuietHours;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  channel: 'inApp' | 'email' | 'sms' | 'whatsapp' | 'push' | 'browserPush';
  titleTemplate: string;
  bodyTemplate: string;
  language: string;
}

export interface DeadLetterEvent extends UNEEEvent {
  failedAt: string;
  errorReason: string;
  retryAttempts: number;
}
