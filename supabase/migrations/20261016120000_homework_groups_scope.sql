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
