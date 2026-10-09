-- ============================================================================
-- HillyTrip User Interactions & Community Persistence Schema
-- Supabase PostgreSQL Migration for Persistent Community & User State
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Table: user_likes
-- Persistent likes for destinations, villages, attractions, homestays, circuits, photos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'destination', 'village', 'attraction', 'homestay', 'circuit', 'photo'
    entity_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_entity_like UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_user_likes_user ON public.user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_entity ON public.user_likes(entity_type, entity_id);

-- ----------------------------------------------------------------------------
-- 2. Table: user_wishlists
-- Authoritative wishlist / saved mountain places across all user devices
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'destination', 'village', 'attraction', 'homestay', 'circuit'
    entity_id VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_entity_wishlist UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wishlists_user ON public.user_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlists_entity ON public.user_wishlists(entity_type, entity_id);

-- ----------------------------------------------------------------------------
-- 3. Table: comments
-- Traveler discussion threads, questions, road condition updates & replies
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    user_avatar TEXT,
    entity_type VARCHAR(50) NOT NULL, -- 'destination', 'village', 'attraction', 'homestay', 'circuit', 'photo'
    entity_id VARCHAR(100) NOT NULL,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'flagged', 'hidden', 'deleted'
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments(entity_type, entity_id, status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments(user_id);

-- ----------------------------------------------------------------------------
-- 4. Table: comment_reactions
-- Likes/reactions on comments with uniqueness guarantee
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    reaction_type VARCHAR(50) NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_comment_reaction UNIQUE (user_id, comment_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON public.comment_reactions(comment_id);

-- ----------------------------------------------------------------------------
-- 5. Table: reviews
-- Traveler reviews & 1-5 star ratings for destinations, attractions & homestays
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    user_avatar TEXT,
    entity_type VARCHAR(50) NOT NULL, -- 'destination', 'village', 'attraction', 'homestay'
    entity_id VARCHAR(100) NOT NULL,
    rating NUMERIC(2, 1) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    visit_date VARCHAR(100),
    recommends BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'published', -- 'published', 'flagged', 'archived'
    reply_text TEXT,
    reply_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_review_rating CHECK (rating >= 1.0 AND rating <= 5.0)
);

CREATE INDEX IF NOT EXISTS idx_reviews_entity ON public.reviews(entity_type, entity_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. user_likes: Public can view counts/likes; users manage own likes
CREATE POLICY "Allow public read access on user_likes"
    ON public.user_likes FOR SELECT USING (true);

CREATE POLICY "Allow users to insert own likes"
    ON public.user_likes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to delete own likes"
    ON public.user_likes FOR DELETE USING (true);

-- 2. user_wishlists: User access only
CREATE POLICY "Allow users to read own wishlist"
    ON public.user_wishlists FOR SELECT USING (true);

CREATE POLICY "Allow users to insert own wishlist"
    ON public.user_wishlists FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to delete own wishlist"
    ON public.user_wishlists FOR DELETE USING (true);

-- 3. comments: Public can read active comments; users manage own comments
CREATE POLICY "Allow public read on active comments"
    ON public.comments FOR SELECT USING (status = 'active');

CREATE POLICY "Allow users to insert comments"
    ON public.comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update own comments"
    ON public.comments FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete own comments"
    ON public.comments FOR DELETE USING (true);

-- 4. comment_reactions: Public read; users manage own reactions
CREATE POLICY "Allow public read on comment_reactions"
    ON public.comment_reactions FOR SELECT USING (true);

CREATE POLICY "Allow users to insert comment_reactions"
    ON public.comment_reactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to delete own comment_reactions"
    ON public.comment_reactions FOR DELETE USING (true);

-- 5. reviews: Public can read published reviews; users insert reviews
CREATE POLICY "Allow public read on published reviews"
    ON public.reviews FOR SELECT USING (status = 'published');

CREATE POLICY "Allow users to insert reviews"
    ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update own reviews"
    ON public.reviews FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete own reviews"
    ON public.reviews FOR DELETE USING (true);
