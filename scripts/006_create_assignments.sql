-- Create assignments table
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  description text,
  deadline timestamptz not null,
  created_at timestamptz default now()
);

alter table public.assignments enable row level security;

-- Enrolled students and class professor can read assignments
create policy "assignments_select" on public.assignments
  for select to authenticated using (
    exists (
      select 1 from public.classes where id = class_id and professor_id = auth.uid()
    ) or
    exists (
      select 1 from public.enrollments where class_id = assignments.class_id and student_id = auth.uid()
    ) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Professor can create assignments for their classes
create policy "assignments_insert" on public.assignments
  for insert to authenticated with check (
    exists (
      select 1 from public.classes where id = class_id and professor_id = auth.uid()
    )
  );

-- Professor can update their class assignments
create policy "assignments_update" on public.assignments
  for update to authenticated using (
    exists (
      select 1 from public.classes where id = class_id and professor_id = auth.uid()
    )
  );

-- Professor can delete their class assignments
create policy "assignments_delete" on public.assignments
  for delete to authenticated using (
    exists (
      select 1 from public.classes where id = class_id and professor_id = auth.uid()
    ) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
