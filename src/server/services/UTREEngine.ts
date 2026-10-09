import { dbStore } from '../db';
import { EventBus } from './UNEEEngine';
import { 
  UTREReview, 
  UTREEntityConfig, 
  UTREReputationScore, 
  UTRETrustBadge, 
  UTREModerationAudit, 
  UTRETravelerProfile, 
  UTREOwnerResponse, 
  UTREMedia,
  UTREEntityType
} from '../../types/utre';

// Default seeded entity configurations
const DEFAULT_ENTITY_CONFIGS: UTREEntityConfig[] = [
  {
    entityType: 'homestay',
    dimensions: [
      { key: 'cleanliness', label: 'Cleanliness', description: 'Hygiene and neatness of rooms & toilets', weight: 1.0 },
      { key: 'hospitality', label: 'Hospitality', description: 'Host warmth, behavior, and responsiveness', weight: 1.0 },
      { key: 'comfort', label: 'Comfort', description: 'Bedding, heating, hot water, and amenities', weight: 1.0 },
      { key: 'food', label: 'Food', description: 'Taste, quality, cleanliness, and portions', weight: 1.0 },
      { key: 'location', label: 'Location', description: 'Ease of access, views, and surroundings', weight: 1.0 },
      { key: 'value', label: 'Value for Money', description: 'Whether the price matches experience', weight: 1.0 }
    ],
    eligibilityRules: {
      requiresVerifiedBooking: true,
      requiresCompletedBooking: true,
      minimumStayDays: 1,
      requiresManualAdminApproval: false,
      maxReviewsPerBooking: 1
    }
  },
  {
    entityType: 'taxi',
    dimensions: [
      { key: 'driving', label: 'Driving Quality', description: 'Safe speed, steering, and mountain navigation', weight: 1.0 },
      { key: 'cleanliness', label: 'Vehicle Cleanliness', description: 'Interior hygiene, seats, and odor', weight: 1.0 },
      { key: 'safety', label: 'Safety & Security', description: 'Presence of emergency equipment, driver sobriety', weight: 1.0 },
      { key: 'punctuality', label: 'Punctuality', description: 'On-time pickup and arrival', weight: 1.0 },
      { key: 'value', label: 'Value for Money', description: 'Pricing satisfaction', weight: 1.0 }
    ],
    eligibilityRules: {
      requiresVerifiedBooking: true,
      requiresCompletedBooking: true,
      requiresManualAdminApproval: false,
      maxReviewsPerBooking: 1
    }
  },
  {
    entityType: 'guide',
    dimensions: [
      { key: 'knowledge', label: 'Expert Knowledge', description: 'Familiarity with history, trails, and safety', weight: 1.0 },
      { key: 'communication', label: 'Communication', description: 'Language fluency and clarity', weight: 1.0 },
      { key: 'friendliness', label: 'Friendliness', description: 'Politeness and enthusiasm', weight: 1.0 },
      { key: 'value', label: 'Value for Money', description: 'Pricing satisfaction', weight: 1.0 }
    ],
    eligibilityRules: {
      requiresVerifiedBooking: true,
      requiresCompletedBooking: true,
      requiresManualAdminApproval: true, // Guides require manual audit
      maxReviewsPerBooking: 1
    }
  },
  {
    entityType: 'restaurant',
    dimensions: [
      { key: 'food', label: 'Food Quality', description: 'Taste, temperature, and presentation', weight: 1.2 },
      { key: 'service', label: 'Service Speed & Courtesy', description: 'Staff behavior and waiting times', weight: 0.8 },
      { key: 'ambience', label: 'Ambience', description: 'Seating, decor, view, and cleanliness', weight: 1.0 },
      { key: 'value', label: 'Value for Money', description: 'Portion sizes and pricing', weight: 1.0 }
    ],
    eligibilityRules: {
      requiresVerifiedBooking: false, // Walk-ins welcome
      requiresCompletedBooking: false,
      requiresManualAdminApproval: false,
      maxReviewsPerBooking: 5
    }
  }
];

