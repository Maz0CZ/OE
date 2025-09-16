-- WARNING: This script will permanently delete data from the specified tables and views.
-- Please back up your data if you wish to retain it.

-- Drop views first, as they depend on tables
DROP VIEW IF EXISTS public.posts_with_aggregated_data CASCADE;

-- Drop tables
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.post_reactions CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.conflicts CASCADE;
DROP TABLE IF EXISTS public.violations CASCADE;
DROP TABLE IF EXISTS public.un_declarations CASCADE;

-- Note: The 'countries', 'profiles', and 'logs' tables are intentionally kept.
-- The 'profiles' table is crucial for user authentication and roles.
-- The 'logs' table is used for application activity logging.
-- The 'countries' table was explicitly requested to be kept.

-- You may need to re-run your initial schema creation script for the dropped tables
-- after executing this reset script, if you want to re-populate them.