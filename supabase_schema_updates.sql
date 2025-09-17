-- 1. Add new columns to the 'profiles' table
ALTER TABLE public.profiles
ADD COLUMN title TEXT,
ADD COLUMN work TEXT,
ADD COLUMN website TEXT;

-- 2. Create the 'natural_disasters' table
CREATE TABLE public.natural_disasters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., "Earthquake", "Flood", "Hurricane", "Wildfire"
    date DATE NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    casualties INTEGER,
    magnitude NUMERIC(3,1), -- For earthquakes (Richter scale) or wind speed (Beaufort/Saffir-Simpson)
    lat NUMERIC(9,6),
    lon NUMERIC(9,6)
);

-- Enable RLS for 'natural_disasters' table
ALTER TABLE public.natural_disasters ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read natural disasters
CREATE POLICY "Allow authenticated users to read natural_disasters"
ON public.natural_disasters FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow reporters to insert natural disasters
CREATE POLICY "Allow reporters to insert natural_disasters"
ON public.natural_disasters FOR INSERT
TO reporter
WITH CHECK (true);

-- 3. Add 'log_type' column to the 'logs' table
ALTER TABLE public.logs
ADD COLUMN log_type TEXT DEFAULT 'general_info';