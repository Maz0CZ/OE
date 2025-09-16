-- IMPORTANT: Ensure Row Level Security is ENABLED for the 'profiles' table first.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts and ensure a clean setup (recommended if you're having issues)
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.profiles;

-- Policy to allow authenticated users to insert their own profile upon registration.
CREATE POLICY "Allow authenticated users to insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy to allow authenticated users to view their own profile.
CREATE POLICY "Allow authenticated users to view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy to allow authenticated users to update their own profile.
-- Corrected syntax: WITH CHECK immediately follows USING.
CREATE POLICY "Allow authenticated users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);