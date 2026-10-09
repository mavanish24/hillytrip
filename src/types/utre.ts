export type UTREEntityType =
  | 'business'
  | 'inventory'
  | 'booking'
  | 'user'
  | 'guide'
  | 'restaurant'
  | 'taxi'
  | 'homestay'
  | string;

export interface UTRERatingDimension {
  key: string;
  label: string;
  description: string;
  weight: number; // For weighted average rating calculations
}

export interface UTREEntityConfig {
  entityType: UTREEntityType;
  dimensions: UTRERatingDimension[];
  eligibilityRules: UTREEligibilityRules;
  requiredBadgesForPremium?: string[];
}

export interface UTREEligibilityRules {
  requiresVerifiedBooking: boolean;
  requiresCompletedBooking: boolean;
  minimumStayDays?: number;
  requiresManualAdminApproval: boolean;
  allowUnverifiedReviewAfterDays?: number; // fallback rule
  maxReviewsPerBooking?: number;
}

export interface UTREReviewer {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isVerifiedPartner?: boolean;
}

export interface UTREMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  compressedUrl?: string;
  lazyLoad?: boolean;
  uploadedAt: string;
}

export interface UTREOwnerResponse {
  replyId: string;
  responderId: string;
  responderName: string;
  responderRole: 'owner' | 'staff' | 'manager';
  replyText: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UTREReview {
  id: string;
  entityType: UTREEntityType;
  entityId: string;
  bookingId?: string;
  reviewer: UTREReviewer;
  rating: number; // Overall rating out of 5
  categoryRatings: Record<string, number>; // Dimension-key -> rating
  title: string;
  body: string;
  media: UTREMedia[];
  visitDate: string;
  language: string; // e.g. "en", "hi"
  status: 'pending' | 'approved' | 'flagged' | 'hidden';
  helpfulVotes: string[]; // List of user IDs who voted helpful
  unhelpfulVotes: string[]; // List of user IDs who voted unhelpful
  reportedBy: Array<{
    userId: string;
    reason: string;
    comment?: string;
    createdAt: string;
  }>;
  responses: UTREOwnerResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface UTREReputationScore {
  entityType: UTREEntityType;
  entityId: string;
  overallScore: number; // 0 to 100 or 0 to 5
  factors: {
    averageRating: number;         // Out of 5
    reviewVolume: number;          // Total count
    recentActivityCount: number;   // Last 30 days count
    bookingCompletionRate: number; // 0 to 1
    cancellationRate: number;      // 0 to 1
    averageResponseTimeMs: number; // Owner response time
    profileCompleteness: number;   // 0 to 1
    verificationStatus: 'verified' | 'unverified' | 'pending';
    documentValidityRate: number;  // 0 to 1
    complaintRatio: number;        // Reported reviews / total reviews
    lifecycleStatus: string;
  };
  updatedAt: string;
}

export interface UTRETrustBadge {
  key: string; // e.g. "verified", "top_rated", "traveler_favorite", "fast_response", "highly_recommended", "new_business", "premium_partner"
  label: string;
  description: string;
  iconName: string; // lucide icon name
  criteriaDescription: string;
  colorScheme: 'green' | 'gold' | 'blue' | 'purple' | 'gray' | 'orange';
  isEnabled: boolean;
}

export interface UTREModerationAudit {
  id: string;
  reviewId: string;
  moderatorId: string;
  action: 'approve' | 'hide' | 'restore' | 'delete' | 'flag';
  reason: string;
  notes?: string;
  createdAt: string;
}

export interface UTRETravelerProfile {
  userId: string;
  userName: string;
  email: string;
  avatarUrl?: string;
  memberSince: string;
  reviewsWrittenCount: number;
  helpfulVotesReceived: number;
  tripsCompletedCount: number;
  trustLevel: 'newbie' | 'contributor' | 'expert' | 'elite';
  badges: string[];
}
