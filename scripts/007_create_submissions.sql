-- Create submissions table
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  file_url text,
  is_late boolean default false,
  submitted_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(assignment_id, student_id)
);

alter table public.submissions enable row level security;

-- Students can see their own submissions, professors can see submissions for their class assignments
create policy "submissions_select" on public.submissions
  for select to authenticated using (
    auth.uid() = student_id or
    exists (
      select 1 from public.assignments a
      join public.classes c on c.id = a.class_id
      where a.id = assignment_id and c.professor_id = auth.uid()
    ) or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Students can insert their own submissions
create policy "submissions_insert" on public.submissions
  for insert to authenticated with check (
    auth.uid() = student_id and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'student')
  );

-- Students can update (resubmit) their own submissions
create policy "submissions_update" on public.submissions
  for update to authenticated using (
    auth.uid() = student_id
  );

-- Students can delete their own submissions
create policy "submissions_delete" on public.submissions
  for delete to authenticated using (
    auth.uid() = student_id or
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
