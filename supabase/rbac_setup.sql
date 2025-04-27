-- 1. Create the profiles table
-- Stores user-specific data like roles, linked to the authentication user.
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add comment explaining the table's purpose
COMMENT ON TABLE public.profiles IS 'Stores user profile information, including roles for RBAC.';
COMMENT ON COLUMN public.profiles.id IS 'References the user''s ID from auth.users.';
COMMENT ON COLUMN public.profiles.role IS 'User role for access control (e.g., admin, editor).';


-- 2. Create the trigger function
-- Automatically inserts a new row into public.profiles when a new user signs up in auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Allows the function to run with the permissions of the definer, necessary to insert into public.profiles
SET search_path = public -- Ensures the function operates within the public schema
AS $$
BEGIN
  -- Insert a new profile entry for the newly created user.
  -- The user's ID is taken from the NEW record (the row being inserted into auth.users).
  -- The role defaults to 'editor' as defined in the profiles table schema.
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW; -- The result is ignored in an AFTER trigger, but it's standard practice.
END;
$$;

-- Add comment explaining the function's purpose
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry for new users upon signup.';


-- 3. Create the trigger
-- Attaches the handle_new_user function to the auth.users table.
-- It fires after a new user row is inserted.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comment explaining the trigger's purpose
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'When a user signs up via Supabase Auth, create a corresponding profile entry.';


-- 4. (Optional but Recommended) Enable RLS and add basic policies for profiles
-- Enable Row Level Security on the new table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (you might want to restrict which columns they can update later)
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Note: Policies for admins to manage roles or specific RLS for the 'deport' table
-- based on these roles are separate steps not included in this initial setup.