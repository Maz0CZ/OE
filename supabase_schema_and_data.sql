-- Enable the uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------
-- HELPER FUNCTIONS
-------------------------

-- Function to get the current user's role, bypassing RLS on profiles table
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- IMPORTANT: Runs with definer's privileges to avoid RLS recursion on profiles table
AS $$
DECLARE
    user_id uuid := auth.uid();
    user_role text;
BEGIN
    IF user_id IS NULL THEN
        RETURN 'guest';
    END IF;
    SELECT role INTO user_role FROM public.profiles WHERE id = user_id;
    RETURN COALESCE(user_role, 'user'); -- Default to 'user' if role is null
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

-- Helper function to check if the current user has a specific role
CREATE OR REPLACE FUNCTION public.is_user_role(role_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- IMPORTANT: Runs with definer's privileges to avoid RLS recursion on profiles table
AS $$
DECLARE
    current_user_role text;
BEGIN
    SELECT public.get_user_role() INTO current_user_role;
    RETURN current_user_role = role_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_user_role(text) TO authenticated;


-------------------------
-- PROFILES TABLE
-------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    avatar_url text,
    status text DEFAULT 'active'::text NOT NULL
);

-- Add missing columns (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='username') THEN
        ALTER TABLE public.profiles ADD COLUMN username text UNIQUE NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'user'::text NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
        ALTER TABLE public.profiles ADD COLUMN status text DEFAULT 'active'::text NOT NULL;
    END IF;
END
$$;

-- Add username length constraint if missing (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.check_constraints
        WHERE constraint_name='username_length' AND constraint_schema='public'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT username_length CHECK (char_length(username) >= 3);
    END IF;
END
$$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Public profiles are viewable by everyone.' AND tablename='profiles') THEN
        CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Users can update own profile.' AND tablename='profiles') THEN
        CREATE POLICY "Users can update own profile." ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins can manage all profiles.' AND tablename='profiles') THEN
        CREATE POLICY "Admins can manage all profiles." ON public.profiles
          FOR ALL USING (public.is_user_role('admin'))
          WITH CHECK (public.is_user_role('admin'));
    END IF;
END
$$;

-------------------------
-- POSTS TABLE
-------------------------
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    moderation_status text DEFAULT 'pending'::text NOT NULL
);

-- Add missing columns (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='created_at') THEN
        ALTER TABLE public.posts ADD COLUMN created_at timestamp with time zone DEFAULT now() NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='title') THEN
        ALTER TABLE public.posts ADD COLUMN title text NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='content') THEN
        ALTER TABLE public.posts ADD COLUMN content text NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='author_id') THEN
        ALTER TABLE public.posts ADD COLUMN author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='moderation_status') THEN
        ALTER TABLE public.posts ADD COLUMN moderation_status text DEFAULT 'pending'::text NOT NULL;
    END IF;
