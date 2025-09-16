-- You will need to run this ALTER TABLE statement in your Supabase SQL editor.
ALTER TABLE public.conflicts
ADD COLUMN source_url TEXT;

-- If you have existing data, you might want to set a default or update it:
-- ALTER TABLE public.conflicts ALTER COLUMN source_url SET DEFAULT '';
-- UPDATE public.conflicts SET source_url = '' WHERE source_url IS NULL;