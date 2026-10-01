-- Run inside a transaction after the migration. Fixtures never leave this transaction.
insert into auth.users(id,email,raw_user_meta_data) values
 ('bc1473c2-1274-46be-a8de-0d67a4450101','gp-permissions-student@example.invalid','{"name":"Permission test"}'),
 ('bc1473c2-1274-46be-a8de-0d67a4450102','gp-permissions-teacher@example.invalid','{"name":"Permission test"}');
update public.profiles set role='teacher' where id='bc1473c2-1274-46be-a8de-0d67a4450102';
insert into public.assignments(id,title) values ('bc1473c2-1274-46be-a8de-0d67a4450103','Transactional permission test');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"bc1473c2-1274-46be-a8de-0d67a4450101","role":"authenticated"}',true);
do $$ begin
 update public.profiles set name='Renamed' where id=auth.uid();
 if not found then raise exception 'Name update failed'; end if;
 begin
  update public.profiles set role='teacher' where id=auth.uid();
  raise exception 'Student could promote themselves';
 exception when insufficient_privilege then null; end;
 begin
  update public.profiles set email='other@example.invalid' where id=auth.uid();
  raise exception 'Student could change protected email';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.submissions(assignment_id,user_id,grade) values ('bc1473c2-1274-46be-a8de-0d67a4450103',auth.uid(),'100');
  raise exception 'Student could insert a grade';
 exception when insufficient_privilege then null; end;
 insert into public.submissions(assignment_id,user_id,text) values ('bc1473c2-1274-46be-a8de-0d67a4450103',auth.uid(),'First hand-in');
 begin
  update public.submissions set feedback='Forged feedback' where user_id=auth.uid();
  raise exception 'Student could edit feedback';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"bc1473c2-1274-46be-a8de-0d67a4450102","role":"authenticated"}',true);
do $$ begin
 update public.submissions set grade='80',feedback='Teacher feedback',graded_at=now(),status='graded'
 where user_id='bc1473c2-1274-46be-a8de-0d67a4450101';
 if not found then raise exception 'Teacher could not grade'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"bc1473c2-1274-46be-a8de-0d67a4450101","role":"authenticated"}',true);
do $$ begin
 insert into public.submissions(assignment_id,user_id,text,status,graded_at)
 values ('bc1473c2-1274-46be-a8de-0d67a4450103',auth.uid(),'Resubmitted','submitted',null)
 on conflict (assignment_id,user_id) do update set text=excluded.text,status=excluded.status,graded_at=excluded.graded_at;
 if not exists(select 1 from public.submissions where user_id=auth.uid() and grade='80' and feedback='Teacher feedback' and graded_at is not null and text='Resubmitted') then
  raise exception 'Resubmit lost teacher grade'; end if;
 begin
  update public.submissions set user_id='bc1473c2-1274-46be-a8de-0d67a4450102' where user_id=auth.uid();
  raise exception 'Student could reassign submission';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.submissions(assignment_id,user_id,text) values ('bc1473c2-1274-46be-a8de-0d67a4450103','bc1473c2-1274-46be-a8de-0d67a4450102','Forged');
  raise exception 'Student could submit for someone else';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
