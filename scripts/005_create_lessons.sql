-- Create lessons table
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  description text,
  lesson_date timestamptz not null,
  created_at timestamptz default now()
);

alter table public.lessons enable row level security;

-- Enrolled students and class professor can read lessons
create policy "lessons_select" on public.lessons
  for select to authenticated using (
    exists (
      select 1 from public.classes where id = class_id and professor_id = auth.uid()
    ) or
    exists (
      select 1 from public.enrollments where class_id = lessons.class_id and student_id = auth.uid()
    ) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Professor of the class can create lessons
create policy "lessons_insert" on public.lessons
  for insert to authenticated with check (
    exists (
      select 1 from public.classes where id = class_id and professor_id = auth.uid()
    )
  );

-- Professor can update their class lessons
create policy "lessons_update" on public.lessons
  for update to authenticated using (
    exists (
      select 1 from public.classes where id = class_id and professor_id = auth.uid()
    )
  );

-- Professor can delete their class lessons
create policy "lessons_delete" on public.lessons
  for delete to authenticated using (
    exists (
      select 1 from public.classes where id = class_id and professor_id = auth.uid()
    ) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
