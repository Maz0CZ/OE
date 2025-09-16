-- Enable the "uuid-ossp" extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
-- This table stores additional user profile information and links directly to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  username text UNIQUE NOT NULL,
  role text DEFAULT 'user' NOT NULL,
  avatar_url text,
  status text DEFAULT 'active' NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
CREATE POLICY "Admins can update any profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 2. Posts Table
-- Stores forum posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL, -- Link to auth.users
  moderation_status text DEFAULT 'pending' NOT NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policies for posts
DROP POLICY IF EXISTS "Approved posts are viewable by everyone." ON public.posts;
CREATE POLICY "Approved posts are viewable by everyone."
  ON public.posts FOR SELECT
  USING (
    moderation_status = 'approved' OR
    auth.uid() = author_id OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator'))
  );

DROP POLICY IF EXISTS "Authenticated users can create posts." ON public.posts;
CREATE POLICY "Authenticated users can create posts."
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own posts." ON public.posts;
CREATE POLICY "Users can update their own posts."
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins and Moderators can update any post." ON public.posts;
CREATE POLICY "Admins and Moderators can update any post."
  ON public.posts FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')));

DROP POLICY IF EXISTS "Admins and Moderators can delete any post." ON public.posts;
CREATE POLICY "Admins and Moderators can delete any post."
  ON public.posts FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')));

-- 3. Post Reactions Table
-- Tracks likes/dislikes for posts
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Link to auth.users
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
  UNIQUE (user_id, post_id) -- Ensure a user can only react once per post
);

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- Policies for post_reactions
DROP POLICY IF EXISTS "Users can view post reactions." ON public.post_reactions;
CREATE POLICY "Users can view post reactions."
  ON public.post_reactions FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can create post reactions." ON public.post_reactions;
CREATE POLICY "Authenticated users can create post reactions."
  ON public.post_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own post reactions." ON public.post_reactions;
CREATE POLICY "Users can delete their own post reactions."
  ON public.post_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Comments Table
-- Stores comments on posts
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  content TEXT NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL, -- Link to auth.users
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
CREATE POLICY "Comments are viewable by everyone."
  ON public.comments FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can create comments." ON public.comments;
CREATE POLICY "Authenticated users can create comments."
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own comments." ON public.comments;
CREATE POLICY "Users can update their own comments."
  ON public.comments FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own comments." ON public.comments;
CREATE POLICY "Users can delete their own comments."
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id);

-- 5. Violations Table
CREATE TABLE IF NOT EXISTS public.violations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'reported' NOT NULL,
  severity text DEFAULT 'medium' NOT NULL,
  reported_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL -- Link to auth.users
);

ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

-- Policies for violations
DROP POLICY IF EXISTS "Violations are viewable by everyone." ON public.violations;
CREATE POLICY "Violations are viewable by everyone."
  ON public.violations FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Authenticated users can report violations." ON public.violations;
CREATE POLICY "Authenticated users can report violations."
  ON public.violations FOR INSERT
  WITH CHECK (auth.uid() = reported_by_user_id);

DROP POLICY IF EXISTS "Admins and Moderators can update violations." ON public.violations;
CREATE POLICY "Admins and Moderators can update violations."
  ON public.violations FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'moderator')));

DROP POLICY IF EXISTS "Admins can delete violations." ON public.violations;
CREATE POLICY "Admins can delete violations."
  ON public.violations FOR DELETE
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 6. UN Declarations Table
CREATE TABLE IF NOT EXISTS public.un_declarations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  title text NOT NULL,
  description text,
  year integer NOT NULL,
  link text
);

ALTER TABLE public.un_declarations ENABLE ROW LEVEL SECURITY;

-- Policies for un_declarations
DROP POLICY IF EXISTS "UN Declarations are viewable by everyone." ON public.un_declarations;
CREATE POLICY "UN Declarations are viewable by everyone."
  ON public.un_declarations FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage UN declarations." ON public.un_declarations;
CREATE POLICY "Admins can manage UN declarations."
  ON public.un_declarations FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 7. Countries Table (with regime_type)
CREATE TABLE IF NOT EXISTS public.countries (
  id uuid NOT NULL DEFAULT gen_random_uuid () PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  population bigint NOT NULL,
  is_democracy boolean NOT NULL,
  president text NOT NULL,
  flag_emoji text NOT NULL,
  regime_type character varying(100) NULL
);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Policies for countries
DROP POLICY IF EXISTS "Countries are viewable by everyone." ON public.countries;
CREATE POLICY "Countries are viewable by everyone."
  ON public.countries FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage countries." ON public.countries;
