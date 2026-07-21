-- ============================================================================
-- HillyTrip Enterprise Database Architecture
-- Universal Business Engine Schema for Supabase PostgreSQL
-- ============================================================================
-- Designed for unlimited tourism business types (e.g. Homestay, Taxi Fleet,
-- Tour Operator, Camping, Local Guides, Restaurants, etc.) within a unified
-- schema pattern without separate tables for each business category.
-- ============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. Table: businesses
-- The core registry for all enterprise business accounts.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL, -- References auth.users (Supabase Auth)
    business_type VARCHAR(100) NOT NULL, -- e.g. 'homestay', 'taxi_operator', 'tour_operator', 'restaurant'
    workflow_status VARCHAR(50) NOT NULL DEFAULT 'draft', -- e.g. 'draft', 'submitted', 'pending_review', 'approved', 'suspended'
    lifecycle_state VARCHAR(50) NOT NULL DEFAULT 'draft', -- e.g. 'draft', 'pending_verification', 'approved', 'published', 'active', 'receiving_bookings', 'suspended', 'archived'
    profile_completion_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_profile_completion CHECK (profile_completion_percentage >= 0.00 AND profile_completion_percentage <= 100.00)
);

-- Indexing for rapid queries
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_type ON public.businesses(business_type);
CREATE INDEX IF NOT EXISTS idx_businesses_lifecycle ON public.businesses(lifecycle_state);

-- ----------------------------------------------------------------------------
-- 2. Table: business_profiles
-- Public facing information and contact points for each registered business.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    whatsapp_number VARCHAR(50),
    website_url VARCHAR(255),
    address_line_1 TEXT,
    address_line_2 TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_profile_business FOREIGN KEY (business_id) 
        REFERENCES public.businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_business_profiles_location ON public.business_profiles(state, district);
CREATE INDEX IF NOT EXISTS idx_business_profiles_geo ON public.business_profiles(latitude, longitude);

-- ----------------------------------------------------------------------------
-- 3. Table: business_sections
-- Dynamic onboarding / section completion tracker matching configuration structures.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    section_id VARCHAR(100) NOT NULL, -- e.g. 'basic_info', 'documents', 'photos', 'room_rates'
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completion_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_sections_business FOREIGN KEY (business_id) 
        REFERENCES public.businesses(id) ON DELETE CASCADE,
    CONSTRAINT uq_business_section UNIQUE (business_id, section_id),
    CONSTRAINT chk_section_completion CHECK (completion_percentage >= 0.00 AND completion_percentage <= 100.00)
);

CREATE INDEX IF NOT EXISTS idx_business_sections_lookup ON public.business_sections(business_id, section_id);

-- ----------------------------------------------------------------------------
-- 4. Table: business_fields
-- Highly scalable key-value entity pattern storing dynamic, business-specific parameters.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    section_id VARCHAR(100) NOT NULL,
    field_id VARCHAR(100) NOT NULL, -- e.g. 'num_rooms', 'license_number', 'cuisine_types'
    field_value JSONB, -- Stores scalars, lists, coordinates, or sub-structures as JSONB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_fields_business FOREIGN KEY (business_id) 
        REFERENCES public.businesses(id) ON DELETE CASCADE,
    CONSTRAINT uq_business_field UNIQUE (business_id, section_id, field_id)
);

CREATE INDEX IF NOT EXISTS idx_business_fields_search ON public.business_fields(business_id, field_id);
-- JSONB Indexing to search inside structured configurations
CREATE INDEX IF NOT EXISTS idx_business_fields_value_gin ON public.business_fields USING gin (field_value);

-- ----------------------------------------------------------------------------
-- 5. Table: business_documents
-- Secure vault for regulatory document audits, verification, and expiration tracking.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    document_type_id VARCHAR(100) NOT NULL, -- e.g. 'aadhaar_card', 'pan_card', 'fssai_license', 'rto_permit'
    document_name VARCHAR(255) NOT NULL,
    document_url VARCHAR(1024) NOT NULL, -- Cloud storage URL
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'expired'
    verified_by UUID, -- References admin reviewer
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_documents_business FOREIGN KEY (business_id) 
        REFERENCES public.businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_business_documents_lookup ON public.business_documents(business_id, document_type_id);
CREATE INDEX IF NOT EXISTS idx_business_documents_status ON public.business_documents(verification_status);

-- ----------------------------------------------------------------------------
-- 6. Table: business_media
-- Unified multimedia table for logos, cover photos, high-res galleries, and video loops.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    media_type VARCHAR(50) NOT NULL, -- 'logo', 'cover', 'gallery_photo', 'video'
    media_url VARCHAR(1024) NOT NULL,
    caption VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    width INTEGER,
    height INTEGER,
    is_hero BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_media_business FOREIGN KEY (business_id) 
        REFERENCES public.businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_business_media_order ON public.business_media(business_id, media_type, display_order);

