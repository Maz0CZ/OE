-- Enable the uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the 'profiles' table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    avatar_url text,
    status text DEFAULT 'active'::text NOT NULL, -- Added for user banning
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) for 'profiles'
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to profiles (e.g., for displaying author names)
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy for admins to view and update all profiles
CREATE POLICY "Admins can manage all profiles." ON public.profiles
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin') WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Create the 'posts' table for the forum
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    moderation_status text DEFAULT 'pending'::text NOT NULL,
    CONSTRAINT posts_pkey PRIMARY KEY (id)
);

-- Set up RLS for 'posts'
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to create posts
CREATE POLICY "Authenticated users can create posts." ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Policy for public read access to approved posts
CREATE POLICY "Approved posts are viewable by everyone." ON public.posts
  FOR SELECT USING (moderation_status = 'approved' OR auth.uid() = author_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));

-- Policy for authors to update their own posts (if pending or approved)
CREATE POLICY "Authors can update own posts." ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Policy for admins/moderators to update any post (e.g., moderation status)
CREATE POLICY "Admins and moderators can update all posts." ON public.posts
  FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));

-- Policy for authors to delete their own posts (if pending)
CREATE POLICY "Authors can delete own pending posts." ON public.posts
  FOR DELETE USING (auth.uid() = author_id AND moderation_status = 'pending');

-- Policy for admins/moderators to delete any post
CREATE POLICY "Admins and moderators can delete any post." ON public.posts
  FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));


-- Create the 'post_reactions' table
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL, -- 'like' or 'dislike'
    CONSTRAINT post_reactions_pkey PRIMARY KEY (id),
    CONSTRAINT unique_user_post_reaction UNIQUE (user_id, post_id)
);

-- Set up RLS for 'post_reactions'
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to create reactions
CREATE POLICY "Authenticated users can create reactions." ON public.post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for public read access to all reactions (for counts)
CREATE POLICY "Reactions are viewable by everyone." ON public.post_reactions
  FOR SELECT USING (true);

-- Policy for users to update/delete their own reactions
CREATE POLICY "Users can manage own reactions." ON public.post_reactions
  FOR ALL USING (auth.uid() = user_id);


-- Create the 'comments' table
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    content text NOT NULL,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT comments_pkey PRIMARY KEY (id)
);

-- Set up RLS for 'comments'
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to create comments
CREATE POLICY "Authenticated users can create comments." ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Policy for public read access to comments
CREATE POLICY "Comments are viewable by everyone." ON public.comments
  FOR SELECT USING (true);

-- Policy for authors to update/delete their own comments
CREATE POLICY "Authors can manage own comments." ON public.comments
  FOR ALL USING (auth.uid() = author_id);

-- Policy for admins/moderators to delete any comment
CREATE POLICY "Admins and moderators can delete any comment." ON public.comments
  FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));


-- Create the 'conflicts' table
CREATE TABLE IF NOT EXISTS public.conflicts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    region text NOT NULL,
    status text NOT NULL, -- e.g., 'active', 'resolved', 'escalating', 'de-escalating'
    severity text NOT NULL, -- e.g., 'critical', 'high', 'medium', 'low'
    start_date date NOT NULL,
    casualties integer,
    involved_parties text[],
    lat numeric,
    lon numeric,
    CONSTRAINT conflicts_pkey PRIMARY KEY (id)
);

-- Set up RLS for 'conflicts'
ALTER TABLE public.conflicts ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to conflicts
CREATE POLICY "Conflicts are viewable by everyone." ON public.conflicts
  FOR SELECT USING (true);

-- Policy for admins/reporters to manage conflicts
CREATE POLICY "Admins and reporters can manage conflicts." ON public.conflicts
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter')) WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'));


-- Create the 'violations' table
CREATE TABLE IF NOT EXISTS public.violations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    location text NOT NULL,
    date date NOT NULL,
    description text NOT NULL,
    severity text NOT NULL, -- e.g., 'critical', 'high', 'medium', 'low'
    CONSTRAINT violations_pkey PRIMARY KEY (id)
);