CREATE POLICY "Admins can manage countries."
  ON public.countries FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- 8. Logs Table
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to auth.users
  log_level text NOT NULL
);

ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Policies for logs
DROP POLICY IF EXISTS "Admins can view logs." ON public.logs;
CREATE POLICY "Admins can view logs."
  ON public.logs FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

DROP POLICY IF EXISTS "Authenticated users can insert logs." ON public.logs;
CREATE POLICY "Authenticated users can insert logs."
  ON public.logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 9. Conflicts Table (Added for completeness, assuming it exists)
CREATE TABLE IF NOT EXISTS public.conflicts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  name text NOT NULL,
  region text NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  severity text DEFAULT 'medium' NOT NULL,
  start_date date NOT NULL,
  casualties integer, -- Changed to integer
  involved_parties text[], -- Changed to text[] (ARRAY in schema is equivalent)
  lat double precision,
  lon double precision,
  -- New columns for Wikipedia data
  summary text,
  wikipedia_url text,
  conflict_type text,
  countries_involved text[]
);

ALTER TABLE public.conflicts ENABLE ROW LEVEL SECURITY;

-- Policies for conflicts
DROP POLICY IF EXISTS "Conflicts are viewable by everyone." ON public.conflicts;
CREATE POLICY "Conflicts are viewable by everyone."
  ON public.conflicts FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Admins and Reporters can manage conflicts." ON public.conflicts;
CREATE POLICY "Admins and Reporters can manage conflicts."
  ON public.conflicts FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'reporter')))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'reporter')));


-- 10. SQL View for Posts with Aggregated Data
-- This view simplifies fetching posts with their author's username/avatar and aggregated counts.
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
  (SELECT count(*)::int FROM public.post_reactions lr WHERE lr.post_id = p.id AND lr.type = 'like') AS likes_count,
  (SELECT count(*)::int FROM public.post_reactions dr WHERE dr.post_id = p.id AND dr.type = 'dislike') AS dislikes_count,
  (SELECT count(*)::int FROM public.comments c WHERE c.post_id = p.id) AS comments_count
FROM
  public.posts p
LEFT JOIN
  public.profiles pr ON p.author_id = pr.id; -- Join posts.author_id (auth.users.id) with profiles.id (auth.users.id)

-- Dummy Data Insertion (ON CONFLICT DO NOTHING prevents errors if data already exists)

-- Insert dummy profiles (ensure auth.users exist first, e.g., by registering in the app)
DO $$
DECLARE
  admin_user_id uuid := (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);
  moderator_user_id uuid := (SELECT id FROM auth.users OFFSET 1 LIMIT 1);
  reporter_user_id uuid := (SELECT id FROM auth.users OFFSET 2 LIMIT 1);
  test_user_id uuid := (SELECT id FROM auth.users OFFSET 3 LIMIT 1);
BEGIN
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, role, status, avatar_url) VALUES
    (admin_user_id, 'adminuser', 'admin', 'active', 'https://api.dicebear.com/7.x/initials/svg?seed=admin')
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, role = EXCLUDED.role, status = EXCLUDED.status, avatar_url = EXCLUDED.avatar_url;
  END IF;
  IF moderator_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, role, status, avatar_url) VALUES
    (moderator_user_id, 'moderatoruser', 'moderator', 'active', 'https://api.dicebear.com/7.x/initials/svg?seed=moderator')
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, role = EXCLUDED.role, status = EXCLUDED.status, avatar_url = EXCLUDED.avatar_url;
  END IF;
  IF reporter_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, role, status, avatar_url) VALUES
    (reporter_user_id, 'reporteruser', 'reporter', 'active', 'https://api.dicebear.com/7.x/initials/svg?seed=reporter')
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, role = EXCLUDED.role, status = EXCLUDED.status, avatar_url = EXCLUDED.avatar_url;
  END IF;
  IF test_user_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, username, role, status, avatar_url) VALUES
    (test_user_id, 'testuser', 'user', 'active', 'https://api.dicebear.com/7.x/initials/svg?seed=test')
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, role = EXCLUDED.role, status = EXCLUDED.status, avatar_url = EXCLUDED.avatar_url;
  END IF;
END $$;


