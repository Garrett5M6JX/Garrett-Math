-- Garrett Math V19: roles delegados y permisos administrativos.
-- Migracion aditiva. Ejecutar en Supabase SQL Editor despues de revisar el archivo.
-- admin_users conserva el rol de superadministrador existente.
create table if not exists public.gm_admin_roles (
 id text primary key, name text not null, description text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.gm_admin_role_permissions (
 role_id text not null references public.gm_admin_roles(id) on delete cascade,
 permission text not null, primary key(role_id,permission)
);
create table if not exists public.gm_admin_role_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role_id text not null references public.gm_admin_roles(id),
 assigned_by uuid references auth.users(id), created_at timestamptz not null default now()
);
insert into public.gm_admin_roles(id,name,description) values
 ('content_editor','Editor de contenido','Puede crear, editar y revisar contenido educativo.'),
 ('teacher_coordinator','Coordinador docente','Rol reservado para herramientas de docentes y aulas.'),
 ('analytics_viewer','Analista','Puede consultar informes y estadísticas.')
on conflict(id) do update set name=excluded.name,description=excluded.description;
insert into public.gm_admin_role_permissions(role_id,permission) values
 ('content_editor','content.manage'),('teacher_coordinator','teachers.manage'),('analytics_viewer','analytics.view')
on conflict do nothing;
alter table public.gm_admin_roles enable row level security;
alter table public.gm_admin_role_permissions enable row level security;
alter table public.gm_admin_role_members enable row level security;
revoke all on public.gm_admin_roles,public.gm_admin_role_permissions,public.gm_admin_role_members from anon,authenticated;
grant select on public.gm_admin_roles,public.gm_admin_role_permissions to authenticated;
drop policy if exists gm_admin_roles_read_admin on public.gm_admin_roles;
create policy gm_admin_roles_read_admin on public.gm_admin_roles for select to authenticated using ((select public.is_admin()));
drop policy if exists gm_admin_role_permissions_read_admin on public.gm_admin_role_permissions;
create policy gm_admin_role_permissions_read_admin on public.gm_admin_role_permissions for select to authenticated using ((select public.is_admin()));
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=''
as $$
 select exists(select 1 from public.admin_users au where au.user_id=(select auth.uid()))
 or exists(select 1 from public.gm_admin_role_members gm where gm.user_id=(select auth.uid()))
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
create or replace function public.has_admin_permission(p_permission text)
returns boolean language sql stable security definer set search_path=''
as $$
 select exists(select 1 from public.admin_users au where au.user_id=(select auth.uid()))
 or exists(select 1 from public.gm_admin_role_members gm join public.gm_admin_role_permissions gp on gp.role_id=gm.role_id
 where gm.user_id=(select auth.uid()) and gp.permission=p_permission)
$$;
revoke all on function public.has_admin_permission(text) from public;
grant execute on function public.has_admin_permission(text) to authenticated;
do $$
declare t text;
begin
 foreach t in array array['gm_stages','gm_grades','gm_areas','gm_units','gm_topics','gm_lessons'] loop
  execute format('drop policy if exists %I on public.%I',t||'_gm_v11_admin_write',t);
  execute format('drop policy if exists %I on public.%I',t||'_gm_v11_read_published',t);
  execute format('drop policy if exists %I on public.%I',t||'_gm_v19_read_published',t);
  execute format('create policy %I on public.%I for select to anon, authenticated using (status = ''publicado'' or (select public.has_admin_permission(''content.manage'')))',t||'_gm_v19_read_published',t);
  execute format('drop policy if exists %I on public.%I',t||'_gm_v19_content_manage',t);
  execute format('create policy %I on public.%I for all to authenticated using ((select public.has_admin_permission(''content.manage''))) with check ((select public.has_admin_permission(''content.manage'')))',t||'_gm_v19_content_manage',t);
 end loop;
end $$;
create or replace function public.gm_admin_list_members()
returns table(user_id uuid,email text,role_id text,assigned_at timestamptz)
language plpgsql security definer set search_path=''
as $$
begin
 if not exists(select 1 from public.admin_users where admin_users.user_id=(select auth.uid())) then
  raise exception 'Solo el superadministrador puede consultar los administradores delegados.';
 end if;
 return query select u.id,u.email::text,gm.role_id,gm.created_at from public.gm_admin_role_members gm
 join auth.users u on u.id=gm.user_id order by gm.created_at desc;
end;
$$;
revoke all on function public.gm_admin_list_members() from public;
grant execute on function public.gm_admin_list_members() to authenticated;
create or replace function public.gm_admin_set_member_role(p_email text,p_role_id text)
returns void language plpgsql security definer set search_path=''
as $$
declare target_id uuid;
begin
 if not exists(select 1 from public.admin_users where admin_users.user_id=(select auth.uid())) then
  raise exception 'Solo el superadministrador puede asignar roles.';
 end if;
 select id into target_id from auth.users where lower(email)=lower(trim(p_email)) limit 1;
 if target_id is null then raise exception 'No existe una cuenta con ese correo.'; end if;
 if exists(select 1 from public.admin_users where admin_users.user_id=target_id) then
  raise exception 'La cuenta superadministradora no puede convertirse en administrador delegado.';
 end if;
 if p_role_id is null or p_role_id='' then
  delete from public.gm_admin_role_members where user_id=target_id;
 else
  if not exists(select 1 from public.gm_admin_roles where id=p_role_id) then raise exception 'Rol no válido.'; end if;
  insert into public.gm_admin_role_members(user_id,role_id,assigned_by) values(target_id,p_role_id,(select auth.uid()))
  on conflict(user_id) do update set role_id=excluded.role_id,assigned_by=excluded.assigned_by,created_at=now();
 end if;
 insert into public.audit_log(actor_id,action,entity_type,entity_id,summary)
 values((select auth.uid()),case when p_role_id is null or p_role_id='' then 'admin.role_removed' else 'admin.role_assigned' end,
 'admin_user',target_id::text,case when p_role_id is null or p_role_id='' then 'Se retiró un rol administrativo.' else 'Se asignó el rol '||p_role_id||'.' end);
end;
$$;
revoke all on function public.gm_admin_set_member_role(text,text) from public;
grant execute on function public.gm_admin_set_member_role(text,text) to authenticated;
-- Las membresías no se pueden leer ni modificar directamente desde el cliente.

-- El registro de auditoría y la administración de roles quedan reservados al superadministrador.
drop policy if exists gm_v11_audit_admin_read on public.audit_log;
drop policy if exists gm_v11_audit_admin_insert on public.audit_log;
drop policy if exists gm_v19_audit_superadmin_read on public.audit_log;
drop policy if exists gm_v19_audit_superadmin_insert on public.audit_log;
create policy gm_v19_audit_superadmin_read on public.audit_log for select to authenticated
 using (exists(select 1 from public.admin_users au where au.user_id=(select auth.uid())));
create policy gm_v19_audit_superadmin_insert on public.audit_log for insert to authenticated
 with check (exists(select 1 from public.admin_users au where au.user_id=(select auth.uid())) and actor_id=(select auth.uid()));

-- Las versiones de lecciones también se reservan a quienes pueden gestionar contenido.
drop policy if exists gm_v11_versions_admin_only on public.gm_lesson_versions;
drop policy if exists gm_v19_versions_content_manage on public.gm_lesson_versions;
create policy gm_v19_versions_content_manage on public.gm_lesson_versions for all to authenticated
 using ((select public.has_admin_permission('content.manage')))
 with check ((select public.has_admin_permission('content.manage')));