// Default trust badge configurations
const DEFAULT_BADGES: UTRETrustBadge[] = [
  {
    key: 'verified',
    label: 'Verified Partner',
    description: 'Officially verified identity and compliance documentation.',
    iconName: 'ShieldCheck',
    criteriaDescription: 'Profile completed, document verified, no active customer complaints.',
    colorScheme: 'blue',
    isEnabled: true
  },
  {
    key: 'top_rated',
    label: 'Top Rated',
    description: 'Maintains an exceptional rating and service standard.',
    iconName: 'Star',
    criteriaDescription: 'Average rating of 4.7+ and minimum of 5 reviews.',
    colorScheme: 'gold',
    isEnabled: true
  },
  {
    key: 'traveler_favorite',
    label: 'Traveler Favorite',
    description: 'Frequently selected and consistently loved by travelers.',
    iconName: 'Heart',
    criteriaDescription: 'Highly positive sentiment and 10+ completed bookings.',
    colorScheme: 'purple',
    isEnabled: true
  },
  {
    key: 'fast_response',
    label: 'Fast Response',
    description: 'Replies rapidly to bookings and traveler inquiries.',
    iconName: 'Clock',
    criteriaDescription: 'Average response time under 30 minutes.',
    colorScheme: 'green',
    isEnabled: true
  },
  {
    key: 'highly_recommended',
    label: 'Highly Recommended',
    description: 'Superb driver behavior and local expertise.',
    iconName: 'Award',
    criteriaDescription: 'Over 90% of reviewers marked as "Would Recommend".',
    colorScheme: 'orange',
    isEnabled: true
  },
  {
    key: 'new_business',
    label: 'New Business',
    description: 'Recently registered business on HillyTrip.',
    iconName: 'Sparkles',
    criteriaDescription: 'Registered on the platform within the last 90 days.',
    colorScheme: 'gray',
    isEnabled: true
  },
  {
    key: 'premium_partner',
    label: 'Premium Partner',
    description: 'Tier-1 premium operator with exceptional logistics.',
    iconName: 'CheckCircle2',
    criteriaDescription: 'Zero cancellation rate and 100% compliance record.',
    colorScheme: 'blue',
    isEnabled: true
  }
];

// Helper to access UTRE collections from dbStore
function getUtreCollection<T>(key: string): T[] {
  const data = (dbStore as any).data;
  if (!data[key]) {
    data[key] = [];
  }
  return data[key];
}

function saveUtreCollection(key: string, list: any[]) {
  const data = (dbStore as any).data;
  data[key] = list;
  dbStore.save();
}

// Ensure seeded configurations exist on startup
export function ensureSeededUTRE() {
  const configs = getUtreCollection<UTREEntityConfig>('utreConfigs');
  if (configs.length === 0) {
    saveUtreCollection('utreConfigs', DEFAULT_ENTITY_CONFIGS);
  }

  const badges = getUtreCollection<UTRETrustBadge>('utreBadges');
  if (badges.length === 0) {
    saveUtreCollection('utreBadges', DEFAULT_BADGES);
  }
}

// Trigger initial seed
ensureSeededUTRE();

// ============================================================================
// 1. ELIGIBILITY SERVICE
// ============================================================================
export class EligibilityService {
  /**
   * Evaluates if a reviewer can write a review for a specific entity & booking.
   */
  public static checkEligibility(params: {
    entityType: string;
    entityId: string;
    userId: string;
    bookingId?: string;
  }): { eligible: boolean; reason?: string } {
    const configs = getUtreCollection<UTREEntityConfig>('utreConfigs');
    const entityConfig = configs.find(c => c.entityType === params.entityType) || {
      entityType: params.entityType,
      dimensions: [{ key: 'service', label: 'Service Quality', description: 'Overall service rating', weight: 1 }],
      eligibilityRules: {
        requiresVerifiedBooking: false,
        requiresCompletedBooking: false,
        requiresManualAdminApproval: false,
        maxReviewsPerBooking: 1
      }
    };

    const rules = entityConfig.eligibilityRules;

    // 1. If Booking is required
    if (rules.requiresVerifiedBooking || rules.requiresCompletedBooking) {
      if (!params.bookingId) {
        return { eligible: false, reason: 'A booking ID is required to review this service.' };
      }

      // Find booking lead in dbStore
      const leads = dbStore.getBookingLeads();
      const lead = leads.find(l => l.id === params.bookingId);

      if (!lead) {
        return { eligible: false, reason: 'Booking lead not found in database.' };
      }

      // Check if user is the customer on the booking
      const travelerId = lead.customerEmail?.toLowerCase() || lead.customerMobile || '';
      const queryUser = params.userId.toLowerCase();
      if (travelerId && travelerId !== queryUser && lead.customerMobile !== params.userId) {
        return { eligible: false, reason: 'Your traveler ID does not match this booking.' };
      }

      // Check completed rule
      if (rules.requiresCompletedBooking) {
        if (lead.status !== 'completed' && lead.status !== 'trip_info_shared') {
          return { eligible: false, reason: 'You can only review this service after the trip is completed.' };
        }
      }

      // Check minimum stay rule (if homestay)
      if (rules.minimumStayDays && lead.numberOfRooms) {
        // Mock check or stay duration check
        const checkIn = new Date(lead.checkInDate || '');
        const checkOut = new Date(lead.checkOutDate || '');
        const diffDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        if (!isNaN(diffDays) && diffDays < rules.minimumStayDays) {
          return { eligible: false, reason: `Minimum stay duration of ${rules.minimumStayDays} night(s) required.` };
        }
      }
    }

    // 2. Max reviews frequency check per booking
    if (params.bookingId && rules.maxReviewsPerBooking) {
      const reviews = getUtreCollection<UTREReview>('utreReviews');
      const count = reviews.filter(r => r.bookingId === params.bookingId && r.reviewer.id === params.userId).length;
      if (count >= rules.maxReviewsPerBooking) {
        return { eligible: false, reason: `You have reached the maximum of ${rules.maxReviewsPerBooking} review(s) for this booking.` };
      }
    }

    return { eligible: true };
  }
}

