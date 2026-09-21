-- ============================================================
--  English Cat Island — Supabase backend
--  Teacher dashboard + student progress sync + homework hand-in
--
--  HOW TO USE
--  1. Create a free project at https://supabase.com  (Region: pick one near Taiwan, e.g. Singapore)
--  2. Open the project → SQL Editor → New query
--  3. Paste this WHOLE file and click "Run"
--  4. Tell the system which email is the teacher (run BEFORE you register):
--         insert into public.teacher_emails(email) values ('YOUR_TEACHER_EMAIL')
--           on conflict do nothing;
--     That email becomes a teacher automatically the moment it registers.
--  5. Auth → Providers → Email: turn OFF "Confirm email"
--     so students can log in immediately without checking mail.
--  6. Send me the Project URL and the anon public key
--     (Project Settings → API). The anon key is safe to put in the site.
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  role       text not null default 'student',   -- 'student' | 'teacher'
  created_at timestamptz default now()
);

-- One row per student: a mirror of the in-app game store, plus a few
-- broken-out numbers so the teacher dashboard can sort/scan quickly.
create table if not exists public.progress (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  xp              int  default 0,
  cans            int  default 0,
  streak          int  default 0,
  completed_count int  default 0,
  data            jsonb default '{}'::jsonb,     -- full store.data (completed, journal, dailyQuests, fedCats, mistakes…)
  last_active     timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists public.assignments (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  due_date    date,
  active      boolean default true,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now()
);

create table if not exists public.submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assignments(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  text          text,          -- typed answer
  file_url      text,          -- storage path of an uploaded file
  link          text,          -- pasted link (Google Doc / cloud drive)
  status        text default 'submitted',   -- 'submitted' | 'returned'
  grade         text,          -- teacher's mark, free text (e.g. "A", "90", "很棒")
  feedback      text,          -- teacher's comment
  submitted_at  timestamptz default now(),
  graded_at     timestamptz,
  unique(assignment_id, user_id)
);

-- Emails listed here become teachers automatically on sign-up.
create table if not exists public.teacher_emails (
  email text primary key
);
alter table public.teacher_emails enable row level security;  -- no policies: only SECURITY DEFINER functions can read it

-- ---------- Teacher check (SECURITY DEFINER avoids RLS recursion) ----------

create or replace function public.is_teacher()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'teacher');
$$;

-- ---------- Auto-create a profile row when a student signs up ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    case when exists(select 1 from public.teacher_emails t where lower(t.email) = lower(new.email))
         then 'teacher' else 'student' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------

alter table public.profiles    enable row level security;
alter table public.progress    enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;

-- profiles: read own (or teacher reads all); write own
drop policy if exists p_profiles_read   on public.profiles;
drop policy if exists p_profiles_insert on public.profiles;
drop policy if exists p_profiles_update on public.profiles;
create policy p_profiles_read   on public.profiles for select using (auth.uid() = id or public.is_teacher());
create policy p_profiles_insert on public.profiles for insert with check (auth.uid() = id);
create policy p_profiles_update on public.profiles for update using (auth.uid() = id);

-- progress: read own (or teacher reads all); write own
drop policy if exists p_progress_read   on public.progress;
drop policy if exists p_progress_insert on public.progress;
drop policy if exists p_progress_update on public.progress;
create policy p_progress_read   on public.progress for select using (auth.uid() = user_id or public.is_teacher());
create policy p_progress_insert on public.progress for insert with check (auth.uid() = user_id);
create policy p_progress_update on public.progress for update using (auth.uid() = user_id);

-- assignments: any signed-in student sees active ones; teacher does everything
drop policy if exists p_assign_read  on public.assignments;
drop policy if exists p_assign_write on public.assignments;
create policy p_assign_read  on public.assignments for select to authenticated using (active or public.is_teacher());
create policy p_assign_write on public.assignments for all    to authenticated using (public.is_teacher()) with check (public.is_teacher());

-- submissions: student reads/writes own; teacher reads all and can grade
drop policy if exists p_sub_read   on public.submissions;
drop policy if exists p_sub_insert on public.submissions;
drop policy if exists p_sub_update on public.submissions;
create policy p_sub_read   on public.submissions for select using (auth.uid() = user_id or public.is_teacher());
create policy p_sub_insert on public.submissions for insert with check (auth.uid() = user_id);
create policy p_sub_update on public.submissions for update using (auth.uid() = user_id or public.is_teacher());

-- ---------- Storage bucket for homework files ----------

insert into storage.buckets (id, name, public)
values ('homework', 'homework', false)
on conflict (id) do nothing;

-- files are stored under  <user_id>/<filename>
drop policy if exists p_hw_upload on storage.objects;
drop policy if exists p_hw_read   on storage.objects;
drop policy if exists p_hw_update on storage.objects;
create policy p_hw_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'homework' and auth.uid()::text = (storage.foldername(name))[1]);
create policy p_hw_update on storage.objects for update to authenticated
  using (bucket_id = 'homework' and auth.uid()::text = (storage.foldername(name))[1]);
create policy p_hw_read on storage.objects for select to authenticated
  using (bucket_id = 'homework' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_teacher()));

-- ============================================================
--  Done. Remember step 4 (make yourself a teacher) and step 5
--  (turn off email confirmation).
-- ============================================================
