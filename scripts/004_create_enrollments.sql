-- Create enrollments table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  enrolled_at timestamptz default now(),
  unique(student_id, class_id)
);

alter table public.enrollments enable row level security;

-- Students can see their own enrollments
create policy "enrollments_select_own" on public.enrollments
  for select to authenticated using (
    auth.uid() = student_id or
    exists (
      select 1 from public.classes where id = class_id and professor_id = auth.uid()
    ) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Students can enroll themselves
create policy "enrollments_insert_student" on public.enrollments
  for insert to authenticated with check (
    auth.uid() = student_id and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'student')
  );

-- Students can unenroll themselves
create policy "enrollments_delete_own" on public.enrollments
  for delete to authenticated using (
    auth.uid() = student_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