// ============================================================================
// 2. REVIEW SERVICE
// ============================================================================
export class ReviewService {
  /**
   * Submit a new review to the engine.
   */
  public static async createReview(reviewData: Partial<UTREReview>): Promise<UTREReview> {
    const { entityType, entityId, bookingId, reviewer, rating, categoryRatings, title, body, media, visitDate, language } = reviewData;

    if (!entityType || !entityId || !reviewer || rating === undefined || !body) {
      throw new Error('Missing critical fields for review submission.');
    }

    // Check Eligibility
    const eligibility = EligibilityService.checkEligibility({
      entityType,
      entityId,
      userId: reviewer.id,
      bookingId
    });

    if (!eligibility.eligible) {
      throw new Error(eligibility.reason || 'Not eligible to write review.');
    }

    const configs = getUtreCollection<UTREEntityConfig>('utreConfigs');
    const entityConfig = configs.find(c => c.entityType === entityType);
    const rules = entityConfig?.eligibilityRules;

    const initialStatus = (rules?.requiresManualAdminApproval) ? 'pending' : 'approved';

    const cleanMedia: UTREMedia[] = (media || []).map((m, idx) => ({
      id: m.id || `m-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      url: m.url,
      type: m.type || 'image',
      caption: m.caption || '',
      compressedUrl: m.url, // Placeholder for compression
      lazyLoad: true,
      uploadedAt: new Date().toISOString()
    }));

    const newReview: UTREReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      entityType,
      entityId,
      bookingId,
      reviewer: {
        id: reviewer.id,
        name: reviewer.name || 'Anonymous Traveler',
        email: reviewer.email || '',
        avatarUrl: reviewer.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(reviewer.name || 'A')}`
      },
      rating: Number(rating),
      categoryRatings: categoryRatings || {},
      title: title || '',
      body,
      media: cleanMedia,
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      language: language || 'en',
      status: initialStatus,
      helpfulVotes: [],
      unhelpfulVotes: [],
      reportedBy: [],
      responses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to DB
    const reviews = getUtreCollection<UTREReview>('utreReviews');
    reviews.push(newReview);
    saveUtreCollection('utreReviews', reviews);

    // Sync to old legacy table for backward-compatibility with other modules
    try {
      const oldReviewRecord = {
        id: newReview.id,
        bookingId: bookingId || '',
        travellerId: reviewer.email || reviewer.id,
        travellerName: reviewer.name,
        operatorId: entityId,
        operatorName: entityId,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.body,
        wouldRecommend: true,
        tripExperience: newReview.rating,
        vehicleCleanliness: newReview.rating,
        driverBehaviour: newReview.rating,
        punctuality: newReview.rating,
        valueForMoney: newReview.rating,
        photos: cleanMedia.map(m => m.url),
        status: initialStatus === 'approved' ? 'active' : 'hidden',
        reported: false,
        createdAt: newReview.createdAt,
        updatedAt: newReview.updatedAt
      };
      await dbStore.saveRecord('bookingReviews', oldReviewRecord);
    } catch (err) {
      console.warn('[UTRE Sync] Failed syncing legacy review record:', err);
    }

    // Publish event
    try {
      const event = EventBus.createEvent(
        'review.created',
        'review',
        newReview.id,
        'review',
        reviewer.id,
        {
          reviewId: newReview.id,
          entityType: newReview.entityType,
          entityId: newReview.entityId,
          rating: newReview.rating,
          reviewerId: reviewer.id,
          reviewerName: reviewer.name,
          status: newReview.status,
          bookingId
        },
        `idemp-review-create-${newReview.id}`
      );
      await EventBus.getInstance().publish(event);
    } catch (evErr) {
      console.error('[UTRE Event] Failed publishing review.created:', evErr);
    }

    // Recalculate Reputation Score
    await ReputationService.recalculateScore(entityType, entityId);

    return newReview;
  }

  /**
   * Edit an existing review (7-day rule enforced).
   */
  public static async updateReview(reviewId: string, userId: string, updateData: Partial<UTREReview>): Promise<UTREReview> {
    const reviews = getUtreCollection<UTREReview>('utreReviews');
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) {
      throw new Error('Review not found.');
    }

    const review = reviews[idx];

    // Enforce 7-day rule
    const submittedAt = new Date(review.createdAt).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - submittedAt > sevenDaysMs) {
      throw new Error('This review is locked. Edits are only permitted within 7 days of submission.');
    }

    // Auth validation
    if (review.reviewer.id !== userId) {
      throw new Error('You are not authorized to edit this review.');
    }

    const updated: UTREReview = {
      ...review,
      rating: updateData.rating !== undefined ? Number(updateData.rating) : review.rating,
      categoryRatings: updateData.categoryRatings || review.categoryRatings,
      title: updateData.title !== undefined ? updateData.title : review.title,
      body: updateData.body !== undefined ? updateData.body : review.body,
      media: updateData.media ? [...updateData.media] : review.media,
      language: updateData.language || review.language,
      updatedAt: new Date().toISOString()
    };

    reviews[idx] = updated;
    saveUtreCollection('utreReviews', reviews);

    // Publish event
    try {
      const event = EventBus.createEvent(
        'review.updated',
        'review',
        reviewId,
        'review',
        userId,
        {
          reviewId,
          entityId: review.entityId,
          entityType: review.entityType,
          rating: updated.rating
        },
        `idemp-review-update-${reviewId}-${Date.now()}`
      );
      await EventBus.getInstance().publish(event);
    } catch (evErr) {
      console.error('[UTRE Event] Failed publishing review.updated:', evErr);
    }

    // Recalculate Reputation Score
    await ReputationService.recalculateScore(review.entityType, review.entityId);

    return updated;
  }

