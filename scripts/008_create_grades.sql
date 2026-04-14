-- Create grades table
create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  student_id uuid not null references public.profiles(id),
  professor_id uuid not null references public.profiles(id),
  grade numeric(5,2) not null check (grade >= 0 and grade <= 100),
  feedback text,
  graded_at timestamptz default now(),
  unique(submission_id)
);

alter table public.grades enable row level security;

-- Students can see their own grades
create policy "grades_select_student" on public.grades
  for select to authenticated using (
    auth.uid() = student_id or
    auth.uid() = professor_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Professors can insert grades for submissions in their classes
create policy "grades_insert" on public.grades
  for insert to authenticated with check (
    auth.uid() = professor_id and
    exists (
      select 1 from public.submissions s
      join public.assignments a on a.id = s.assignment_id
      join public.classes c on c.id = a.class_id
      where s.id = submission_id and c.professor_id = auth.uid()
    )
  );

-- Professors can update their own grades
create policy "grades_update" on public.grades
  for update to authenticated using (
    auth.uid() = professor_id
  );

-- Professors and admins can delete grades
create policy "grades_delete" on public.grades
  for delete to authenticated using (
    auth.uid() = professor_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
