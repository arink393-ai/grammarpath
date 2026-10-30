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
