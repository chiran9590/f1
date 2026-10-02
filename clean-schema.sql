-- Clean Schema for HealthMaps
-- This script drops everything and creates a clean, working schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- ---------------------------------------------------------------------------
-- 1. Drop all existing objects (clean slate)
-- ---------------------------------------------------------------------------

-- Drop all policies on all tables
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Drop all tables
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.golf_clubs CASCADE;
DROP TABLE IF EXISTS public.club_assignments CASCADE;
DROP TABLE IF EXISTS public.map_tiles CASCADE;
DROP TABLE IF EXISTS public.analysis_jobs CASCADE;
DROP TABLE IF EXISTS public.upload_sessions CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.system_settings CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.log_activity CASCADE;

-- Drop types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.analysis_status CASCADE;
DROP TYPE IF EXISTS public.tile_status CASCADE;

-- ---------------------------------------------------------------------------
-- 2. Create clean profiles table with correct schema
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    golf_course TEXT,
    role TEXT DEFAULT 'client',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. Enable RLS and create simple policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 4. Create trigger to auto-create profile on user signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, golf_course, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
        NEW.raw_user_meta_data->>'golf_course',
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        golf_course = EXCLUDED.golf_course,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5. Create updated_at trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 6. Backfill existing users (if any)
-- ---------------------------------------------------------------------------

INSERT INTO public.profiles (id, full_name, email, role, golf_course, phone)
SELECT
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', 'Unknown'),
    u.email,
    COALESCE(u.raw_user_meta_data->>'role', 'client'),
    u.raw_user_meta_data->>'golf_course',
    u.raw_user_meta_data->>'phone'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7. Grant permissions
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