  /**
   * Delete a review.
   */
  public static async deleteReview(reviewId: string, actorId: string): Promise<boolean> {
    const reviews = getUtreCollection<UTREReview>('utreReviews');
    const review = reviews.find(r => r.id === reviewId);
    if (!review) {
      throw new Error('Review not found.');
    }

    const updatedList = reviews.filter(r => r.id !== reviewId);
    saveUtreCollection('utreReviews', updatedList);

    // Sync legacy delete
    try {
      await dbStore.deleteRecord('bookingReviews', reviewId);
    } catch (err) {}

    // Publish event
    try {
      const event = EventBus.createEvent(
        'review.deleted',
        'review',
        reviewId,
        'review',
        actorId,
        {
          reviewId,
          entityId: review.entityId,
          entityType: review.entityType
        },
        `idemp-review-delete-${reviewId}`
      );
      await EventBus.getInstance().publish(event);
    } catch (evErr) {}

    await ReputationService.recalculateScore(review.entityType, review.entityId);

    return true;
  }

  /**
   * Cast a vote on a review.
   */
  public static async voteHelpful(reviewId: string, userId: string, vote: 'helpful' | 'unhelpful'): Promise<UTREReview> {
    const reviews = getUtreCollection<UTREReview>('utreReviews');
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) {
      throw new Error('Review not found.');
    }

    const review = reviews[idx];
    let helpful = [...review.helpfulVotes];
    let unhelpful = [...review.unhelpfulVotes];

