
-- Create a bucket for campaign posters
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-posters', 'Campaign Posters', true);

-- Allow any authenticated user to read campaign-posters
CREATE POLICY "Public can view campaign posters"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'campaign-posters');

-- Allow authenticated users to upload campaign posters
CREATE POLICY "Authenticated users can upload campaign posters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-posters');

-- Allow users to update their own campaign posters
CREATE POLICY "Authenticated users can update their own campaign posters"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'campaign-posters' AND auth.uid() = owner);

-- Allow users to delete their own campaign posters
CREATE POLICY "Authenticated users can delete their own campaign posters"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'campaign-posters' AND auth.uid() = owner);
