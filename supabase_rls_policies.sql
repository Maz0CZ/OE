-- Enable RLS for 'conflicts' table and allow authenticated users to read
ALTER TABLE public.conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read conflicts"
ON public.conflicts FOR SELECT
TO authenticated
USING (true);

-- Enable RLS for 'violations' table and allow authenticated users to read
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read violations"
ON public.violations FOR SELECT
TO authenticated
USING (true);

-- Enable RLS for 'un_declarations' table and allow authenticated users to read
ALTER TABLE public.un_declarations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read un_declarations"
ON public.un_declarations FOR SELECT
TO authenticated
USING (true);

-- Enable RLS for 'countries' table and allow authenticated users to read
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read countries"
ON public.countries FOR SELECT
TO authenticated
USING (true);

-- Enable RLS for 'logs' table and allow authenticated users to read
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read logs"
ON public.logs FOR SELECT
TO authenticated
USING (true);

-- Enable RLS for 'posts' table and allow authenticated users to read
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read posts"
ON public.posts FOR SELECT
TO authenticated
USING (true);

-- Enable RLS for 'post_reactions' table and allow authenticated users to read
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read post_reactions"
ON public.post_reactions FOR SELECT
TO authenticated
USING (true);

-- Enable RLS for 'profiles' table and allow authenticated users to read
-- This is important for displaying usernames and avatars of other users in the forum and comments.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);