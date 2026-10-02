-- HealthMaps Final Schema
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- ---------------------------------------------------------------------------
-- 1. CLUBS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.clubs (
  id uuid primary key default gen_random_uuid(),
  club_name text not null unique,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 2. PROFILES (extends Supabase auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('admin', 'client')) default 'client',
  club_id uuid references clubs(id) default null,  -- set only by admin
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 3. TILES (Cloudflare R2 map tile uploads, scoped by club)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tiles (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  file_name text not null,
  file_path text not null,       -- R2 object key/path
  file_size bigint,
  uploaded_by uuid references auth.users(id),
  uploaded_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 4. METADATA (Cloudflare R2 metadata uploads, scoped by club)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.metadata (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  file_name text not null,
  file_path text not null,       -- R2 object key/path
  file_size bigint,
  uploaded_by uuid references auth.users(id),
  uploaded_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 5. IMAGE ANALYSES (results from the "Analyze Images" feature, both roles)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.image_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  club_id uuid references clubs(id),
  image_name text not null,
  result jsonb,                  -- model output, structure TBD when model details arrive
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- 6. Indexes for club-scoped lookups
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_tiles_club_id ON public.tiles(club_id);
CREATE INDEX IF NOT EXISTS idx_metadata_club_id ON public.metadata(club_id);
CREATE INDEX IF NOT EXISTS idx_profiles_club_id ON public.profiles(club_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_user_id ON public.image_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analyses_club_id ON public.image_analyses(club_id);

-- ---------------------------------------------------------------------------
-- 7. Enable RLS and create policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

-- Admins can manage clubs
CREATE POLICY "Admins can manage clubs" ON public.clubs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

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

ALTER TABLE public.tiles ENABLE ROW LEVEL SECURITY;

-- Admins can manage tiles
CREATE POLICY "Admins can manage tiles" ON public.tiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can view tiles for their assigned club
CREATE POLICY "Users can view own club tiles" ON public.tiles
    FOR SELECT USING (
        club_id IN (
            SELECT club_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

ALTER TABLE public.metadata ENABLE ROW LEVEL SECURITY;

-- Admins can manage metadata
CREATE POLICY "Admins can manage metadata" ON public.metadata
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can view metadata for their assigned club
CREATE POLICY "Users can view own club metadata" ON public.metadata
    FOR SELECT USING (
        club_id IN (
            SELECT club_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

ALTER TABLE public.image_analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own analyses
CREATE POLICY "Users can view own analyses" ON public.image_analyses
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses" ON public.image_analyses
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all analyses
CREATE POLICY "Admins can view all analyses" ON public.image_analyses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ---------------------------------------------------------------------------
-- 8. Create trigger to auto-create profile on user signup
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role, club_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
        NEW.email,
        'client',
        NULL -- club_id is null at signup
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 9. Create fallback function for manual profile creation (bypasses RLS)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.create_profile_fallback(
    user_id UUID,
    p_name TEXT,
    p_email TEXT,
    p_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    SET LOCAL row_security = off;
    
    INSERT INTO public.profiles (id, name, email, role, club_id)
    VALUES (user_id, p_name, p_email, p_role, NULL)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        role = EXCLUDED.role;
END;
$$;

-- ---------------------------------------------------------------------------
-- 10. Grant permissions
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clubs TO authenticated;
GRANT ALL ON public.clubs TO service_role;
GRANT SELECT ON public.tiles TO authenticated;
GRANT ALL ON public.tiles TO service_role;
GRANT SELECT ON public.metadata TO authenticated;
GRANT ALL ON public.metadata TO service_role;
GRANT SELECT, INSERT ON public.image_analyses TO authenticated;
GRANT ALL ON public.image_analyses TO service_role;

GRANT EXECUTE ON FUNCTION public.create_profile_fallback TO authenticated;

-- ---------------------------------------------------------------------------
-- 11. Insert sample golf clubs (optional)
-- ---------------------------------------------------------------------------

INSERT INTO public.clubs (club_name) VALUES
    ('Pebble Beach Golf Links'),
    ('Augusta National Golf Club'),
    ('St Andrews Links')
ON CONFLICT (club_name) DO NOTHING;
