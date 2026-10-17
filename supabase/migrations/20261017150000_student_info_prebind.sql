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
