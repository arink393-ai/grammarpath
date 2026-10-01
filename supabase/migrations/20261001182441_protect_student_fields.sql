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
