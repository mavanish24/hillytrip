// src/services/communityPersistenceService.ts
// Standardized client-side service for persistent user community interactions
// Source of truth: Server API / Supabase PostgreSQL database
// LocalStorage: Temporary cache & optimistic UI layer only

export interface UserLikeItem {
  id?: string;
  user_id?: string;
  userId?: string;
  entity_type?: string;
  contentType?: string;
  entity_id?: string;
  contentId?: string;
  created_at?: string;
}

export interface UserWishlistItem {
  id?: string;
  user_id?: string;
  userId?: string;
  entity_type?: string;
  type?: string;
  entity_id?: string;
  notes?: string;
  created_at?: string;
}

export interface CommentItem {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  contentId: string;
  contentType: 'destination' | 'attraction' | 'photo' | string;
  text: string;
  content?: string;
  parentCommentId?: string | null;
  status?: string;
  likesCount?: number;
  likes_count?: number;
  timestamp: string;
  created_at?: string;
}

export interface ReviewItem {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  destinationId: string;
  entity_id?: string;
  contentType?: string;
  rating: number;
  title: string;
  content: string;
  visitDate: string;
  recommends: boolean;
  timestamp: string;
  created_at?: string;
}

const WISHLIST_STORAGE_KEYS = [
  'hillytrip_wishlist',
  'hillytrip_homestay_wishlist',
  'hillytrip_saved_places',
  'hillytrip_saved'
];

const LIKES_STORAGE_KEY = 'hillytrip_likes';

// Helper to broadcast cache updates to components like Navbar, WishlistView, etc.
function notifyLocalCacheUpdate() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('hillytrip_state_change', { detail: { timestamp: Date.now() } }));
  } catch {}
}

