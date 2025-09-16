-- Enable Row Level Security for the 'profiles' table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to insert their own profile
CREATE POLICY "Allow authenticated users to insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create a policy that allows authenticated users to view their own profile
CREATE POLICY "Allow authenticated users to view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a policy that allows authenticated users to update their own profile
CREATE POLICY "Allow authenticated users to update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);