    if (vote === 'helpful') {
      if (helpful.includes(userId)) {
        helpful = helpful.filter(id => id !== userId); // toggle off
      } else {
        helpful.push(userId);
        unhelpful = unhelpful.filter(id => id !== userId); // clear opposing
      }
    } else {
      if (unhelpful.includes(userId)) {
        unhelpful = unhelpful.filter(id => id !== userId); // toggle off
      } else {
        unhelpful.push(userId);
        helpful = helpful.filter(id => id !== userId); // clear opposing
      }
    }

    const updated = {
      ...review,
      helpfulVotes: helpful,
      unhelpfulVotes: unhelpful,
      updatedAt: new Date().toISOString()
    };

    reviews[idx] = updated;
    saveUtreCollection('utreReviews', reviews);

    return updated;
  }

  /**
   * Submit an owner reply or employee reply.
   */
  public static async submitOwnerResponse(reviewId: string, response: Partial<UTREOwnerResponse>): Promise<UTREReview> {
    const reviews = getUtreCollection<UTREReview>('utreReviews');
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) {
      throw new Error('Review not found.');
    }

    const review = reviews[idx];
    const responses = [...review.responses];

    const replyId = response.replyId || `rep-${Date.now()}`;
    const cleanResponse: UTREOwnerResponse = {
      replyId,
      responderId: response.responderId || 'system',
      responderName: response.responderName || 'Business Owner',
      responderRole: response.responderRole || 'owner',
      replyText: response.replyText || '',
      isPinned: !!response.isPinned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If pinning this reply, unpin others
    if (cleanResponse.isPinned) {
      responses.forEach(r => r.isPinned = false);
    }

    const existingIdx = responses.findIndex(r => r.replyId === replyId);
    if (existingIdx >= 0) {
      responses[existingIdx] = {
        ...responses[existingIdx],
        replyText: cleanResponse.replyText,
        isPinned: cleanResponse.isPinned,
        updatedAt: new Date().toISOString()
      };
    } else {
      responses.push(cleanResponse);
    }

    const updated = {
      ...review,
      responses,
      updatedAt: new Date().toISOString()
    };

    reviews[idx] = updated;
    saveUtreCollection('utreReviews', reviews);

    // Sync legacy reply
    try {
      const legacyReviews = dbStore.getBookingReviews();
      const legacyIdx = legacyReviews.findIndex(r => r.id === reviewId);
      if (legacyIdx >= 0) {
        legacyReviews[legacyIdx].operatorReply = cleanResponse.replyText;
        legacyReviews[legacyIdx].operatorReplyCreatedAt = cleanResponse.createdAt;
        legacyReviews[legacyIdx].operatorReplyUpdatedAt = cleanResponse.updatedAt;
        dbStore.saveRecord('bookingReviews', legacyReviews[legacyIdx]);
      }
    } catch (err) {}

    // Publish event
    try {
      const event = EventBus.createEvent(
        'review.replied',
        'review',
        reviewId,
        'review',
        response.responderId || 'system',
        {
          reviewId,
          replyId,
          entityId: review.entityId,
          responderId: response.responderId,
          replyText: cleanResponse.replyText
        },
        `idemp-review-reply-${reviewId}-${replyId}`
      );
      await EventBus.getInstance().publish(event);
    } catch (evErr) {}

    return updated;
  }

  /**
   * Delete an owner reply.
   */
  public static async deleteOwnerResponse(reviewId: string, replyId: string, actorId: string): Promise<UTREReview> {
    const reviews = getUtreCollection<UTREReview>('utreReviews');
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) {
      throw new Error('Review not found.');
    }

    const review = reviews[idx];
    const responses = review.responses.filter(r => r.replyId !== replyId);

    const updated = {
      ...review,
      responses,
      updatedAt: new Date().toISOString()
    };

    reviews[idx] = updated;
    saveUtreCollection('utreReviews', reviews);

    return updated;
  }
}

