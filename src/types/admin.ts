export type AdminRole = 'super_admin' | 'operations' | 'finance' | 'content' | 'moderator' | 'support';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'traveller' | 'business_owner' | 'taxi_operator' | 'homestay_owner' | 'guide' | 'content_editor' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';
  verified: boolean;
  district?: string;
  state?: string;
  createdAt: string;
  lastLoginAt?: string;
  totalBookingsCount?: number;
  totalSpentInr?: number;
}

export interface ManagedBusiness {
  id: string;
  name: string;
  type: 'homestay' | 'taxi_operator' | 'restaurant' | 'guide' | 'activity_provider';
  ownerId: string;
  ownerName: string;
  district: string;
  state: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verified: boolean;
  isFeatured: boolean;
  rating: number;
  totalBookingsCount: number;
  totalRevenueInr: number;
  createdAt: string;
}

export interface BusinessClaimRequest {
  id: string;
  businessId: string;
  businessName: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  documentType: 'trade_license' | 'gstin' | 'tax_token' | 'aadhaar' | 'electricity_bill';
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'docs_requested';
  submittedAt: string;
  reviewedBy?: string;
  notes?: string;
}

export interface ModerationQueueItem {
  id: string;
  targetType: 'review' | 'comment' | 'traveler_moment' | 'photo' | 'blog';
  targetId: string;
  contentSnippet: string;
  authorName: string;
  flagReason: 'spam' | 'inappropriate' | 'fake_review' | 'copyright' | 'user_reported';
  status: 'pending' | 'approved' | 'rejected' | 'hidden' | 'restored';
  reportedCount: number;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  adminRole: AdminRole;
  action: string;
  module: 'users' | 'businesses' | 'claims' | 'moderation' | 'bookings' | 'payments' | 'settings' | 'flags';
  details: string;
  targetId?: string;
  ipAddress?: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  module: string;
  rolledOutDistricts?: string[];
  updatedAt: string;
}

export interface GlobalPlatformSetting {
  key: string;
  category: 'commission' | 'booking' | 'seo' | 'notifications' | 'maintenance';
  label: string;
  value: any;
  updatedAt: string;
}

export interface PlatformOverviewAnalytics {
  activeUsers24h: number;
  totalRegisteredUsers: number;
  totalBusinesses: number;
  totalBookings: number;
  grossBookingValueInr: number;
  netCommissionInr: number;
  pendingApprovalsCount: number;
  moderationQueueCount: number;
  activeClaimsCount: number;
  systemHealthStatus: 'healthy' | 'degraded' | 'maintenance';
  trendingSearchQueries: { query: string; count: number }[];
  zeroResultQueries: { query: string; count: number }[];
  topDestinations: { name: string; bookings: number; pageViews: number }[];
}