-- Insert dummy posts
DO $$
DECLARE
  admin_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'adminuser' LIMIT 1);
  moderator_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'moderatoruser' LIMIT 1);
  reporter_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'reporteruser' LIMIT 1);
BEGIN
  IF admin_profile_id IS NOT NULL THEN
    INSERT INTO public.posts (title, content, author_id, moderation_status) VALUES
    ('The Future of Global Diplomacy', 'An in-depth look at how international relations are evolving in the 21st century, focusing on multilateralism and emerging powers.', admin_profile_id, 'approved')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  IF moderator_profile_id IS NOT NULL THEN
    INSERT INTO public.posts (title, content, author_id, moderation_status) VALUES
    ('Impact of Climate Change on Conflict Zones', 'Exploring the link between environmental degradation and increased conflict, with case studies from arid regions.', moderator_profile_id, 'approved')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  IF reporter_profile_id IS NOT NULL THEN
    INSERT INTO public.posts (title, content, author_id, moderation_status) VALUES
    ('Understanding Cyber Warfare Threats', 'A discussion on the growing importance of cybersecurity in national defense and the challenges of attribution in cyber attacks.', reporter_profile_id, 'pending')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Insert dummy post reactions
DO $$
DECLARE
  test_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'testuser' LIMIT 1);
  moderator_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'moderatoruser' LIMIT 1);
  post_diplomacy_id uuid := (SELECT id FROM public.posts WHERE title = 'The Future of Global Diplomacy' LIMIT 1);
  post_climate_id uuid := (SELECT id FROM public.posts WHERE title = 'Impact of Climate Change on Conflict Zones' LIMIT 1);
BEGIN
  IF test_profile_id IS NOT NULL AND post_diplomacy_id IS NOT NULL THEN
    INSERT INTO public.post_reactions (user_id, post_id, type) VALUES
    (test_profile_id, post_diplomacy_id, 'like')
    ON CONFLICT (user_id, post_id) DO NOTHING;
  END IF;
  IF moderator_profile_id IS NOT NULL AND post_diplomacy_id IS NOT NULL THEN
    INSERT INTO public.post_reactions (user_id, post_diplomacy_id, 'like') VALUES
    (moderator_profile_id, post_diplomacy_id, 'like')
    ON CONFLICT (user_id, post_id) DO NOTHING;
  END IF;
  IF moderator_profile_id IS NOT NULL AND post_climate_id IS NOT NULL THEN
    INSERT INTO public.post_reactions (user_id, post_climate_id, 'dislike') VALUES
    (moderator_profile_id, post_climate_id, 'dislike')
    ON CONFLICT (user_id, post_id) DO NOTHING;
  END IF;
END $$;

-- Insert dummy comments
DO $$
DECLARE
  test_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'testuser' LIMIT 1);
  moderator_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'moderatoruser' LIMIT 1);
  post_diplomacy_id uuid := (SELECT id FROM public.posts WHERE title = 'The Future of Global Diplomacy' LIMIT 1);
  post_climate_id uuid := (SELECT id FROM public.posts WHERE title = 'Impact of Climate Change on Conflict Zones' LIMIT 1);
BEGIN
  IF test_profile_id IS NOT NULL AND post_diplomacy_id IS NOT NULL THEN
    INSERT INTO public.comments (content, author_id, post_id) VALUES
    ('Great points on multilateralism!', test_profile_id, post_diplomacy_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  IF moderator_profile_id IS NOT NULL AND post_climate_id IS NOT NULL THEN
    INSERT INTO public.comments (content, author_id, post_id) VALUES
    ('I agree, climate change is a huge factor.', moderator_profile_id, post_climate_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Insert dummy violations
DO $$
DECLARE
  test_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'testuser' LIMIT 1);
  reporter_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'reporteruser' LIMIT 1);
  moderator_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'moderatoruser' LIMIT 1);
