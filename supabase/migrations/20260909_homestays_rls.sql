-- Enable RLS and grant public read access on homestays
ALTER TABLE public.homestays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on homestays"
ON public.homestays
FOR SELECT
TO anon, authenticated
USING (true);
