-- ====================================================================
-- HILLYTRIP TAXI MODULE PHASE 1 - SUPABASE DATABASE SCHEMA
-- ====================================================================

-- 1. Taxi Operators Table
CREATE TABLE IF NOT EXISTS public.taxi_operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- Nullable to support bulk CSV imports before user claim/signup
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL, -- Integrates with Business Module
    business_name TEXT NOT NULL, -- Populated from CSV Operator Name
    owner_name TEXT, -- Nullable as CSV does not contain owner names
    phone TEXT NOT NULL,
    whatsapp TEXT, -- Optional, defaults to phone if omitted
    base_taxi_stand TEXT NOT NULL, -- Populated from CSV Main Taxi Stand
    booking_preference TEXT DEFAULT 'both' CHECK (booking_preference IN ('instant', 'quote_only', 'both')),
    is_online BOOLEAN DEFAULT true,
    booking_enabled BOOLEAN DEFAULT true,
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'verified', 'rejected', 'suspended')),
    rating NUMERIC(3,2) DEFAULT NULL, -- Rating set to NULL until genuine reviews exist
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Operator Working Areas Table
CREATE TABLE IF NOT EXISTS public.operator_working_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.taxi_operators(id) ON DELETE CASCADE,
    district TEXT NOT NULL CHECK (district IN ('Darjeeling', 'Kalimpong', 'East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Operator Vehicle Categories Table (Count only, no individual vehicle registration)
CREATE TABLE IF NOT EXISTS public.operator_vehicle_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.taxi_operators(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL CHECK (category_name IN ('Bolero', 'Ertiga', 'Innova', 'Traveller')),
    vehicle_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Operator Fixed Routes Table (Max 20 per operator)
CREATE TABLE IF NOT EXISTS public.operator_fixed_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.taxi_operators(id) ON DELETE CASCADE,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    private_taxi_available BOOLEAN DEFAULT true,
    private_starting_price NUMERIC(10,2) DEFAULT 0.00,
    shared_taxi_available BOOLEAN DEFAULT false,
    shared_fare NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Quote Requests Table
CREATE TABLE IF NOT EXISTS public.quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    traveller_id TEXT NOT NULL,
    traveller_name TEXT NOT NULL,
    traveller_phone TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('transfer', 'sightseeing', 'tour', 'custom')),
    pickup_location TEXT,
    drop_location TEXT,
    trip_type TEXT CHECK (trip_type IN ('one_way', 'round_trip')),
    destination TEXT,
    sightseeing_package TEXT,
    tour_package TEXT,
    number_of_days INTEGER,
    multiple_stops JSONB DEFAULT '[]'::jsonb,
    trip_description TEXT,
    journey_date DATE NOT NULL,
    journey_time TEXT,
    travellers_count INTEGER NOT NULL DEFAULT 1,
    vehicle_preference TEXT,
    notes TEXT,
    working_area TEXT NOT NULL,
    request_status TEXT DEFAULT 'pending' CHECK (request_status IN ('pending', 'responded', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quote Request Responses Table
CREATE TABLE IF NOT EXISTS public.quote_request_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.taxi_operators(id) ON DELETE CASCADE,
    operator_name TEXT NOT NULL,
    operator_phone TEXT NOT NULL,
    operator_whatsapp TEXT NOT NULL,
    fare NUMERIC(10,2) NOT NULL,
    operator_message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast searching and quote matching
CREATE INDEX IF NOT EXISTS idx_operator_working_areas_district ON public.operator_working_areas(district);
CREATE INDEX IF NOT EXISTS idx_operator_fixed_routes_from_to ON public.operator_fixed_routes(from_location, to_location);
CREATE INDEX IF NOT EXISTS idx_quote_requests_working_area ON public.quote_requests(working_area);
CREATE INDEX IF NOT EXISTS idx_quote_responses_request_id ON public.quote_request_responses(request_id);

-- Enable RLS
ALTER TABLE public.taxi_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_working_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_fixed_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_request_responses ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read of approved taxi operators" ON public.taxi_operators FOR SELECT USING (true);
CREATE POLICY "Allow public read of working areas" ON public.operator_working_areas FOR SELECT USING (true);
CREATE POLICY "Allow public read of vehicle categories" ON public.operator_vehicle_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read of fixed routes" ON public.operator_fixed_routes FOR SELECT USING (true);
CREATE POLICY "Allow public insert of quote requests" ON public.quote_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read quote requests" ON public.quote_requests FOR SELECT USING (true);
CREATE POLICY "Allow insert quote responses" ON public.quote_request_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow read quote responses" ON public.quote_request_responses FOR SELECT USING (true);
