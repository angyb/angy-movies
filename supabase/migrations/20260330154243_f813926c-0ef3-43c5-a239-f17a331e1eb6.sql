
-- Create public storage bucket for movie posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('movie-posters', 'movie-posters', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to movie posters
CREATE POLICY "Public read access for movie posters"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'movie-posters');

-- Allow service role to insert/update posters
CREATE POLICY "Service role can manage movie posters"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'movie-posters');

CREATE POLICY "Service role can update movie posters"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'movie-posters');