-- Set up RLS for 'violations'
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to violations
CREATE POLICY "Violations are viewable by everyone." ON public.violations
  FOR SELECT USING (true);

-- Policy for admins/reporters to manage violations
CREATE POLICY "Admins and reporters can manage violations." ON public.violations
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter')) WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'));


-- Create the 'un_declarations' table
CREATE TABLE IF NOT EXISTS public.un_declarations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    date date NOT NULL,
    summary text NOT NULL,
    link text,
    CONSTRAINT un_declarations_pkey PRIMARY KEY (id)
);

-- Set up RLS for 'un_declarations'
ALTER TABLE public.un_declarations ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to UN declarations
CREATE POLICY "UN declarations are viewable by everyone." ON public.un_declarations
  FOR SELECT USING (true);

-- Policy for admins/reporters to manage UN declarations
CREATE POLICY "Admins and reporters can manage UN declarations." ON public.un_declarations
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter')) WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'));


-- Create the 'countries' table
CREATE TABLE IF NOT EXISTS public.countries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    population bigint,
    is_democracy boolean NOT NULL,
    president text,
    flag_emoji text,
    CONSTRAINT countries_pkey PRIMARY KEY (id)
);

-- Set up RLS for 'countries'
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to countries
CREATE POLICY "Countries are viewable by everyone." ON public.countries
  FOR SELECT USING (true);

-- Policy for admins/reporters to manage countries
CREATE POLICY "Admins and reporters can manage countries." ON public.countries
  FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter')) WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'));


-- Create the 'logs' table
CREATE TABLE IF NOT EXISTS public.logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    message text NOT NULL,
    log_level text DEFAULT 'info'::text NOT NULL, -- e.g., 'info', 'warning', 'error', 'debug'
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    CONSTRAINT logs_pkey PRIMARY KEY (id)
);

-- Set up RLS for 'logs'
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all logs
CREATE POLICY "Admins can view all logs." ON public.logs
  FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Policy for authenticated users to insert logs (for their own actions)
CREATE POLICY "Authenticated users can insert logs." ON public.logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);


-- Create the 'posts_with_aggregated_data' view
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
FROM
    posts p
LEFT JOIN
    profiles pr ON p.author_id = pr.id
LEFT JOIN
    (SELECT post_id, COUNT(*) AS count FROM post_reactions WHERE type = 'like' GROUP BY post_id) AS likes ON p.id = likes.post_id
LEFT JOIN
    (SELECT post_id, COUNT(*) AS count FROM post_reactions WHERE type = 'dislike' GROUP BY post_id) AS dislikes ON p.id = dislikes.post_id
LEFT JOIN
    (SELECT post_id, COUNT(*) AS count FROM comments GROUP BY post_id) AS comments ON p.id = comments.post_id;

-- Optional: Add some initial data (uncomment and modify as needed)
-- INSERT INTO public.profiles (id, username, role, avatar_url, status) VALUES
-- ('<UUID_OF_YOUR_ADMIN_USER>', 'adminuser', 'admin', NULL, 'active'),
-- ('<UUID_OF_YOUR_MODERATOR_USER>', 'moduser', 'moderator', NULL, 'active');

-- INSERT INTO public.conflicts (name, region, status, severity, start_date, casualties, involved_parties, lat, lon) VALUES
-- ('Example Conflict A', 'Middle East', 'active', 'critical', '2023-01-15', 15000, ARRAY['Faction X', 'Faction Y'], 33.89, 35.50),
-- ('Example Conflict B', 'Africa', 'escalating', 'high', '2024-03-01', 5000, ARRAY['Government', 'Rebels'], -1.29, 36.82);

-- INSERT INTO public.posts (title, content, author_id, moderation_status) VALUES
-- ('First Forum Post', 'This is the content of the first post.', '<UUID_OF_A_USER>', 'approved');