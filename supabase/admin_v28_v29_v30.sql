-- Garrett Math V28–V29: configuración global y reglas administrativas.
-- Migración aditiva; revisar y ejecutar manualmente en Supabase SQL Editor.
-- Requiere admin_v11.sql y la función public.is_admin() de superadministrador.

create table if not exists public.gm_platform_settings (
 setting_key text primary key check (setting_key in (
  'platform.name','platform.announcement','learning.default_stage','security.session_idle_minutes'
 )),
 setting_value jsonb not null,
 description text,
 updated_by uuid references auth.users(id),
 updated_at timestamptz not null default now()
);
alter table public.gm_platform_settings enable row level security;
revoke all on public.gm_platform_settings from anon,authenticated;
grant select,insert,update,delete on public.gm_platform_settings to authenticated;
drop policy if exists gm_platform_settings_admin_all on public.gm_platform_settings;
create policy gm_platform_settings_admin_all on public.gm_platform_settings
 for all to authenticated using ((select public.is_admin()))
 with check ((select public.is_admin()));

create table if not exists public.gm_admin_automation_rules (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(trim(name)) between 3 and 80),
 event_type text not null check (event_type in ('lesson.submitted','classroom.created','user.registered')),
 action_type text not null check (action_type in ('notify_admin','create_review_task','generate_report')),
 config jsonb not null default '{}'::jsonb,
 enabled boolean not null default false check (enabled=false),
 created_by uuid references auth.users(id),
 created_at timestamptz not null default now()
);
create index if not exists gm_admin_automation_rules_created_idx
 on public.gm_admin_automation_rules(created_at desc);
alter table public.gm_admin_automation_rules enable row level security;
revoke all on public.gm_admin_automation_rules from anon,authenticated;
grant select,insert,delete on public.gm_admin_automation_rules to authenticated;
drop policy if exists gm_admin_automation_rules_admin_all on public.gm_admin_automation_rules;
create policy gm_admin_automation_rules_admin_all on public.gm_admin_automation_rules
 for all to authenticated using ((select public.is_admin()))
 with check ((select public.is_admin()));

-- Las reglas se crean siempre como borrador y enabled queda forzado a false.
-- No se instala pg_cron, no se ejecutan tareas y no se crean workers en esta migración.
