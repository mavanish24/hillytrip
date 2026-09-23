-- ============================================================================
-- HillyTrip Membership Module Migration
-- Completely separate and independent from Business Claim System
-- ============================================================================

-- 1. Table: membership_plans
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_type VARCHAR(100) NOT NULL,
    min_capacity INTEGER NOT NULL DEFAULT 1,
    max_capacity INTEGER, -- NULL indicates unlimited / no upper bound (e.g. 8+, 11+)
    price NUMERIC(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 365,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_membership_plans_type ON public.membership_plans(business_type);
CREATE INDEX IF NOT EXISTS idx_membership_plans_active ON public.membership_plans(is_active);

-- Seed initial membership plans for Homestays and Taxis
INSERT INTO public.membership_plans (business_type, min_capacity, max_capacity, price, duration_days, is_active)
VALUES
    -- Homestay Plans
    ('Homestay', 1, 2, 499.00, 365, true),
    ('Homestay', 3, 7, 999.00, 365, true),
    ('Homestay', 8, NULL, 1999.00, 365, true),
    -- Taxi Plans
    ('Taxi', 1, 4, 499.00, 365, true),
    ('Taxi', 5, 10, 999.00, 365, true),
    ('Taxi', 11, NULL, 1999.00, 365, true);

-- 2. Table: memberships
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
    price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- e.g. 'active', 'expired', 'cancelled', 'pending'
    trial BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memberships_business_id ON public.memberships(business_id);
CREATE INDEX IF NOT EXISTS idx_memberships_business_type ON public.memberships(business_type);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON public.memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_plan_id ON public.memberships(plan_id);

-- 3. Table: system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trial_enabled BOOLEAN NOT NULL DEFAULT true,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    default_commission NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default system settings
INSERT INTO public.system_settings (trial_enabled, trial_end_date, default_commission)
VALUES (true, NULL, 10.00);

-- Updated_at Trigger Helper
CREATE OR REPLACE FUNCTION public.set_membership_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_membership_plans_updated_at
    BEFORE UPDATE ON public.membership_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.set_membership_updated_at();

CREATE TRIGGER trg_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_membership_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_membership_plans_policy ON public.membership_plans FOR SELECT USING (TRUE);
CREATE POLICY select_memberships_policy ON public.memberships FOR SELECT USING (TRUE);
CREATE POLICY select_system_settings_policy ON public.system_settings FOR SELECT USING (TRUE);
