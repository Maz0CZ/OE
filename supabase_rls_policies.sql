-- RLS Policies for public.profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
CREATE POLICY "Admins can update any profile." ON public.profiles FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can delete any profile." ON public.profiles;
CREATE POLICY "Admins can delete any profile." ON public.profiles FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for public.posts
DROP POLICY IF EXISTS "Approved posts are viewable by everyone." ON public.posts;
CREATE POLICY "Approved posts are viewable by everyone." ON public.posts FOR SELECT USING (moderation_status = 'approved');

DROP POLICY IF EXISTS "Users can create posts." ON public.posts;
CREATE POLICY "Users can create posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own posts." ON public.posts;
CREATE POLICY "Authors can update their own posts." ON public.posts FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins and moderators can update any post." ON public.posts;
CREATE POLICY "Admins and moderators can update any post." ON public.posts FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));

DROP POLICY IF EXISTS "Authors can delete their own posts." ON public.posts;
CREATE POLICY "Authors can delete their own posts." ON public.posts FOR DELETE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins and moderators can delete any post." ON public.posts;
CREATE POLICY "Admins and moderators can delete any post." ON public.posts FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));

-- RLS Policies for public.post_reactions
DROP POLICY IF EXISTS "Reactions are viewable by everyone." ON public.post_reactions;
CREATE POLICY "Reactions are viewable by everyone." ON public.post_reactions FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can create their own reactions." ON public.post_reactions;
CREATE POLICY "Users can create their own reactions." ON public.post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reactions." ON public.post_reactions;
CREATE POLICY "Users can update their own reactions." ON public.post_reactions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reactions." ON public.post_reactions;
CREATE POLICY "Users can delete their own reactions." ON public.post_reactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for public.comments
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can create comments." ON public.comments;
CREATE POLICY "Users can create comments." ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update their own comments." ON public.comments;
CREATE POLICY "Authors can update their own comments." ON public.comments FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins and moderators can update any comment." ON public.comments;
CREATE POLICY "Admins and moderators can update any comment." ON public.comments FOR UPDATE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));

DROP POLICY IF EXISTS "Authors can delete their own comments." ON public.comments;
CREATE POLICY "Authors can delete their own comments." ON public.comments FOR DELETE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins and moderators can delete any comment." ON public.comments;
CREATE POLICY "Admins and moderators can delete any comment." ON public.comments FOR DELETE USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'moderator'));

-- RLS Policies for public.conflicts
DROP POLICY IF EXISTS "Conflicts are viewable by everyone." ON public.conflicts;
CREATE POLICY "Conflicts are viewable by everyone." ON public.conflicts FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins and reporters can manage conflicts." ON public.conflicts;
CREATE POLICY "Admins and reporters can manage conflicts." ON public.conflicts
    FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'))
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'));

-- RLS Policies for public.natural_disasters
DROP POLICY IF EXISTS "Natural disasters are viewable by everyone." ON public.natural_disasters;
CREATE POLICY "Natural disasters are viewable by everyone." ON public.natural_disasters FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins and reporters can manage natural disasters." ON public.natural_disasters;
CREATE POLICY "Admins and reporters can manage natural disasters." ON public.natural_disasters
    FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'))
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'));

-- RLS Policies for public.countries
DROP POLICY IF EXISTS "Countries are viewable by everyone." ON public.countries;
CREATE POLICY "Countries are viewable by everyone." ON public.countries FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins and reporters can manage countries." ON public.countries;
CREATE POLICY "Admins and reporters can manage countries." ON public.countries
    FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'))
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'));

-- RLS Policies for public.un_declarations
DROP POLICY IF EXISTS "UN declarations are viewable by everyone." ON public.un_declarations;
CREATE POLICY "UN declarations are viewable by everyone." ON public.un_declarations FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins and reporters can manage UN declarations." ON public.un_declarations;
CREATE POLICY "Admins and reporters can manage UN declarations." ON public.un_declarations
    FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'))
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'));

-- RLS Policies for public.violations
DROP POLICY IF EXISTS "Violations are viewable by everyone." ON public.violations;
CREATE POLICY "Violations are viewable by everyone." ON public.violations FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins and reporters can manage violations." ON public.violations;
CREATE POLICY "Admins and reporters can manage violations." ON public.violations
    FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'))
    WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'reporter'));

-- RLS Policies for public.logs
DROP POLICY IF EXISTS "Admins can view logs." ON public.logs;
CREATE POLICY "Admins can view logs." ON public.logs FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Anyone can insert logs." ON public.logs;
CREATE POLICY "Anyone can insert logs." ON public.logs FOR INSERT WITH CHECK (TRUE);

-- No update or delete policies for logs, as they should be immutable.