BEGIN
  IF test_profile_id IS NOT NULL THEN
    INSERT INTO public.violations (title, description, status, severity, reported_by_user_id) VALUES
    ('Illegal Logging in Amazon', 'Massive deforestation reported in protected areas.', 'reported', 'high', test_profile_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  IF reporter_profile_id IS NOT NULL THEN
    INSERT INTO public.violations (title, description, status, severity, reported_by_user_id) VALUES
    ('Child Labor in Mining', 'Reports of children working in dangerous conditions.', 'investigating', 'critical', reporter_profile_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  IF moderator_profile_id IS NOT NULL THEN
    INSERT INTO public.violations (title, description, status, severity, reported_by_user_id) VALUES
    ('Freedom of Speech Suppression', 'Journalists detained for critical reporting.', 'reported', 'high', moderator_profile_id)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Insert dummy UN declarations
INSERT INTO public.un_declarations (title, description, year, link) VALUES
('Universal Declaration of Human Rights', 'A milestone document in the history of human rights.', 1948, 'https://www.un.org/en/about-us/universal-declaration-of-human-rights'),
('Declaration on the Rights of Indigenous Peoples', 'Establishes a universal framework of minimum standards for the survival, dignity and well-being of the indigenous peoples of the world.', 2007, 'https://www.un.org/development/desa/indigenouspeoples/declaration-on-the-rights-of-indigenous-peoples.html'),
('Declaration on the Elimination of Violence against Women', 'Condemns violence against women and urges states to take action.', 1993, 'https://www.ohchr.org/en/instruments-mechanisms/instruments/declaration-elimination-violence-against-women')
ON CONFLICT (id) DO NOTHING;

-- Insert dummy countries
INSERT INTO public.countries (name, population, is_democracy, president, flag_emoji, regime_type) VALUES
('United States', 331000000, TRUE, 'Joe Biden', '🇺🇸', 'Presidential Republic'),
('China', 1441000000, FALSE, 'Xi Jinping', '🇨🇳', 'One-party state'),
('India', 1380000000, TRUE, 'Droupadi Murmu', '🇮🇳', 'Federal Parliamentary Republic'),
('Russia', 146000000, FALSE, 'Vladimir Putin', '🇷🇺', 'Semi-presidential Republic'),
('Brazil', 212000000, TRUE, 'Luiz Inácio Lula da Silva', '🇧🇷', 'Federal Presidential Republic')
ON CONFLICT (name) DO NOTHING;

-- Insert dummy logs
DO $$
DECLARE
  admin_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'adminuser' LIMIT 1);
  test_profile_id uuid := (SELECT id FROM public.profiles WHERE username = 'testuser' LIMIT 1);
BEGIN
  INSERT INTO public.logs (message, user_id, log_level) VALUES
  ('Application started successfully.', NULL, 'info')
  ON CONFLICT (id) DO NOTHING;
  IF admin_profile_id IS NOT NULL THEN
    INSERT INTO public.logs (message, user_id, log_level) VALUES
    ('User adminuser logged in.', admin_profile_id, 'info')
    ON CONFLICT (id) DO NOTHING;
  END IF;
  IF test_profile_id IS NOT NULL THEN
    INSERT INTO public.logs (message, user_id, log_level) VALUES
    ('New post created by testuser.', test_profile_id, 'info')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Insert dummy conflicts
INSERT INTO public.conflicts (name, region, status, severity, start_date, casualties, involved_parties, lat, lon, summary, wikipedia_url, conflict_type, countries_involved) VALUES
('Syrian Civil War', 'Middle East', 'active', 'critical', '2011-03-15', 500000, ARRAY['Syrian Government', 'Rebel Groups', 'ISIS'], 34.8021, 38.9968, 'Ongoing multi-sided armed conflict in Syria fought between the Syrian Arab Republic led by President Bashar al-Assad and various domestic and foreign forces.', 'https://en.wikipedia.org/wiki/Syrian_civil_war', 'Civil War', ARRAY['Syria']),
('War in Ukraine', 'Europe', 'active', 'critical', '2014-02-20', 100000, ARRAY['Ukraine', 'Russia'], 48.3794, 31.1656, 'An ongoing armed conflict that began in February 2014, primarily involving Russia and Ukraine.', 'https://en.wikipedia.org/wiki/Russo-Ukrainian_War', 'Interstate War', ARRAY['Ukraine', 'Russia']),
('Yemen Civil War', 'Middle East', 'active', 'high', '2014-09-19', 377000, ARRAY['Houthi Movement', 'Saudi-led Coalition'], 15.5527, 48.5164, 'An ongoing multi-sided civil war that began in late 2014, primarily fought between the Abdrabbuh Mansur Hadi-led Yemeni government and the Houthi armed movement.', 'https://en.wikipedia.org/wiki/Yemeni_Civil_War_(2014%E2%80%93present)', 'Civil War', ARRAY['Yemen', 'Saudi Arabia', 'United Arab Emirates'])
ON CONFLICT (id) DO NOTHING;