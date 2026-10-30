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

-- 每日單字（vocab/）的進度表另見 supabase/vocab.sql（也可直接執行那個檔）

-- Account and grading protections (also shipped as an incremental migration).
-- Protect privileged fields without changing existing students or submissions.
begin;
create schema if not exists grammarpath_private;
revoke all on schema grammarpath_private from public;

-- Profiles are provisioned by handle_new_user; clients may only rename themselves.
revoke insert, update, delete on public.profiles from anon, authenticated;
-- Also remove any old explicit column grants.
do $$ declare c text; begin
  for c in select column_name from information_schema.columns
    where table_schema='public' and table_name='profiles'
  loop
    execute format('revoke insert (%I), update (%I) on public.profiles from anon, authenticated', c, c);
  end loop;
end $$;
grant update (name) on public.profiles to authenticated;
drop policy if exists p_profiles_insert on public.profiles;
drop policy if exists p_profiles_update on public.profiles;
create policy p_profiles_update on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Row ownership still applies. A trigger additionally protects teacher-only columns.
create or replace function grammarpath_private.protect_submission_fields()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if current_user not in ('authenticated', 'anon') then return new; end if;
  if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
  if tg_op = 'UPDATE' and
     (new.id is distinct from old.id or new.user_id is distinct from old.user_id
      or new.assignment_id is distinct from old.assignment_id) then
    raise exception 'Submission identity cannot be changed' using errcode='42501';
  end if;
  if public.is_teacher() then return new; end if;
  if new.user_id is distinct from auth.uid() then
    raise exception 'Cannot submit for another student' using errcode='42501';
  end if;
  if tg_op = 'INSERT' then
    if new.grade is not null or new.feedback is not null or new.graded_at is not null
       or new.status is distinct from 'submitted' then
      raise exception 'Only teachers may grade submissions' using errcode='42501';
    end if;
  else
    if (new.grade is not null and new.grade is distinct from old.grade)
       or (new.feedback is not null and new.feedback is distinct from old.feedback)
       or (new.graded_at is not null and new.graded_at is distinct from old.graded_at)
       or (new.status is distinct from 'submitted' and new.status is distinct from old.status) then
      raise exception 'Only teachers may grade submissions' using errcode='42501';
    end if;
    -- Older clients send graded_at:null when re-submitting. Keep existing teacher feedback.
    new.grade := old.grade;
    new.feedback := old.feedback;
    new.graded_at := old.graded_at;
  end if;
  return new;
end $$;
revoke all on function grammarpath_private.protect_submission_fields() from public;
drop trigger if exists protect_submission_fields on public.submissions;
create trigger protect_submission_fields before insert or update on public.submissions
  for each row execute function grammarpath_private.protect_submission_fields();
drop policy if exists p_sub_insert on public.submissions;
drop policy if exists p_sub_update on public.submissions;
create policy p_sub_insert on public.submissions for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy p_sub_update on public.submissions for update to authenticated
  using ((select auth.uid()) = user_id or public.is_teacher())
  with check ((select auth.uid()) = user_id or public.is_teacher());
commit;

-- ============================================================
-- 作業 2.0：分組、指定對象／範圍、開放日、自主繳交（同 migrations/20261016120000_homework_groups_scope.sql）
-- ============================================================
-- 作業：指定範圍、指定學生／分組、開放日期；錄音可不指定作業直接繳交
-- 只新增表與欄位，不動既有資料。
begin;