-- ----------------------------------------------------------------------------
-- 7. Table: business_bookings
-- Reusable booking architecture handling room bookings, taxi hires, trekking slots, etc.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    service_type VARCHAR(100) NOT NULL, -- e.g. 'room_booking', 'taxi_hire', 'guided_tour'
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled', 'disputed'
    total_price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'partially_paid', 'fully_paid', 'refunded'
    payment_method VARCHAR(50),
    guest_count INTEGER DEFAULT 1,
    custom_metadata JSONB, -- Dynamic elements (e.g. room_number, pickup_location, cab_tier)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_bookings_business FOREIGN KEY (business_id) 
        REFERENCES public.businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_business_bookings_dates ON public.business_bookings(business_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_business_bookings_status ON public.business_bookings(status);
CREATE INDEX IF NOT EXISTS idx_business_bookings_meta_gin ON public.business_bookings USING gin (custom_metadata);

-- ----------------------------------------------------------------------------
-- 8. Table: business_workflows
-- Complete historical audit log of workflow approval transitions (State Machine).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    workflow_id VARCHAR(100) NOT NULL, -- e.g. 'homestay_verification', 'taxi_verification'
    from_stage VARCHAR(100) NOT NULL,
    to_stage VARCHAR(100) NOT NULL,
    action_taken VARCHAR(100) NOT NULL, -- e.g. 'submit', 'approve', 'request_clarification'
    performed_by UUID NOT NULL,
    comment TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_workflows_business FOREIGN KEY (business_id) 
        REFERENCES public.businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_business_workflows_history ON public.business_workflows(business_id, timestamp DESC);

-- ----------------------------------------------------------------------------
-- 9. Table: business_reviews
-- Central review system for feedback, customer ratings, and host responses.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    rating NUMERIC(3, 2) NOT NULL,
    review_text TEXT NOT NULL,
    reply_text TEXT,
    reply_at TIMESTAMP WITH TIME ZONE,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_reviews_business FOREIGN KEY (business_id) 
        REFERENCES public.businesses(id) ON DELETE CASCADE,
    CONSTRAINT chk_rating CHECK (rating >= 1.0 AND rating <= 5.0)
);

CREATE INDEX IF NOT EXISTS idx_business_reviews_score ON public.business_reviews(business_id, rating DESC);

-- ----------------------------------------------------------------------------
-- TRIGGERS & PROCEDURES (Dynamic Updates for 'updated_at')
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger: businesses
CREATE TRIGGER trg_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Attach trigger: business_profiles
CREATE TRIGGER trg_business_profiles_updated_at
    BEFORE UPDATE ON public.business_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Attach trigger: business_fields
CREATE TRIGGER trg_business_fields_updated_at
    BEFORE UPDATE ON public.business_fields
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Attach trigger: business_documents
CREATE TRIGGER trg_business_documents_updated_at
    BEFORE UPDATE ON public.business_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Attach trigger: business_bookings
CREATE TRIGGER trg_business_bookings_updated_at
    BEFORE UPDATE ON public.business_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling absolute workspace isolation for tenant operators.
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Businesses Policies
CREATE POLICY select_businesses_policy ON public.businesses
    FOR SELECT USING (TRUE); -- Anyone can search approved businesses

CREATE POLICY insert_businesses_policy ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id); -- Owner only

CREATE POLICY update_businesses_policy ON public.businesses
    FOR UPDATE USING (auth.uid() = owner_id); -- Owner only

-- 2. Business Profiles Policies
CREATE POLICY select_profiles_policy ON public.business_profiles
    FOR SELECT USING (TRUE); -- Publicly viewable profiles

CREATE POLICY write_profiles_policy ON public.business_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.businesses b 
            WHERE b.id = business_profiles.business_id AND b.owner_id = auth.uid()
        )
    );

-- 3. Business Fields Policies
CREATE POLICY select_fields_policy ON public.business_fields
    FOR SELECT USING (TRUE); -- Anyone can view specifications

CREATE POLICY write_fields_policy ON public.business_fields
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.businesses b 
            WHERE b.id = business_fields.business_id AND b.owner_id = auth.uid()
        )
    );

-- 4. Business Documents Policies
CREATE POLICY select_documents_policy ON public.business_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.businesses b 
            WHERE b.id = business_documents.business_id AND b.owner_id = auth.uid()
        )
    ); -- Only the owner can view their documents (and admins)

CREATE POLICY write_documents_policy ON public.business_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.businesses b 
            WHERE b.id = business_documents.business_id AND b.owner_id = auth.uid()
        )
    );

-- 5. Business Media Policies
CREATE POLICY select_media_policy ON public.business_media
    FOR SELECT USING (TRUE); -- Public

CREATE POLICY write_media_policy ON public.business_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.businesses b 
            WHERE b.id = business_media.business_id AND b.owner_id = auth.uid()
        )
    );

-- 6. Business Bookings Policies
CREATE POLICY select_bookings_policy ON public.business_bookings
    FOR SELECT USING (
        auth.uid() = customer_id OR 
        EXISTS (
            SELECT 1 FROM public.businesses b 
            WHERE b.id = business_bookings.business_id AND b.owner_id = auth.uid()
        )
    ); -- Customer or Owner

CREATE POLICY write_bookings_policy ON public.business_bookings
    FOR ALL USING (
        auth.uid() = customer_id OR 
        EXISTS (
            SELECT 1 FROM public.businesses b 
            WHERE b.id = business_bookings.business_id AND b.owner_id = auth.uid()
        )
    );
