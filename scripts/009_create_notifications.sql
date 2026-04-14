-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

-- Users can only see their own notifications
create policy "notifications_select_own" on public.notifications
  for select to authenticated using (auth.uid() = user_id);

-- Any authenticated user can insert notifications (for system use)
create policy "notifications_insert" on public.notifications
  for insert to authenticated with check (true);

-- Users can update (mark as read) their own notifications
create policy "notifications_update_own" on public.notifications
  for update to authenticated using (auth.uid() = user_id);

-- Users can delete their own notifications
create policy "notifications_delete_own" on public.notifications
  for delete to authenticated using (auth.uid() = user_id);
