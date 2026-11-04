-- Garrett Math V23–V24: aulas/docentes y estadísticas de plataforma.
-- Migración aditiva. Revisar y ejecutar manualmente en Supabase SQL Editor.
-- Requiere las tablas base de schema.sql, admin_v11.sql y la función has_admin_permission de V19.

create table if not exists public.gm_classrooms (
 id uuid primary key default gen_random_uuid(),
 teacher_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(trim(name)) between 2 and 100),
 stage text not null check (stage in ('Preescolar','Primaria','Secundaria','Universidad')),
 education_year text not null check (char_length(trim(education_year)) between 1 and 50),
 join_code text not null unique,
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists gm_classrooms_teacher_idx on public.gm_classrooms(teacher_id,created_at desc);

create table if not exists public.gm_classroom_members (
 classroom_id uuid not null references public.gm_classrooms(id) on delete cascade,
 student_id uuid not null references auth.users(id) on delete cascade,
 added_by uuid references auth.users(id),
 joined_at timestamptz not null default now(),
 primary key(classroom_id,student_id)
);
create index if not exists gm_classroom_members_student_idx on public.gm_classroom_members(student_id);

alter table public.gm_classrooms enable row level security;
alter table public.gm_classroom_members enable row level security;
revoke all on public.gm_classrooms,public.gm_classroom_members from anon,authenticated;
grant select,insert,update,delete on public.gm_classrooms,public.gm_classroom_members to authenticated;

drop policy if exists gm_v23_classrooms_read on public.gm_classrooms;
create policy gm_v23_classrooms_read on public.gm_classrooms for select to authenticated
 using (teacher_id=(select auth.uid()) or (select public.has_admin_permission('teachers.manage')));
drop policy if exists gm_v23_classrooms_insert on public.gm_classrooms;
create policy gm_v23_classrooms_insert on public.gm_classrooms for insert to authenticated
 with check (
   (teacher_id=(select auth.uid()) and (auth.jwt()->'app_metadata'->>'assigned_role')='teacher')
   or (select public.has_admin_permission('teachers.manage'))
 );
drop policy if exists gm_v23_classrooms_update on public.gm_classrooms;
create policy gm_v23_classrooms_update on public.gm_classrooms for update to authenticated
 using (teacher_id=(select auth.uid()) or (select public.has_admin_permission('teachers.manage')))
 with check (teacher_id=(select auth.uid()) or (select public.has_admin_permission('teachers.manage')));
drop policy if exists gm_v23_classrooms_delete on public.gm_classrooms;
create policy gm_v23_classrooms_delete on public.gm_classrooms for delete to authenticated
 using (teacher_id=(select auth.uid()) or (select public.has_admin_permission('teachers.manage')));

drop policy if exists gm_v23_members_read on public.gm_classroom_members;
create policy gm_v23_members_read on public.gm_classroom_members for select to authenticated
 using (student_id=(select auth.uid()) or exists(
  select 1 from public.gm_classrooms c where c.id=classroom_id
  and (c.teacher_id=(select auth.uid()) or (select public.has_admin_permission('teachers.manage')))
 ));
drop policy if exists gm_v23_members_manage on public.gm_classroom_members;
create policy gm_v23_members_manage on public.gm_classroom_members for all to authenticated
 using (exists(select 1 from public.gm_classrooms c where c.id=classroom_id
  and (c.teacher_id=(select auth.uid()) or (select public.has_admin_permission('teachers.manage')))))
 with check (exists(select 1 from public.gm_classrooms c where c.id=classroom_id
  and (c.teacher_id=(select auth.uid()) or (select public.has_admin_permission('teachers.manage')))));

create or replace function public.gm_admin_list_teachers()
returns table(user_id uuid,email text,display_name text,classroom_count bigint)
language plpgsql security definer set search_path=''
as $$
begin
 if not coalesce(public.has_admin_permission('teachers.manage'),false) then
  raise exception 'not authorized' using errcode='42501';
 end if;
 return query
 select u.id,u.email::text,coalesce(p.display_name,u.email)::text,count(c.id)
 from auth.users u
 left join public.user_profiles p on p.id=u.id
 left join public.gm_classrooms c on c.teacher_id=u.id
 where u.raw_app_meta_data->>'assigned_role'='teacher'
 group by u.id,u.email,p.display_name
 order by coalesce(p.display_name,u.email);
end;
$$;
revoke all on function public.gm_admin_list_teachers() from public,anon;
grant execute on function public.gm_admin_list_teachers() to authenticated;

create or replace function public.gm_admin_create_classroom(
 p_teacher_id uuid,p_name text,p_stage text,p_education_year text
)
returns uuid
language plpgsql security definer set search_path=''
as $$
declare v_id uuid;
begin
 if not coalesce(public.has_admin_permission('teachers.manage'),false) then
  raise exception 'not authorized' using errcode='42501';
 end if;
 if not exists(select 1 from auth.users u where u.id=p_teacher_id and u.raw_app_meta_data->>'assigned_role'='teacher') then
  raise exception 'La cuenta seleccionada no tiene el rol docente.';
 end if;
 if p_stage not in ('Preescolar','Primaria','Secundaria','Universidad') then
  raise exception 'Etapa educativa no válida.';
 end if;
 insert into public.gm_classrooms(teacher_id,name,stage,education_year,join_code,created_by)
 values(p_teacher_id,trim(p_name),p_stage,trim(p_education_year),upper(substr(encode(gen_random_bytes(6),'hex'),1,8)),(select auth.uid()))
 returning id into v_id;
 insert into public.audit_log(actor_id,action,entity_type,entity_id,summary)
 values((select auth.uid()),'classroom.created','classroom',v_id::text,'Aula creada para un docente.');
 return v_id;
end;
$$;
revoke all on function public.gm_admin_create_classroom(uuid,text,text,text) from public,anon;
grant execute on function public.gm_admin_create_classroom(uuid,text,text,text) to authenticated;

create or replace function public.gm_admin_get_platform_stats()
returns jsonb
language plpgsql security definer set search_path=''
as $$
declare v_result jsonb;
begin
 if not coalesce(public.has_admin_permission('analytics.view'),false) then
  raise exception 'not authorized' using errcode='42501';
 end if;
 select jsonb_build_object(
  'users',(select count(*) from public.user_profiles),
  'families',(select count(*) from public.child_profiles),
  'progress_records',(select count(*) from public.learning_progress),
  'completed_lessons',(select count(*) from public.learning_progress where status='completed'),
  'teachers',(select count(*) from auth.users where raw_app_meta_data->>'assigned_role'='teacher'),
  'classrooms',(select count(*) from public.gm_classrooms),
  'published_lessons',(select count(*) from public.gm_lessons where status='publicado'),
  'draft_lessons',(select count(*) from public.gm_lessons where status in ('borrador','en_revision','revisado'))
 ) into v_result;
 return v_result;
end;
$$;
revoke all on function public.gm_admin_get_platform_stats() from public,anon;
grant execute on function public.gm_admin_get_platform_stats() to authenticated;
