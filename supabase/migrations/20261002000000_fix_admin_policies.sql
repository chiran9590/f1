-- HealthMaps: fix RLS recursion, lock down role changes, align columns.
-- Run in Supabase -> SQL Editor (safe to run more than once).

-- 1. Columns the app expects ------------------------------------------------
alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists club_id uuid references public.clubs(id) on delete set null;
alter table public.profiles add column if not exists created_at timestamptz default now();

-- 2. Helper functions (SECURITY DEFINER => they read profiles without triggering RLS) -----
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_club_id()
returns uuid language sql security definer stable set search_path = public as $$
  select club_id from public.profiles where id = auth.uid();
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_club_id() to authenticated;

-- 3. Remove every existing policy on these tables, then recreate cleanly ---------------
do $$
declare p record;
begin
  for p in select policyname, tablename from pg_policies
           where schemaname = 'public'
             and tablename in ('profiles','clubs','tiles','metadata','image_analyses')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

alter table public.profiles       enable row level security;
alter table public.clubs          enable row level security;
alter table public.tiles          enable row level security;
alter table public.metadata       enable row level security;
alter table public.image_analyses enable row level security;

-- profiles
create policy "profiles_select_own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles for select using (public.is_admin());
create policy "profiles_insert_own"   on public.profiles for insert
  with check (auth.uid() = id and role = 'client' and club_id is null);
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update using (public.is_admin());
create policy "profiles_delete_admin" on public.profiles for delete using (public.is_admin());

-- clubs: everyone signed in can read (clients need their club name); only admins change
create policy "clubs_select_all"   on public.clubs for select using (auth.uid() is not null);
create policy "clubs_admin_write"  on public.clubs for all using (public.is_admin()) with check (public.is_admin());

-- tiles / metadata: admins everything; clients only read their own club
create policy "tiles_admin_all"     on public.tiles for all using (public.is_admin()) with check (public.is_admin());
create policy "tiles_client_read"   on public.tiles for select using (club_id = public.my_club_id());
create policy "metadata_admin_all"  on public.metadata for all using (public.is_admin()) with check (public.is_admin());
create policy "metadata_client_read" on public.metadata for select using (club_id = public.my_club_id());

-- image_analyses
create policy "analyses_select_own"   on public.image_analyses for select using (user_id = auth.uid());
create policy "analyses_insert_own"   on public.image_analyses for insert with check (user_id = auth.uid());
create policy "analyses_select_admin" on public.image_analyses for select using (public.is_admin());

-- 4. Stop normal users from promoting themselves or changing their own club ------------------
create or replace function public.protect_profile_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for service-role / SQL-editor changes: allowed.
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role or new.club_id is distinct from old.club_id then
      raise exception 'Only an admin can change role or club';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists protect_profile_columns on public.profiles;
create trigger protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_columns();