// ============================================================================
// 3. TRUST SCORE & REPUTATION SERVICE
// ============================================================================
export class TrustScoreService {
  /**
   * Computes the dynamic 0-100 Trust Score based on multiple weighted inputs.
   */
  public static calculateScore(inputs: {
    averageRating: number;         // 0 to 5
    reviewVolume: number;          // Count of reviews
    recentActivityCount: number;   // Last 30 days count
    bookingCompletionRate: number; // 0 to 1
    cancellationRate: number;      // 0 to 1
    averageResponseTimeMs: number; // Avg reply time in ms
    profileCompleteness: number;   // 0 to 1
    verificationStatus: 'verified' | 'unverified' | 'pending';
    documentValidityRate: number;  // 0 to 1
    complaintRatio: number;        // Flagged or reported reviews / total
  }): number {
    let score = 50; // Neutral baseline

    // 1. Average Rating factor (Max 30 points)
    // Map 0-5 stars to 0-30 points
    score += (inputs.averageRating / 5) * 30;

    // 2. Volume & Recency factor (Max 15 points)
    const volumePoints = Math.min(inputs.reviewVolume * 1.5, 10); // capping at 10 points
    const recencyPoints = Math.min(inputs.recentActivityCount * 1, 5); // capping at 5 points
    score += (volumePoints + recencyPoints);

    // 3. Operational Performance: Completion Rate & Cancellations (Max 25 points)
    // completion rate (up to 15 points)
    score += inputs.bookingCompletionRate * 15;
    // cancellation penalty (subtract up to 15 points, base is 10)
    score -= inputs.cancellationRate * 15;

    // 4. Response Time (Max 10 points)
    // Under 30 mins = 10 pts, under 2 hours = 7 pts, under 12 hours = 4 pts, else 0 pts
    const minutes = inputs.averageResponseTimeMs / (1000 * 60);
    if (minutes <= 30) score += 10;
    else if (minutes <= 120) score += 7;
    else if (minutes <= 720) score += 4;

    // 5. Profile & Verification status (Max 20 points)
    if (inputs.verificationStatus === 'verified') score += 10;
    score += inputs.profileCompleteness * 10;

    // 6. Complaint Ratio Penalty
    // Every 1% of complaint ratio reduces score by 2 points (Max penalty 30 points)
    score -= Math.min(inputs.complaintRatio * 200, 30);

    // Ensure range bounds [0, 100]
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

export class ReputationService {
  /**
   * Recalculates and persists the trust score and badges for a specific entity.
   */
  public static async recalculateScore(entityType: string, entityId: string): Promise<UTREReputationScore> {
    const reviews = getUtreCollection<UTREReview>('utreReviews').filter(r => r.entityType === entityType && r.entityId === entityId && r.status === 'approved');
    
    // Calculate Average Rating
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews) : 4.0; // default 4.0

    // Count recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentReviews = reviews.filter(r => new Date(r.createdAt).getTime() > thirtyDaysAgo);

    // Find and compute operational stats from bookings
    const bookings = dbStore.getBookingLeads().filter(l => l.assignedPartnerId === entityId);
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) : 0.85; // default 85%
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) : 0.05; // default 5%

    // Calculate response times
    let responseTimes: number[] = [];
    reviews.forEach(r => {
      r.responses.forEach(resp => {
        const timeDiff = new Date(resp.createdAt).getTime() - new Date(r.createdAt).getTime();
        if (timeDiff > 0) {
          responseTimes.push(timeDiff);
        }
      });
    });
    const avgResponseTime = responseTimes.length > 0 ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 45 * 60 * 1000; // default 45 mins

    // Complaints ratio
    const totalComplaints = reviews.filter(r => r.reportedBy && r.reportedBy.length > 0).length;
    const complaintRatio = totalReviews > 0 ? (totalComplaints / totalReviews) : 0;

    // Build overall factor inputs
    const factors = {
      averageRating: Number(avgRating.toFixed(2)),
      reviewVolume: totalReviews,
      recentActivityCount: recentReviews.length,
      bookingCompletionRate: Number(completionRate.toFixed(2)),
      cancellationRate: Number(cancellationRate.toFixed(2)),
      averageResponseTimeMs: Math.round(avgResponseTime),
      profileCompleteness: 0.9, // Default seeded completeness
      verificationStatus: 'verified' as const,
      documentValidityRate: 1.0,
      complaintRatio: Number(complaintRatio.toFixed(2)),
      lifecycleStatus: 'Active'
    };

    const overallScore = TrustScoreService.calculateScore(factors);

    const scoreRecord: UTREReputationScore = {
      entityType,
      entityId,
      overallScore,
      factors,
      updatedAt: new Date().toISOString()
    };

