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
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Fast query indices
CREATE INDEX IF NOT EXISTS idx_verification_docs_claim_id ON public.verification_documents(claim_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_listing_uid ON public.verification_documents(listing_uid);
CREATE INDEX IF NOT EXISTS idx_verification_docs_uploaded_by ON public.verification_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_verification_docs_status ON public.verification_documents(status);

-- Enable Row Level Security
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Grant privileges to service role and authenticated users
GRANT ALL PRIVILEGES ON public.verification_documents TO service_role;
GRANT SELECT, INSERT ON public.verification_documents TO authenticated;

-- Policies:
-- 1. Authenticated users can view documents they uploaded
CREATE POLICY "Users can view own verification documents"
  ON public.verification_documents
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid()::text);

-- 2. Authenticated users can upload documents linked to their identity
CREATE POLICY "Users can upload own verification documents"
  ON public.verification_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid()::text);
