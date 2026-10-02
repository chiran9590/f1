-- HealthMaps Fresh Supabase Schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- ---------------------------------------------------------------------------
-- 1. Profiles table (linked to Supabase Auth)
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    role TEXT DEFAULT 'client',
    club_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. Golf clubs table (for admin to manage clubs)
-- ---------------------------------------------------------------------------

CREATE TABLE public.golf_clubs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    r2_bucket_path TEXT, -- Path in Cloudflare R2 for this club's tiles/metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 3. Map tiles table (for tile map functionality)
-- ---------------------------------------------------------------------------

CREATE TABLE public.map_tiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    club_id UUID REFERENCES public.golf_clubs(id) ON DELETE CASCADE,
    tile_x INTEGER NOT NULL,
    tile_y INTEGER NOT NULL,
    tile_url TEXT,
    health_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, tile_x, tile_y)
);

-- ---------------------------------------------------------------------------
-- 4. Enable RLS and create policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to bypass RLS for profile creation
CREATE POLICY "Service role can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all profiles (for club assignment)
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

ALTER TABLE public.golf_clubs ENABLE ROW LEVEL SECURITY;

-- Admins can manage golf clubs
CREATE POLICY "Admins can manage golf clubs" ON public.golf_clubs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

ALTER TABLE public.map_tiles ENABLE ROW LEVEL SECURITY;

-- Admins can manage map tiles
CREATE POLICY "Admins can manage map tiles" ON public.map_tiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can view tiles for their assigned club
CREATE POLICY "Users can view own club tiles" ON public.map_tiles
    FOR SELECT USING (
        club_id IN (
            SELECT id FROM public.golf_clubs
            WHERE name = (
                SELECT club_name FROM public.profiles
                WHERE id = auth.uid()
            )
        )
    );

-- ---------------------------------------------------------------------------
-- 5. Create trigger to auto-create profile on user signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, club_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
        NEW.email,
        'client',
        NULL -- club_name is null at signup
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5.5. Create fallback function for manual profile creation (bypasses RLS)
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
    INSERT INTO public.profiles (id, full_name, email, role, club_name)
    VALUES (user_id, p_full_name, p_email, p_role, NULL)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        role = EXCLUDED.role,
        updated_at = NOW();
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 6. Create updated_at trigger
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

CREATE TRIGGER handle_golf_clubs_updated_at
    BEFORE UPDATE ON public.golf_clubs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_map_tiles_updated_at
    BEFORE UPDATE ON public.map_tiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 7. Grant permissions
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.golf_clubs TO authenticated;
GRANT ALL ON public.golf_clubs TO service_role;
GRANT SELECT ON public.map_tiles TO authenticated;
GRANT ALL ON public.map_tiles TO service_role;

-- Grant execute permission on the fallback function
GRANT EXECUTE ON FUNCTION public.create_profile_fallback TO authenticated;

-- ---------------------------------------------------------------------------
-- 8. Insert default admin user (you'll need to set this manually after signup)
-- ---------------------------------------------------------------------------

-- After you create your admin account via the app, run this to make them admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- ---------------------------------------------------------------------------
-- 9. Insert sample golf clubs (optional)
-- ---------------------------------------------------------------------------

INSERT INTO public.golf_clubs (name, location) VALUES
    ('Pebble Beach Golf Links', 'Pebble Beach, California'),
    ('Augusta National Golf Club', 'Augusta, Georgia'),
    ('St Andrews Links', 'St Andrews, Scotland')
ON CONFLICT (name) DO NOTHING;
