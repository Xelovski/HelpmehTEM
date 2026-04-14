-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'student' check (role in ('student', 'professor', 'admin')),
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- All authenticated users can read profiles
create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);

-- Users can update their own profile
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Users can insert their own profile (for trigger)
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- Admins can update any profile
create policy "profiles_admin_update" on public.profiles
  for update to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Admins can delete any profile
create policy "profiles_admin_delete" on public.profiles
  for delete to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
