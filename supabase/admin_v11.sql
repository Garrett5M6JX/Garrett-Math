-- Garrett Math V11: esquema ADITIVO. No modifica perfiles ni learning_progress.
-- Ejecutar como postgres desde Supabase SQL Editor. No conceder admin desde el cliente.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.admin_users au where au.user_id = (select auth.uid())) $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='admin_users' and policyname='gm_v11_admin_users_read_self') then
  create policy gm_v11_admin_users_read_self on public.admin_users for select to authenticated using (user_id = (select auth.uid()));
 end if;
end $$;

create table if not exists public.gm_stages(id text primary key, name text not null, description text not null default '', sort_order integer not null default 0, status text not null default 'borrador' check(status in ('borrador','en_revision','revisado','publicado','archivado')), data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), version integer not null default 1);
create table if not exists public.gm_grades(id text primary key, stage_id text not null references public.gm_stages(id), name text not null, sort_order integer not null default 0, status text not null default 'borrador' check(status in ('borrador','en_revision','revisado','publicado','archivado')), data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), version integer not null default 1);
create table if not exists public.gm_areas(id text primary key, name text not null, description text not null default '', sort_order integer not null default 0, status text not null default 'borrador' check(status in ('borrador','en_revision','revisado','publicado','archivado')), data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), version integer not null default 1);
create table if not exists public.gm_units(id text primary key, grade_id text not null references public.gm_grades(id), area_id text not null references public.gm_areas(id), title text not null, description text not null default '', sort_order integer not null default 0, status text not null default 'borrador' check(status in ('borrador','en_revision','revisado','publicado','archivado')), data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), version integer not null default 1);
create table if not exists public.gm_topics(id text primary key, unit_id text not null references public.gm_units(id), title text not null, description text not null default '', sort_order integer not null default 0, prerequisites text[] not null default '{}', status text not null default 'borrador' check(status in ('borrador','en_revision','revisado','publicado','archivado')), data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), version integer not null default 1);
create table if not exists public.gm_lessons(id text primary key, topic_id text not null references public.gm_topics(id), title text not null, sort_order integer not null default 0, status text not null default 'borrador' check(status in ('borrador','en_revision','revisado','publicado','archivado')), data jsonb not null default '{}'::jsonb, reviewed_by uuid references auth.users(id), reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id), version integer not null default 1);
create table if not exists public.gm_lesson_versions(id bigint generated always as identity primary key, lesson_id text not null, version integer not null, snapshot jsonb not null, changed_by uuid references auth.users(id), created_at timestamptz not null default now(), unique(lesson_id,version));
create table if not exists public.audit_log(id bigint generated always as identity primary key, actor_id uuid references auth.users(id), action text not null, entity_type text not null, entity_id text, before_summary jsonb, after_summary jsonb, summary text, created_at timestamptz not null default now());

-- RLS y permisos mínimos para todas las tablas de contenido.
do $$ declare t text; begin
 foreach t in array array['gm_stages','gm_grades','gm_areas','gm_units','gm_topics','gm_lessons'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select on public.%I to anon, authenticated',t);
  execute format('grant insert, update, delete on public.%I to authenticated',t);
  if not exists(select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_gm_v11_read_published') then
   execute format('create policy %I on public.%I for select to anon, authenticated using (status = ''publicado'' or (select public.is_admin()))',t||'_gm_v11_read_published',t);
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename=t and policyname=t||'_gm_v11_admin_write') then
   execute format('create policy %I on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',t||'_gm_v11_admin_write',t);
  end if;
 end loop;
 alter table public.gm_lesson_versions enable row level security;
 revoke all on public.gm_lesson_versions from anon, authenticated;
 grant select, insert on public.gm_lesson_versions to authenticated;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='gm_lesson_versions' and policyname='gm_v11_versions_admin_only') then
  create policy gm_v11_versions_admin_only on public.gm_lesson_versions for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
 end if;
 alter table public.audit_log enable row level security;
 revoke all on public.audit_log from anon, authenticated;
 grant select, insert on public.audit_log to authenticated;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='audit_log' and policyname='gm_v11_audit_admin_read') then create policy gm_v11_audit_admin_read on public.audit_log for select to authenticated using ((select public.is_admin())); end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='audit_log' and policyname='gm_v11_audit_admin_insert') then create policy gm_v11_audit_admin_insert on public.audit_log for insert to authenticated with check ((select public.is_admin()) and actor_id=(select auth.uid())); end if;
end $$;

-- Semilla manual del primer admin: sustituye el correo por el correo confirmado de tu cuenta.
-- Ejecuta esta consulta DESPUÉS de crear la cuenta e iniciar sesión al menos una vez.
-- select id, email from auth.users where lower(email)=lower('TU_CORREO_ADMIN@EJEMPLO.COM');
-- insert into public.admin_users(user_id) select id from auth.users where lower(email)=lower('TU_CORREO_ADMIN@EJEMPLO.COM') on conflict do nothing;
