-- Althea V41: incorporación de estudiantes mediante código y acceso al aula.
-- Requiere V23-V24 y V39. Migración aditiva; ejecutar manualmente en Supabase SQL Editor.

-- Los estudiantes solo pueden consultar las aulas a las que pertenecen.
drop policy if exists gm_v23_classrooms_read on public.gm_classrooms;
create policy gm_v23_classrooms_read on public.gm_classrooms for select to authenticated
 using (
   teacher_id=(select auth.uid())
   or exists(select 1 from public.gm_classroom_members m
     where m.classroom_id=gm_classrooms.id and m.student_id=(select auth.uid()))
   or (select public.has_admin_permission('teachers.manage'))
 );

-- El código nunca se consulta directamente desde el cliente: la función hace el emparejamiento.
create or replace function public.gm_join_classroom(p_join_code text)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare v_classroom public.gm_classrooms%rowtype;
begin
 if (select auth.uid()) is null then
   raise exception 'Debes iniciar sesión para unirte a un aula.' using errcode='42501';
 end if;
 if (select auth.jwt()->'app_metadata'->>'assigned_role')='teacher'
   or (select auth.jwt()->'user_metadata'->>'requested_role')='parent' then
   raise exception 'Esta función está disponible para cuentas de estudiante.' using errcode='42501';
 end if;
 if p_join_code is null or char_length(trim(p_join_code)) not between 6 and 16 then
   raise exception 'Introduce un código de aula válido.';
 end if;
 select * into v_classroom
 from public.gm_classrooms c
 where upper(c.join_code)=upper(trim(p_join_code))
 limit 1;
 if not found then raise exception 'No encontramos un aula con ese código.'; end if;

 insert into public.gm_classroom_members(classroom_id,student_id,added_by)
 values(v_classroom.id,(select auth.uid()),v_classroom.teacher_id)
 on conflict(classroom_id,student_id) do nothing;

 return jsonb_build_object(
   'id',v_classroom.id,'name',v_classroom.name,'stage',v_classroom.stage,
   'education_year',v_classroom.education_year,'joined',true
 );
end;
$$;
revoke all on function public.gm_join_classroom(text) from public,anon;
grant execute on function public.gm_join_classroom(text) to authenticated;

comment on function public.gm_join_classroom(text) is
 'Permite a una cuenta de estudiante unirse a un aula mediante código sin exponer códigos de otras aulas.';