END
$$;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policies for posts (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Authenticated users can create posts.' AND tablename='posts') THEN
        CREATE POLICY "Authenticated users can create posts." ON public.posts
          FOR INSERT WITH CHECK (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Approved posts are viewable by everyone.' AND tablename='posts') THEN
        CREATE POLICY "Approved posts are viewable by everyone." ON public.posts
          FOR SELECT USING (moderation_status = 'approved' OR auth.uid() = author_id OR public.is_user_role('admin') OR public.is_user_role('moderator'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Authors can update own posts.' AND tablename='posts') THEN
        CREATE POLICY "Authors can update own posts." ON public.posts
          FOR UPDATE USING (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins and moderators can update all posts.' AND tablename='posts') THEN
        CREATE POLICY "Admins and moderators can update all posts." ON public.posts
          FOR UPDATE USING (public.is_user_role('admin') OR public.is_user_role('moderator'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Authors can delete own pending posts.' AND tablename='posts') THEN
        CREATE POLICY "Authors can delete own pending posts." ON public.posts
          FOR DELETE USING (auth.uid() = author_id AND moderation_status = 'pending');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins and moderators can delete any post.' AND tablename='posts') THEN
        CREATE POLICY "Admins and moderators can delete any post." ON public.posts
          FOR DELETE USING (public.is_user_role('admin') OR public.is_user_role('moderator'));
    END IF;
END
$$;

-------------------------
-- POST_REACTIONS TABLE
-------------------------
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL,
    CONSTRAINT unique_user_post_reaction UNIQUE (user_id, post_id)
);

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Authenticated users can create reactions.' AND tablename='post_reactions') THEN
        CREATE POLICY "Authenticated users can create reactions." ON public.post_reactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Reactions are viewable by everyone.' AND tablename='post_reactions') THEN
        CREATE POLICY "Reactions are viewable by everyone." ON public.post_reactions
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Users can manage own reactions.' AND tablename='post_reactions') THEN
        CREATE POLICY "Users can manage own reactions." ON public.post_reactions
          FOR ALL USING (auth.uid() = user_id);
    END IF;
END
$$;

-------------------------
-- COMMENTS TABLE
-------------------------
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    content text NOT NULL,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Authenticated users can create comments.' AND tablename='comments') THEN
        CREATE POLICY "Authenticated users can create comments." ON public.comments
          FOR INSERT WITH CHECK (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Comments are viewable by everyone.' AND tablename='comments') THEN
        CREATE POLICY "Comments are viewable by everyone." ON public.comments
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Authors can manage own comments.' AND tablename='comments') THEN
        CREATE POLICY "Authors can manage own comments." ON public.comments
          FOR ALL USING (auth.uid() = author_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins and moderators can delete any comment.' AND tablename='comments') THEN
        CREATE POLICY "Admins and moderators can delete any comment." ON public.comments
          FOR DELETE USING (public.is_user_role('admin') OR public.is_user_role('moderator'));
    END IF;
END
$$;

-------------------------
-- CONFLICTS TABLE
-------------------------
CREATE TABLE IF NOT EXISTS public.conflicts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    region text NOT NULL,
    status text NOT NULL,
    severity text NOT NULL,
    start_date date NOT NULL,
    casualties integer,
    involved_parties text[],
    lat numeric,
    lon numeric
);

ALTER TABLE public.conflicts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Conflicts are viewable by everyone.' AND tablename='conflicts') THEN
        CREATE POLICY "Conflicts are viewable by everyone." ON public.conflicts
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins and reporters can manage conflicts.' AND tablename='conflicts') THEN
        CREATE POLICY "Admins and reporters can manage conflicts." ON public.conflicts
          FOR ALL USING (public.is_user_role('admin') OR public.is_user_role('reporter'))
          WITH CHECK (public.is_user_role('admin') OR public.is_user_role('reporter'));
    END IF;
END
$$;

-------------------------
-- VIOLATIONS TABLE
-------------------------
CREATE TABLE IF NOT EXISTS public.violations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    type text NOT NULL,
    location text NOT NULL,
    date date NOT NULL,
    description text NOT NULL,
    severity text NOT NULL
);

ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Violations are viewable by everyone.' AND tablename='violations') THEN
        CREATE POLICY "Violations are viewable by everyone." ON public.violations
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins and reporters can manage violations.' AND tablename='violations') THEN
        CREATE POLICY "Admins and reporters can manage violations." ON public.violations
          FOR ALL USING (public.is_user_role('admin') OR public.is_user_role('reporter'))
          WITH CHECK (public.is_user_role('admin') OR public.is_user_role('reporter'));
    END IF;
END
$$;

-------------------------
-- UN_DECLARATIONS TABLE
-------------------------
CREATE TABLE IF NOT EXISTS public.un_declarations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    date date NOT NULL,
    summary text NOT NULL,
    link text
);

ALTER TABLE public.un_declarations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='UN declarations are viewable by everyone.' AND tablename='un_declarations') THEN
        CREATE POLICY "UN declarations are viewable by everyone." ON public.un_declarations
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins and reporters can manage UN declarations.' AND tablename='un_declarations') THEN
        CREATE POLICY "Admins and reporters can manage UN declarations." ON public.un_declarations
          FOR ALL USING (public.is_user_role('admin') OR public.is_user_role('reporter'))
          WITH CHECK (public.is_user_role('admin') OR public.is_user_role('reporter'));
    END IF;
END
$$;

-------------------------
-- COUNTRIES TABLE
-------------------------
CREATE TABLE IF NOT EXISTS public.countries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    population bigint,
    is_democracy boolean NOT NULL,
    president text,
    flag_emoji text
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Countries are viewable by everyone.' AND tablename='countries') THEN
        CREATE POLICY "Countries are viewable by everyone." ON public.countries
          FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins and reporters can manage countries.' AND tablename='countries') THEN
        CREATE POLICY "Admins and reporters can manage countries." ON public.countries
          FOR ALL USING (public.is_user_role('admin') OR public.is_user_role('reporter'))
          WITH CHECK (public.is_user_role('admin') OR public.is_user_role('reporter'));
    END IF;
END
$$;

-------------------------
-- LOGS TABLE
-------------------------
CREATE TABLE IF NOT EXISTS public.logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    message text NOT NULL,
    log_level text DEFAULT 'info'::text NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins can view all logs.' AND tablename='logs') THEN
        CREATE POLICY "Admins can view all logs." ON public.logs
          FOR SELECT USING (public.is_user_role('admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Authenticated users can insert logs.' AND tablename='logs') THEN
        CREATE POLICY "Authenticated users can insert logs." ON public.logs
          FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
    END IF;
END
$$;

-------------------------
-- VIEW
-------------------------
CREATE OR REPLACE VIEW public.posts_with_aggregated_data AS
SELECT
    p.id,
    p.created_at,
    p.title,
    p.content,
    p.author_id,
    p.moderation_status,
    pr.username AS author_username,
    pr.avatar_url AS author_avatar_url,
    COALESCE(likes.count, 0)::int AS likes_count,
    COALESCE(dislikes.count, 0)::int AS dislikes_count,
    COALESCE(comments.count, 0)::int AS comments_count
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
LEFT JOIN (SELECT post_id, COUNT(*) AS count FROM post_reactions WHERE type='like' GROUP BY post_id) AS likes ON p.id = likes.post_id
LEFT JOIN (SELECT post_id, COUNT(*) AS count FROM post_reactions WHERE type='dislike' GROUP BY post_id) AS dislikes ON p.id = dislikes.post_id
LEFT JOIN (SELECT post_id, COUNT(*) AS count FROM comments GROUP BY post_id) AS comments ON p.id = comments.post_id;