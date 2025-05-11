
-- Create a bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload their own profile images
CREATE POLICY "Allow users to upload their own profile images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow authenticated users to update their own profile images
CREATE POLICY "Allow users to update their own profile images" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow authenticated users to delete their own profile images
CREATE POLICY "Allow users to delete their own profile images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policy to allow public read access to all profile images
CREATE POLICY "Allow public read access to profile images" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'profiles');

-- Add image_url column to profiles table if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS image_url TEXT;
