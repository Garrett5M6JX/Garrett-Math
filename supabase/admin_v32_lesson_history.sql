-- Garrett Math V32: historial automático de versiones de lecciones.
-- Migración ADITIVA. Revisar y ejecutar manualmente en Supabase SQL Editor.
-- No altera roles, permisos existentes ni las políticas de contenido.

create table if not exists public.gm_lesson_versions (
 id bigint generated always as identity primary key,
 lesson_id text not null,
 version integer not null,
 snapshot jsonb not null,
 changed_by uuid references auth.users(id),
 created_at timestamptz not null default now(),
 unique(lesson_id,version)
);

alter table public.gm_lesson_versions enable row level security;
revoke all on public.gm_lesson_versions from anon,authenticated;
grant select,insert on public.gm_lesson_versions to authenticated;

drop policy if exists gm_v32_versions_content_manage on public.gm_lesson_versions;
create policy gm_v32_versions_content_manage on public.gm_lesson_versions
 for all to authenticated
 using ((select public.has_admin_permission('content.manage')))
 with check ((select public.has_admin_permission('content.manage')));

create index if not exists gm_lesson_versions_lesson_created_idx
 on public.gm_lesson_versions(lesson_id,created_at desc);

create or replace function public.gm_capture_lesson_revision()
returns trigger
language plpgsql
security invoker
set search_path=''
as $$
begin
 if (to_jsonb(old)-'updated_at'-'updated_by'-'version')
    is distinct from
    (to_jsonb(new)-'updated_at'-'updated_by'-'version') then
  insert into public.gm_lesson_versions(lesson_id,version,snapshot,changed_by)
  values(old.id,coalesce(old.version,1),to_jsonb(old),(select auth.uid()))
  on conflict(lesson_id,version) do nothing;
  new.version:=coalesce(old.version,1)+1;
  new.updated_at:=now();
  new.updated_by:=(select auth.uid());
 else
  new.version:=coalesce(old.version,1);
 end if;
 return new;
end;
$$;

drop trigger if exists gm_lessons_capture_revision on public.gm_lessons;
create trigger gm_lessons_capture_revision
 before update on public.gm_lessons
 for each row execute function public.gm_capture_lesson_revision();

-- La primera versión histórica aparece después del primer cambio real posterior a V32.
-- Las versiones previas a la instalación del trigger no pueden reconstruirse retroactivamente.
