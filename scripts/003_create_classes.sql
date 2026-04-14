-- Create classes table
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  professor_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.classes enable row level security;

-- All authenticated users can read classes
create policy "classes_select_all" on public.classes
  for select to authenticated using (true);

-- Professors can create classes
create policy "classes_insert_professor" on public.classes
  for insert to authenticated with check (
    auth.uid() = professor_id and
    exists (select 1 from public.profiles where id = auth.uid() and role in ('professor', 'admin'))
  );

-- Professors can update their own classes
create policy "classes_update_own" on public.classes
  for update to authenticated using (
    auth.uid() = professor_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Professors can delete their own classes, admins can delete any
create policy "classes_delete_own" on public.classes
  for delete to authenticated using (
    auth.uid() = professor_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
