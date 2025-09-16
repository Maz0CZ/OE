-- RLS Policy for 'profiles' table
-- Allows authenticated users to insert their own profile upon registration.
CREATE POLICY "Allow authenticated users to insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- You might also want policies for SELECT and UPDATE for users to manage their own profiles:
CREATE POLICY "Allow authenticated users to view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);
WITH CHECK (auth.uid() = id);