-- ---------- 學生分組 ----------
create table if not exists public.student_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (length(trim(name)) between 1 and 60),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz default now()
);
create table if not exists public.group_members (
  group_id uuid not null references public.student_groups(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  primary key (group_id, user_id)
);
create index if not exists group_members_user_idx on public.group_members(user_id);
alter table public.student_groups enable row level security;
alter table public.group_members  enable row level security;

drop policy if exists p_groups_read  on public.student_groups;
drop policy if exists p_groups_write on public.student_groups;
create policy p_groups_read  on public.student_groups for select to authenticated
  using (public.is_teacher() or exists(select 1 from public.group_members m where m.group_id = student_groups.id and m.user_id = (select auth.uid())));
create policy p_groups_write on public.student_groups for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists p_gm_read  on public.group_members;
drop policy if exists p_gm_write on public.group_members;
create policy p_gm_read  on public.group_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
create policy p_gm_write on public.group_members for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

-- ---------- 作業：對象、範圍、開放日 ----------
alter table public.assignments add column if not exists target_students uuid[] not null default '{}';
alter table public.assignments add column if not exists target_groups   uuid[] not null default '{}';
alter table public.assignments add column if not exists scope           jsonb  not null default '[]'::jsonb;
alter table public.assignments add column if not exists start_date      date;

-- 這份作業是不是給目前登入的學生？（兩個陣列都空＝全班）
create or replace function public.assignment_for_me(ts uuid[], tg uuid[])
returns boolean language sql stable security definer set search_path = public as $$
  select (coalesce(cardinality(ts),0) = 0 and coalesce(cardinality(tg),0) = 0)
      or (select auth.uid()) = any(ts)
      or exists(select 1 from public.group_members m where m.user_id = (select auth.uid()) and m.group_id = any(tg));
$$;
revoke all on function public.assignment_for_me(uuid[], uuid[]) from public;
grant execute on function public.assignment_for_me(uuid[], uuid[]) to authenticated;

drop policy if exists p_assign_read on public.assignments;
create policy p_assign_read on public.assignments for select to authenticated
  using (public.is_teacher() or (
    active
    and (start_date is null or start_date <= (now() at time zone 'Asia/Taipei')::date)
    and public.assignment_for_me(target_students, target_groups)));

-- ---------- 自主繳交（不指定作業的錄音等） ----------
-- assignment_id 本來就可為 null；unique(assignment_id,user_id) 對 null 不衝突，所以可交多份。
alter table public.submissions add column if not exists kind   text;   -- 'readaloud' | 'recording' | null
alter table public.submissions add column if not exists source jsonb;  -- 例：{"reading":"id","level":"b","title":"…"}
create index if not exists submissions_free_idx on public.submissions(submitted_at desc) where assignment_id is null;

-- 學生只能交給「看得到」的作業（自主繳交 assignment_id 為 null 不受限）
create or replace function public.can_submit_to(aid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select aid is null or exists(
    select 1 from public.assignments a where a.id = aid and a.active
      and public.assignment_for_me(a.target_students, a.target_groups));
$$;
revoke all on function public.can_submit_to(uuid) from public;
grant execute on function public.can_submit_to(uuid) to authenticated;

drop policy if exists p_sub_insert on public.submissions;
create policy p_sub_insert on public.submissions for insert to authenticated
  with check ((select auth.uid()) = user_id and public.can_submit_to(assignment_id));

commit;

-- ============================================================
-- 學生基本資料（同 migrations/20261017090000_student_info.sql）
-- ============================================================
-- 學生基本資料（家教用）：年級、學校、家長聯絡方式、上課時間…
-- 只有老師能讀寫；學生本人也看不到（含家長電話等個資）。
begin;

create table if not exists public.student_info (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  grade       text check (grade is null or length(grade) <= 20),       -- 例：國二、高一、成人
  school      text check (school is null or length(school) <= 80),
  class_name  text check (class_name is null or length(class_name) <= 40),   -- 班級，例：205
  birthday    date,
  parent_name text check (parent_name is null or length(parent_name) <= 40),
  contact     text check (contact is null or length(contact) <= 120),  -- 電話／LINE
  schedule    text check (schedule is null or length(schedule) <= 120), -- 上課時間，例：週三 19:00–20:30
  start_date  date,                                                     -- 開始上課日
  textbook    text check (textbook is null or length(textbook) <= 120),
  goals       text check (goals is null or length(goals) <= 500),
  notes       text check (notes is null or length(notes) <= 2000),
  updated_at  timestamptz default now()
);

alter table public.student_info enable row level security;
drop policy if exists p_student_info_teacher on public.student_info;
create policy p_student_info_teacher on public.student_info for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

commit;

-- ============================================================
-- 先建檔、之後再綁帳號（同 migrations/20261017150000_student_info_prebind.sql）
-- ============================================================
-- 先建檔、之後再綁帳號：student_info 可以沒有 user_id（還沒註冊的家教學生）
-- 學生用老師登記的 email 註冊時自動綁定；老師也可在後台手動綁定／解除。
begin;

alter table public.student_info add column if not exists id uuid default gen_random_uuid();
update public.student_info set id = gen_random_uuid() where id is null;
alter table public.student_info alter column id set not null;
alter table public.student_info drop constraint if exists student_info_pkey;
alter table public.student_info add constraint student_info_pkey primary key (id);
alter table public.student_info alter column user_id drop not null;
alter table public.student_info drop constraint if exists student_info_user_id_key;
alter table public.student_info add constraint student_info_user_id_key unique (user_id);
alter table public.student_info add column if not exists name  text check (name  is null or length(name)  <= 40);
alter table public.student_info add column if not exists email text check (email is null or length(email) <= 120);
alter table public.student_info drop constraint if exists student_info_name_or_user;
alter table public.student_info add constraint student_info_name_or_user check (user_id is not null or length(trim(coalesce(name,''))) > 0);
create index if not exists student_info_unbound_email_idx on public.student_info (lower(email)) where user_id is null;

-- 新學生註冊（profiles 建立）時，用 email 找還沒綁定的檔案自動綁上
create or replace function grammarpath_private.bind_student_info()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email is null or exists(select 1 from public.student_info where user_id = new.id) then
    return new;
  end if;
  update public.student_info si set user_id = new.id, updated_at = now()
   where si.id = (select x.id from public.student_info x
                   where x.user_id is null and x.email is not null and lower(trim(x.email)) = lower(trim(new.email))
                   order by x.updated_at desc nulls last limit 1);
  return new;
end $$;
revoke all on function grammarpath_private.bind_student_info() from public;
drop trigger if exists bind_student_info on public.profiles;
create trigger bind_student_info after insert on public.profiles
  for each row when (new.role = 'student') execute function grammarpath_private.bind_student_info();

commit;

-- homework bucket: 單檔上限 30 MB（2026-10-27 設定）
update storage.buckets set file_size_limit = 31457280 where id = 'homework';

-- ============================================================
-- 老師可刪除繳交／檔案／學生帳號、名單封存（同 migrations/20261030100000_teacher_delete.sql）
-- ============================================================
-- 老師可以刪除：繳交（含批改）、作業的上傳檔案、學生帳號；學生名單可「封存」（可還原）
-- 學生自己仍然不能刪除任何繳交。
begin;

-- 1. 繳交：只有老師能刪（刪作業會連帶刪掉繳交，那個本來就有 on delete cascade）
drop policy if exists p_sub_delete on public.submissions;
create policy p_sub_delete on public.submissions for delete to authenticated
  using (public.is_teacher());

-- 2. 作業檔案／錄音（Storage）：老師可刪；學生仍然只能新增與覆蓋自己資料夾的檔案
drop policy if exists p_hw_delete on storage.objects;
create policy p_hw_delete on storage.objects for delete to authenticated
  using (bucket_id = 'homework' and public.is_teacher());

-- 3. 名單封存：封存的學生從預設名單隱藏（帳號與資料都還在，可隨時還原）
alter table public.student_info add column if not exists archived_at timestamptz;

-- 4. 永久刪除學生帳號：只有老師、只能刪角色是 student 的帳號（不能刪老師）。
--    auth.users 刪除後，profiles / progress / submissions / vocab_progress / group_members / student_info 會一起連帶刪除。
create or replace function public.delete_student_account(target uuid)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_teacher() then raise exception '只有老師可以刪除學生帳號' using errcode = '42501'; end if;
  if target is null or not exists(select 1 from public.profiles where id = target and role = 'student') then
    raise exception '找不到這個學生帳號（或對方是老師，不能刪除）' using errcode = 'P0002';
  end if;
  delete from auth.users where id = target;
end $$;
revoke all on function public.delete_student_account(uuid) from public;
grant execute on function public.delete_student_account(uuid) to authenticated;

commit;