    // Save Score
    const scores = getUtreCollection<UTREReputationScore>('utreScores');
    const idx = scores.findIndex(s => s.entityType === entityType && s.entityId === entityId);
    if (idx >= 0) {
      scores[idx] = scoreRecord;
    } else {
      scores.push(scoreRecord);
    }
    saveUtreCollection('utreScores', scores);

    // Evaluate badges for entity
    await BadgeService.evaluateBadges(entityType, entityId, scoreRecord);

    // Publish event
    try {
      const event = EventBus.createEvent(
        'trust.score.updated',
        'review',
        entityId,
        'business',
        'system',
        {
          entityType,
          entityId,
          overallScore,
          averageRating: factors.averageRating,
          reviewVolume: factors.reviewVolume
        },
        `idemp-score-update-${entityType}-${entityId}-${Date.now()}`
      );
      await EventBus.getInstance().publish(event);
    } catch (evErr) {}

    return scoreRecord;
  }

  /**
   * Get ratings distribution and count details.
   */
  public static getRatingDistribution(entityType: string, entityId: string) {
    const reviews = getUtreCollection<UTREReview>('utreReviews').filter(r => r.entityType === entityType && r.entityId === entityId && r.status === 'approved');
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const floorRating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
      if (distribution[floorRating] !== undefined) {
        distribution[floorRating]++;
      }
    });
    return distribution;
  }
}

// ============================================================================
// 4. BADGE SERVICE
// ============================================================================
export class BadgeService {
  /**
   * Evaluates and awards badges dynamically based on reputation scores.
   */
  public static async evaluateBadges(entityType: string, entityId: string, score: UTREReputationScore): Promise<string[]> {
    const activeBadges: string[] = [];
    const f = score.factors;

    // 1. Evaluate "top_rated"
    if (f.averageRating >= 4.7 && f.reviewVolume >= 3) {
      activeBadges.push('top_rated');
    }

    // 2. Evaluate "traveler_favorite"
    if (f.reviewVolume >= 8 && f.averageRating >= 4.5) {
      activeBadges.push('traveler_favorite');
    }

    // 3. Evaluate "fast_response"
    const responseTimeMin = f.averageResponseTimeMs / (1000 * 60);
    if (responseTimeMin <= 45) {
      activeBadges.push('fast_response');
    }

    // 4. Evaluate "highly_recommended"
    if (f.averageRating >= 4.6 && f.complaintRatio === 0) {
      activeBadges.push('highly_recommended');
    }

    // 5. Evaluate "verified"
    if (f.verificationStatus === 'verified') {
      activeBadges.push('verified');
    }

    // Save awarded badges
    const awards = getUtreCollection<{ entityId: string; entityType: string; badges: string[] }>('utreBadgeAwards');
    const idx = awards.findIndex(a => a.entityId === entityId && a.entityType === entityType);
    
    const previousBadges = idx >= 0 ? awards[idx].badges : [];
    
    const awardRecord = { entityId, entityType, badges: activeBadges };
    if (idx >= 0) {
      awards[idx] = awardRecord;
    } else {
      awards.push(awardRecord);
    }
    saveUtreCollection('utreBadgeAwards', awards);

    // Publish badge events for newly awarded badges
    const newlyAwarded = activeBadges.filter(b => !previousBadges.includes(b));
    for (const badgeKey of newlyAwarded) {
      try {
        const event = EventBus.createEvent(
          'badge.awarded',
          'review',
          entityId,
          'business',
          'system',
          {
            entityId,
            entityType,
            badgeKey
          },
          `idemp-badge-${entityType}-${entityId}-${badgeKey}`
        );
        await EventBus.getInstance().publish(event);
      } catch (evErr) {}
    }

    return activeBadges;
  }

  /**
   * Retrieves active badges for an entity.
   */
  public static getEntityBadges(entityType: string, entityId: string): UTRETrustBadge[] {
    const awards = getUtreCollection<{ entityId: string; entityType: string; badges: string[] }>('utreBadgeAwards');
    const matched = awards.find(a => a.entityId === entityId && a.entityType === entityType);
    if (!matched) return [];

    const configs = getUtreCollection<UTRETrustBadge>('utreBadges');
    return configs.filter(c => matched.badges.includes(c.key) && c.isEnabled);
  }
}

// ============================================================================
// 5. MODERATION SERVICE
// ============================================================================
export class ModerationService {
  /**
   * Flags a review with a reason, triggering audit log trails.
   */
  public static async reportReview(reviewId: string, userId: string, reason: string, comment?: string): Promise<UTREReview> {
    const reviews = getUtreCollection<UTREReview>('utreReviews');
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) {
      throw new Error('Review not found.');
    }

