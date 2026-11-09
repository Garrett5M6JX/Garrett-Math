-- Althea V39: tareas, entregas y calificación docente.
-- Migración aditiva. Ejecutar manualmente en Supabase SQL Editor después de V23-V24.
-- No concede roles, no cambia aulas existentes y no usa service_role desde el navegador.

create table if not exists public.gm_assignments (
 id uuid primary key default gen_random_uuid(),
 classroom_id uuid not null references public.gm_classrooms(id) on delete cascade,
 teacher_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(trim(title)) between 3 and 140),
 instructions text not null default '' check (char_length(instructions) <= 10000),
 stage text not null check (stage in ('Preescolar','Primaria','Secundaria','Universidad')),
 education_year text not null check (char_length(trim(education_year)) between 1 and 50),
 lesson_ids text[] not null default '{}',
 due_at timestamptz,
 status text not null default 'draft' check (status in ('draft','published','closed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint gm_assignments_lesson_ids_count check (cardinality(lesson_ids) <= 100),
 constraint gm_assignments_classroom_stage check (
   exists (select 1 from public.gm_classrooms c where c.id=classroom_id and c.teacher_id=teacher_id
     and c.stage=stage and c.education_year=education_year)
 )
);
create index if not exists gm_assignments_classroom_status_idx
 on public.gm_assignments(classroom_id,status,created_at desc);
create index if not exists gm_assignments_teacher_idx
 on public.gm_assignments(teacher_id,created_at desc);

create table if not exists public.gm_assignment_submissions (
 id uuid primary key default gen_random_uuid(),
 assignment_id uuid not null references public.gm_assignments(id) on delete cascade,
 student_id uuid not null references auth.users(id) on delete cascade,
 response jsonb not null default '{}'::jsonb,
 submitted_at timestamptz not null default now(),
 score numeric(5,2) check (score is null or score between 0 and 100),
 feedback text check (feedback is null or char_length(feedback) <= 5000),
 graded_by uuid references auth.users(id),
 graded_at timestamptz,
 unique(assignment_id,student_id),
 constraint gm_assignment_grade_pair check (
   (score is null and graded_by is null and graded_at is null)
   or (score is not null and graded_by is not null and graded_at is not null)
 ),
 constraint gm_assignment_response_object check (jsonb_typeof(response)='object' and pg_column_size(response) <= 32768)
);
create index if not exists gm_assignment_submissions_student_idx
 on public.gm_assignment_submissions(student_id,submitted_at desc);
create index if not exists gm_assignment_submissions_assignment_idx
 on public.gm_assignment_submissions(assignment_id,submitted_at desc);

alter table public.gm_assignments enable row level security;
alter table public.gm_assignment_submissions enable row level security;
revoke all on public.gm_assignments,public.gm_assignment_submissions from anon,authenticated;
grant select,insert,update,delete on public.gm_assignments to authenticated;
grant select on public.gm_assignment_submissions to authenticated;

drop policy if exists gm_assignments_read_scoped on public.gm_assignments;
create policy gm_assignments_read_scoped on public.gm_assignments for select to authenticated
 using (
   teacher_id=(select auth.uid())
   or (select public.has_admin_permission('teachers.manage'))
   or (status='published' and exists (
     select 1 from public.gm_classroom_members m
     where m.classroom_id=gm_assignments.classroom_id and m.student_id=(select auth.uid())
   ))
 );
drop policy if exists gm_assignments_teacher_insert on public.gm_assignments;
create policy gm_assignments_teacher_insert on public.gm_assignments for insert to authenticated
 with check (
   teacher_id=(select auth.uid())
   and (select auth.jwt()->'app_metadata'->>'assigned_role')='teacher'
   and exists(select 1 from public.gm_classrooms c where c.id=classroom_id
     and c.teacher_id=(select auth.uid()) and c.stage=stage and c.education_year=education_year)
 );
drop policy if exists gm_assignments_teacher_update on public.gm_assignments;
create policy gm_assignments_teacher_update on public.gm_assignments for update to authenticated
 using (teacher_id=(select auth.uid()) or (select public.has_admin_permission('teachers.manage')))
 with check (
   (teacher_id=(select auth.uid()) and exists(select 1 from public.gm_classrooms c where c.id=classroom_id
     and c.teacher_id=(select auth.uid()) and c.stage=stage and c.education_year=education_year))
   or (select public.has_admin_permission('teachers.manage'))
 );
drop policy if exists gm_assignments_teacher_delete on public.gm_assignments;
create policy gm_assignments_teacher_delete on public.gm_assignments for delete to authenticated
 using (teacher_id=(select auth.uid()) or (select public.has_admin_permission('teachers.manage')));

drop policy if exists gm_assignment_submissions_read_scoped on public.gm_assignment_submissions;
create policy gm_assignment_submissions_read_scoped on public.gm_assignment_submissions for select to authenticated
 using (
   student_id=(select auth.uid())
   or exists(select 1 from public.gm_assignments a where a.id=assignment_id
     and (a.teacher_id=(select auth.uid()) or (select public.has_admin_permission('teachers.manage'))))
 );

-- El alumno solo puede enviar/actualizar su propia entrega a través de esta función.
-- No puede cambiar su nota ni feedback mediante escritura directa en la tabla.
create or replace function public.gm_submit_assignment(p_assignment_id uuid,p_response jsonb)
returns uuid language plpgsql security definer set search_path=''
as $$
declare v_submission_id uuid; v_assignment public.gm_assignments%rowtype;
begin
 if (select auth.uid()) is null then raise exception 'Debes iniciar sesión.' using errcode='42501'; end if;
 if p_response is null or jsonb_typeof(p_response)<>'object' or pg_column_size(p_response)>32768 then
   raise exception 'La respuesta debe ser un objeto JSON de hasta 32 KB.';
 end if;
 select * into v_assignment from public.gm_assignments where id=p_assignment_id for update;
 if not found or v_assignment.status<>'published' then raise exception 'La tarea no está disponible.'; end if;
 if v_assignment.due_at is not null and v_assignment.due_at<now() then raise exception 'El plazo de entrega ha terminado.'; end if;
 if not exists(select 1 from public.gm_classroom_members m
   where m.classroom_id=v_assignment.classroom_id and m.student_id=(select auth.uid())) then
   raise exception 'No perteneces a esta aula.' using errcode='42501';
 end if;
 insert into public.gm_assignment_submissions(assignment_id,student_id,response,submitted_at)
 values(p_assignment_id,(select auth.uid()),p_response,now())
 on conflict(assignment_id,student_id) do update
 set response=excluded.response,submitted_at=excluded.submitted_at
 where public.gm_assignment_submissions.score is null
 returning id into v_submission_id;
 if v_submission_id is null then raise exception 'La entrega ya fue calificada y no puede modificarse.'; end if;
 return v_submission_id;
end;
$$;
revoke all on function public.gm_submit_assignment(uuid,jsonb) from public,anon;
grant execute on function public.gm_submit_assignment(uuid,jsonb) to authenticated;

-- Solo el docente propietario del aula (o administración autorizada) puede calificar.
create or replace function public.gm_grade_assignment_submission(
 p_submission_id uuid,p_score numeric,p_feedback text default null
)
returns void language plpgsql security definer set search_path=''
as $$
declare v_teacher uuid;
begin
 if (select auth.uid()) is null then raise exception 'Debes iniciar sesión.' using errcode='42501'; end if;
 if p_score is null or p_score<0 or p_score>100 then raise exception 'La calificación debe estar entre 0 y 100.'; end if;
 if p_feedback is not null and char_length(p_feedback)>5000 then raise exception 'La retroalimentación supera 5000 caracteres.'; end if;
 select a.teacher_id into v_teacher
 from public.gm_assignment_submissions s join public.gm_assignments a on a.id=s.assignment_id
 where s.id=p_submission_id;
 if v_teacher is null or not (
   v_teacher=(select auth.uid()) and (select auth.jwt()->'app_metadata'->>'assigned_role')='teacher'
   or (select public.has_admin_permission('teachers.manage'))
 ) then raise exception 'No tienes permiso para calificar esta entrega.' using errcode='42501'; end if;
 update public.gm_assignment_submissions
 set score=p_score,feedback=p_feedback,graded_by=(select auth.uid()),graded_at=now()
 where id=p_submission_id;
end;
$$;
revoke all on function public.gm_grade_assignment_submission(uuid,numeric,text) from public,anon;
grant execute on function public.gm_grade_assignment_submission(uuid,numeric,text) to authenticated;

comment on table public.gm_assignments is 'Tareas creadas por docentes y asociadas a un aula existente.';
comment on table public.gm_assignment_submissions is 'Entregas privadas por estudiante; las calificaciones solo se modifican mediante RPC autorizada.';
