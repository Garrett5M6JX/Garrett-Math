-- BORRADOR DE DISEÑO PARA REVISIÓN. No aplicar en producción sin adaptar y probar.
-- La autorización final debe derivarse de auth.uid() y políticas RLS, no de datos enviados por el cliente.
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  role text not null check (role in ('student', 'teacher', 'parent')),
  education_stage text check (education_stage in ('Preescolar', 'Primaria', 'Secundaria', 'Universidad')),
  education_year text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.user_profiles(id) on delete cascade,
  display_alias text not null check (char_length(display_alias) between 1 and 100),
  education_stage text not null check (education_stage in ('Preescolar', 'Primaria', 'Secundaria', 'Universidad')),
  education_year text not null,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
alter table public.child_profiles enable row level security;

-- Cada usuario puede leer/editar solo su perfil. El rol no debe poder elevarse por sí solo;
-- en producción se recomienda proteger role con una función/trigger controlado o claims emitidos
-- por servidor y restringir cambios de rol mediante políticas adicionales.
create policy "read own profile" on public.user_profiles
  for select to authenticated using (id = auth.uid());
create policy "insert own profile" on public.user_profiles
  for insert to authenticated with check (id = auth.uid());
create policy "update own profile fields" on public.user_profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "guardian manages own child profiles" on public.child_profiles
  for all to authenticated
  using (guardian_id = auth.uid())
  with check (guardian_id = auth.uid());

-- Antes de producción: restringir cambios de role, comprobar que guardian_id corresponde
-- a una cuenta representante autorizada, diseñar consentimiento y auditar todas las políticas.
