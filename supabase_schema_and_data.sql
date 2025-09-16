-- Create the profiles table if it doesn't exist, or alter it to match the schema.
-- This script assumes you might be running it on an existing database.
-- If the table already exists, you might need to adjust ALTER TABLE statements.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'user'::text NOT NULL,
  avatar_url text,
  status text DEFAULT 'active'::text NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add missing columns if they don't exist
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'::text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active'::text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
END $$;

-- Ensure columns have correct constraints if they were just added
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'user'::text;
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'active'::text;
ALTER TABLE public.profiles ALTER COLUMN updated_at SET DEFAULT now();

-- Enable Row Level Security (RLS) for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Set unique constraint for username if not already present
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;

-- Ensure username is NOT NULL
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;