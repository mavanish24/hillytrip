-- ============================================================================
-- HILLYTRIP VERIFICATION DOCUMENTS SCHEMA & POLICIES
-- Permanent metadata storage for Business / Homestay claim verification files
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.verification_documents (
  id TEXT PRIMARY KEY,
  claim_id TEXT NOT NULL,
  listing_uid TEXT NOT NULL,
  business_id TEXT,
  homestay_id TEXT,
  uploaded_by TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'ownership_proof',
  original_file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_verification_docs_claim_id ON public.verification_documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_listing_uid ON public.verification_documents(listing_uid);
CREATE INDEX IF NOT EXISTS idx_verification_docs_uploaded_by ON public.verification_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_verification_docs_status ON public.verification_documents(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- 1. Service role has full permissions
CREATE POLICY "service_role_full_access" ON public.verification_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Authenticated owners can view their own documents
CREATE POLICY "owners_read_own_documents" ON public.verification_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = uploaded_by);

-- 3. Authenticated owners can insert their own documents
CREATE POLICY "owners_insert_own_documents" ON public.verification_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = uploaded_by);

-- ============================================================================
-- End of Migration
-- ============================================================================
