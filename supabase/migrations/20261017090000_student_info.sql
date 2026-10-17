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
