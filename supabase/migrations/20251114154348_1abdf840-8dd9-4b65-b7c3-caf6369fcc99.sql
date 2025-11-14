-- Add image_url column to obras table
ALTER TABLE public.obras ADD COLUMN imagen_proyecto text;

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('proyectos', 'proyectos', true);

-- Allow authenticated users to upload their own project images
CREATE POLICY "Users can upload own project images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proyectos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view all project images
CREATE POLICY "Anyone can view project images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'proyectos');

-- Allow users to update their own project images
CREATE POLICY "Users can update own project images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'proyectos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own project images
CREATE POLICY "Users can delete own project images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'proyectos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);