export const communityService = {
  // ==========================================================================
  // LIKES
  // ==========================================================================
  async fetchUserLikes(userId: string): Promise<string[]> {
    if (!userId) return [];
    try {
      const res = await fetch(`/api/user/likes?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        const serverLikes: UserLikeItem[] = Array.isArray(data.likes) ? data.likes : [];
        const idList = serverLikes.map(l => String(l.entity_id || l.contentId || '')).filter(Boolean);
        
        // Cache to localStorage optimistically
        try {
          localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(idList));
          notifyLocalCacheUpdate();
        } catch {}
        
        return idList;
      }
    } catch (e) {
      console.warn('[CommunityService] Failed to fetch likes from server, using local cache:', e);
    }

    // Fallback to local cache
    try {
      const raw = localStorage.getItem(LIKES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async toggleLike(userId: string, entityType: string, entityId: string): Promise<{ liked: boolean; count: number }> {
    // 1. Optimistic local cache update
    let currentLikes: string[] = [];
    try {
      const raw = localStorage.getItem(LIKES_STORAGE_KEY);
      currentLikes = raw ? JSON.parse(raw) : [];
    } catch {}

    const wasLiked = currentLikes.includes(entityId);
    const nextLikes = wasLiked
      ? currentLikes.filter(id => id !== entityId)
      : [...currentLikes, entityId];

    try {
      localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(nextLikes));
      notifyLocalCacheUpdate();
    } catch {}

    // 2. Server persistence
    try {
      const res = await fetch('/api/user/likes/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, entityType, entityId })
      });
      if (res.ok) {
        const result = await res.json();
        return result;
      }
    } catch (e) {
      console.error('[CommunityService] Server like toggle error:', e);
    }

    return { liked: !wasLiked, count: nextLikes.length };
  },

  // ==========================================================================
  // WISHLIST / SAVED ITEMS
  // ==========================================================================
  async fetchUserWishlist(userId: string): Promise<string[]> {
    if (!userId) return [];
    try {
      const res = await fetch(`/api/user/wishlist?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        const serverWish: UserWishlistItem[] = Array.isArray(data.wishlist) ? data.wishlist : [];
        const idList = serverWish.map(w => String(w.entity_id || '')).filter(Boolean);

        // Keep local cache in sync
        try {
          WISHLIST_STORAGE_KEYS.forEach(k => {
            localStorage.setItem(k, JSON.stringify(idList));
          });
          notifyLocalCacheUpdate();
        } catch {}

        return idList;
      }
    } catch (e) {
      console.warn('[CommunityService] Failed to fetch wishlist from server, using local cache:', e);
    }

    try {
      const raw = localStorage.getItem('hillytrip_saved_places') || localStorage.getItem('hillytrip_wishlist') || localStorage.getItem('hillytrip_saved');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async toggleWishlist(userId: string, entityType: string, entityId: string, notes?: string): Promise<boolean> {
    // 1. Optimistic cache update
    let currentSaved: string[] = [];
    try {
      const raw = localStorage.getItem('hillytrip_saved_places') || localStorage.getItem('hillytrip_wishlist') || localStorage.getItem('hillytrip_saved');
      currentSaved = raw ? JSON.parse(raw) : [];
    } catch {}

    const wasSaved = currentSaved.includes(entityId);
    const nextSaved = wasSaved
      ? currentSaved.filter(id => id !== entityId)
      : [...currentSaved, entityId];

    try {
      WISHLIST_STORAGE_KEYS.forEach(k => {
        localStorage.setItem(k, JSON.stringify(nextSaved));
      });
      notifyLocalCacheUpdate();
    } catch {}

    // 2. Server persistence
    if (userId) {
      try {
        const res = await fetch('/api/user/wishlist/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, entityType, entityId, notes })
        });
        if (res.ok) {
          const result = await res.json();
          return Boolean(result.saved);
        }
      } catch (e) {
        console.error('[CommunityService] Server wishlist toggle error:', e);
      }
    }

    return !wasSaved;
  },

  async syncLocalWishlistToServer(userId: string): Promise<void> {
    if (!userId) return;
    try {
      const localIds = new Set<string>();
      WISHLIST_STORAGE_KEYS.forEach(key => {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((x: any) => {
                if (typeof x === 'string' && x.trim()) localIds.add(x.trim());
                else if (x && typeof x === 'object' && (x.id || x.entityId)) localIds.add(String(x.id || x.entityId));
              });
            }
          } catch {}
        }
      });

      if (localIds.size === 0) return;

      const items = Array.from(localIds).map(id => ({
        entityType: 'destination',
        entityId: id
      }));

      await fetch('/api/user/wishlist/batch-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items })
      });
    } catch (e) {
      console.warn('[CommunityService] Batch wishlist sync note:', e);
    }
  },

  // ==========================================================================
  // COMMENTS & DISCUSSIONS
  // ==========================================================================
  async fetchComments(entityType: string, entityId: string): Promise<CommentItem[]> {
    try {
      const res = await fetch(`/api/comments?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.comments) ? data.comments : [];
        return list.map((c: any) => ({
          id: c.id,
          userId: c.user_id || c.userId,
          userName: c.user_name || c.userName || 'Registered Traveler',
          userEmail: c.user_email || c.userEmail,
          userAvatar: c.user_avatar || c.userAvatar,
          contentId: c.entity_id || c.contentId,
          contentType: c.entity_type || c.contentType,
          text: c.content || c.text || '',
          content: c.content || c.text || '',
          parentCommentId: c.parent_comment_id || c.parentCommentId,
          likesCount: c.likes_count || c.likesCount || 0,
          timestamp: c.created_at || c.timestamp || new Date().toISOString()
        }));
      }
    } catch (e) {
      console.warn('[CommunityService] Failed to fetch comments from server:', e);
    }

    // Fallback to local storage if server unreachable
    try {
      const raw = localStorage.getItem('hillytrip_mock_comments');
      const list = raw ? JSON.parse(raw) : [];
      return list.filter((c: any) => 
        String(c.contentId) === String(entityId) && String(c.contentType) === String(entityType)
      );
    } catch {
      return [];
    }
  },

  async submitComment(params: {
    userId: string;
    userName: string;
    userEmail?: string;
    userAvatar?: string;
    entityType: string;
    entityId: string;
    text: string;
    parentCommentId?: string;
  }): Promise<CommentItem> {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit comment');
    }
    const data = await res.json();
    const c = data.comment;
    return {
      id: c.id,
      userId: c.user_id || c.userId,
      userName: c.user_name || c.userName,
      userEmail: c.user_email || c.userEmail,
      userAvatar: c.user_avatar || c.userAvatar,
      contentId: c.entity_id || c.contentId,
      contentType: c.entity_type || c.contentType,
      text: c.content || c.text,
      content: c.content || c.text,
      parentCommentId: c.parent_comment_id || c.parentCommentId,
      likesCount: c.likes_count || 0,
      timestamp: c.created_at || new Date().toISOString()
    };
  },

  async deleteComment(commentId: string, userId?: string): Promise<void> {
    const res = await fetch(`/api/comments/${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete comment');
    }
  },

  async toggleCommentReaction(userId: string, commentId: string, reactionType = 'like'): Promise<{ reacted: boolean; likesCount: number }> {
    const res = await fetch(`/api/comments/${encodeURIComponent(commentId)}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reactionType })
    });
    if (!res.ok) {
      throw new Error('Failed to register reaction');
    }
    return await res.json();
  },

  // ==========================================================================
  // REVIEWS & RATINGS
  // ==========================================================================
  async fetchReviews(entityType: string, entityId: string): Promise<ReviewItem[]> {
    try {
      const res = await fetch(`/api/reviews?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.reviews) ? data.reviews : [];
        return list.map((r: any) => ({
          id: r.id,
          userId: r.user_id || r.userId,
          userName: r.user_name || r.userName || 'Registered Traveler',
          userEmail: r.user_email || r.userEmail,
          userAvatar: r.user_avatar || r.userAvatar,
          destinationId: r.entity_id || r.destinationId,
          rating: Number(r.rating) || 5,
          title: r.title || '',
          content: r.content || '',
          visitDate: r.visit_date || r.visitDate || 'Recently',
          recommends: r.recommends !== false,
          timestamp: r.created_at || r.timestamp || new Date().toISOString()
        }));
      }
    } catch (e) {
      console.warn('[CommunityService] Failed to fetch reviews from server:', e);
    }

    try {
      const raw = localStorage.getItem('hillytrip_mock_reviews');
      const list = raw ? JSON.parse(raw) : [];
      return list.filter((r: any) => String(r.destinationId) === String(entityId));
    } catch {
      return [];
    }
  },

  async submitReview(params: {
    userId: string;
    userName: string;
    userEmail?: string;
    userAvatar?: string;
    entityType: string;
    entityId: string;
    rating: number;
    title: string;
    content: string;
    visitDate: string;
    recommends?: boolean;
  }): Promise<ReviewItem> {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit review');
    }
    const data = await res.json();
    const r = data.review;
    return {
      id: r.id,
      userId: r.user_id || r.userId,
      userName: r.user_name || r.userName,
      userEmail: r.user_email || r.userEmail,
      userAvatar: r.user_avatar || r.userAvatar,
      destinationId: r.entity_id || r.destinationId,
      rating: Number(r.rating) || 5,
      title: r.title,
      content: r.content,
      visitDate: r.visit_date || r.visitDate,
      recommends: r.recommends !== false,
      timestamp: r.created_at || new Date().toISOString()
    };
  },

  async deleteReview(reviewId: string, userId?: string): Promise<void> {
    const res = await fetch(`/api/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete review');
    }
  },

  async fetchReviewsSummary(entityType: string, entityId: string): Promise<{ averageRating: number; totalReviews: number; recommendPercentage: number }> {
    try {
      const res = await fetch(`/api/reviews/summary?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[CommunityService] Failed to fetch reviews summary:', e);
    }
    return { averageRating: 0, totalReviews: 0, recommendPercentage: 0 };
  }
};
