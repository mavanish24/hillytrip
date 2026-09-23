export type NotificationEventType =
  | 'BOOKING_CREATED'
  | 'BOOKING_ASSIGNED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_EXPIRED'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_CHANGED'
  | 'DRIVER_ARRIVING'
  | 'TRIP_STARTED'
  | 'TRIP_COMPLETED'
  | 'QUOTE_REQUESTED'
  | 'QUOTE_SUBMITTED'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_EXPIRED'
  | 'OPERATOR_ONLINE'
  | 'OPERATOR_OFFLINE'
  | 'OPERATOR_APPROVED'
  | 'OPERATOR_SUSPENDED'
  | 'CUSTOMER_REVIEW_REQUESTED'
  | 'PAYMENT_RECEIVED'
  | 'REFUND_ISSUED';

export type NotificationChannel = 'in_app' | 'push' | 'whatsapp' | 'sms' | 'email';

export type NotificationPriority = 'high' | 'medium' | 'low';

export type NotificationDeliveryStatus =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'delivered'
  | 'failed'
  | 'read'
  | 'clicked';

export type UserRole = 'customer' | 'operator' | 'admin';

export interface NotificationEventPayload {
  eventId: string;
  eventType: NotificationEventType;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientRole: UserRole;
  priority?: NotificationPriority;
  variables: Record<string, string | number | boolean | null | undefined>;
  scheduledFor?: string;
  metadata?: Record<string, any>;
}

export interface NotificationItem {
  id: string;
  eventId: string;
  eventType: NotificationEventType;
  userId: string;
  userRole: UserRole;
  channel: NotificationChannel;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  status: NotificationDeliveryStatus;
  isRead: boolean;
  isArchived: boolean;
  readAt?: string;
  clickedAt?: string;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  actionUrl?: string;
}

export interface NotificationTemplate {
  id: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  titleTemplate: string;
  bodyTemplate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  userId: string;
  userRole: UserRole;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  marketingEnabled: boolean;
  updatedAt: string;
}

export interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  providerName: string;
  recipient: string;
  status: NotificationDeliveryStatus;
  attemptCount: number;
  errorReason?: string;
  responsePayload?: any;
  timestamp: string;
}

export interface NotificationQueueItem {
  id: string;
  notificationId: string;
  eventId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  recipientId: string;
  recipientContact: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  status: NotificationDeliveryStatus;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
  actionUrl?: string;
}

export interface NotificationFailure {
  id: string;
  queueItemId: string;
  notificationId: string;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  recipient: string;
  failureReason: string;
  finalAttemptCount: number;
  failedAt: string;
}

export interface CommunicationStats {
  totalSent: number;
  queued: number;
  processing: number;
  delivered: number;
  failed: number;
  read: number;
  retryCount: number;
  byChannel: Record<NotificationChannel, number>;
  byPriority: Record<NotificationPriority, number>;
  byEventType: Record<string, number>;
}

export interface ProviderDeliveryPayload {
  notificationId: string;
  recipientId: string;
  recipientContact: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  data?: Record<string, any>;
  actionUrl?: string;
}

export interface ProviderDeliveryResult {
  success: boolean;
  providerName: string;
  messageId?: string;
  error?: string;
  rawResponse?: any;
}

export interface NotificationProvider {
  channel: NotificationChannel;
  providerName: string;
  send(payload: ProviderDeliveryPayload): Promise<ProviderDeliveryResult>;
}
