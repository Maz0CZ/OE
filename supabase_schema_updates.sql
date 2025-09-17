-- Add missing columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN title TEXT,
ADD COLUMN work TEXT,
ADD COLUMN website TEXT;

-- Add missing date column to the violations table
ALTER TABLE public.violations
ADD COLUMN date DATE;

-- Add missing date column to the un_declarations table
ALTER TABLE public.un_declarations
ADD COLUMN date DATE;

-- Optional: If you want to backfill the date for existing violations and un_declarations
-- For violations, you might use created_at or a default date
-- UPDATE public.violations SET date = created_at::date WHERE date IS NULL;

-- For un_declarations, you might use the existing 'year' column to construct a date
-- UPDATE public.un_declarations SET date = make_date(year, 1, 1) WHERE date IS NULL;