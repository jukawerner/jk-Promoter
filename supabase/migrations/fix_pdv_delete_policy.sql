-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable delete for all users" ON public.pdv;

-- Create new delete policy that allows anyone to delete
CREATE POLICY "Enable delete for all users"
ON public.pdv
FOR DELETE
TO public
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.pdv ENABLE ROW LEVEL SECURITY;

-- Storage bucket policies
UPDATE storage.buckets 
SET public = true 
WHERE name = 'pdv-photos';

-- Allow all operations on storage for everyone
CREATE POLICY "Allow public access"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'pdv-photos');