    const review = reviews[idx];
    const reportedBy = [...review.reportedBy];
    
    // Avoid double reports by the same user
    if (!reportedBy.some(r => r.userId === userId)) {
      reportedBy.push({
        userId,
        reason,
        comment,
        createdAt: new Date().toISOString()
      });
    }

    const updated = {
      ...review,
      reportedBy,
      status: 'flagged' as const, // auto-flag for mod review
      updatedAt: new Date().toISOString()
    };

    reviews[idx] = updated;
    saveUtreCollection('utreReviews', reviews);

    // Sync legacy report
    try {
      const legacyReviews = dbStore.getBookingReviews();
      const legacyIdx = legacyReviews.findIndex(r => r.id === reviewId);
      if (legacyIdx >= 0) {
        legacyReviews[legacyIdx].reported = true;
        legacyReviews[legacyIdx].reportReason = reason as any;
        legacyReviews[legacyIdx].reportComment = comment || '';
        dbStore.saveRecord('bookingReviews', legacyReviews[legacyIdx]);
      }
    } catch (err) {}

    // Audit trail
    const audit: UTREModerationAudit = {
      id: `mod-${Date.now()}`,
      reviewId,
      moderatorId: userId,
      action: 'flag',
      reason,
      notes: comment,
      createdAt: new Date().toISOString()
    };
    const audits = getUtreCollection<UTREModerationAudit>('utreModerationAudits');
    audits.push(audit);
    saveUtreCollection('utreModerationAudits', audits);

    // Publish event
    try {
      const event = EventBus.createEvent(
        'review.reported',
        'review',
        reviewId,
        'review',
        userId,
        {
          reviewId,
          entityId: review.entityId,
          reason,
          comment
        },
        `idemp-review-report-${reviewId}-${userId}`
      );
      await EventBus.getInstance().publish(event);
    } catch (evErr) {}

    return updated;
  }

  /**
   * Admin resolution action.
   */
  public static async resolveModeration(params: {
    reviewId: string;
    moderatorId: string;
    action: 'approve' | 'hide' | 'restore' | 'delete';
    reason: string;
    notes?: string;
  }): Promise<boolean> {
    const reviews = getUtreCollection<UTREReview>('utreReviews');
    const idx = reviews.findIndex(r => r.id === params.reviewId);
    if (idx === -1) {
      throw new Error('Review not found.');
    }

    const review = reviews[idx];

    if (params.action === 'delete') {
      await ReviewService.deleteReview(params.reviewId, params.moderatorId);
    } else {
      let nextStatus: UTREReview['status'] = 'approved';
      if (params.action === 'hide') nextStatus = 'hidden';
      if (params.action === 'restore' || params.action === 'approve') nextStatus = 'approved';

      const updated = {
        ...review,
        status: nextStatus,
        reportedBy: params.action === 'restore' ? [] : review.reportedBy,
        updatedAt: new Date().toISOString()
      };

      reviews[idx] = updated;
      saveUtreCollection('utreReviews', reviews);

      // Sync legacy moderate
      try {
        const legacyReviews = dbStore.getBookingReviews();
        const legacyIdx = legacyReviews.findIndex(r => r.id === params.reviewId);
        if (legacyIdx >= 0) {
          legacyReviews[legacyIdx].status = params.action === 'hide' ? 'hidden' : 'active';
          legacyReviews[legacyIdx].reported = params.action === 'restore' ? false : legacyReviews[legacyIdx].reported;
          dbStore.saveRecord('bookingReviews', legacyReviews[legacyIdx]);
        }
      } catch (err) {}
    }

    // Add Audit Log
    const audit: UTREModerationAudit = {
      id: `mod-${Date.now()}`,
      reviewId: params.reviewId,
      moderatorId: params.moderatorId,
      action: params.action,
      reason: params.reason,
      notes: params.notes,
      createdAt: new Date().toISOString()
    };
    const audits = getUtreCollection<UTREModerationAudit>('utreModerationAudits');
    audits.push(audit);
    saveUtreCollection('utreModerationAudits', audits);

    // Recalculate Reputation Score
    await ReputationService.recalculateScore(review.entityType, review.entityId);

    return true;
  }
}
