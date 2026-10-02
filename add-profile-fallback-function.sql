-- Migration script to add profile fallback function
-- Run this in Supabase SQL Editor if tables already exist

-- ---------------------------------------------------------------------------
-- 1. Drop problematic policies that cause recursion
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- ---------------------------------------------------------------------------
-- 2. Create fallback function for manual profile creation (bypasses RLS)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_profile_fallback(
    user_id UUID,
    p_full_name TEXT,
    p_email TEXT,
    p_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Temporarily disable RLS for this operation
    SET LOCAL row_security = off;
    
    INSERT INTO public.profiles (id, full_name, email, role, club_name)
    VALUES (user_id, p_full_name, p_email, p_role, NULL)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = NOW();
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Grant execute permission on the fallback function
-- ---------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.create_profile_fallback TO authenticated;
