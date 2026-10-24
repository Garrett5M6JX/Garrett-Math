-- Esquema de Garrett Math alineado con src/App.tsx.
-- Si ya ejecutaste el SQL de configuración de Garrett Math, NO necesitas volver a ejecutarlo.
-- Ejecutar este archivo en un proyecto nuevo. Las políticas se recrean de forma idempotente.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 100),
  education_stage text check (education_stage is null or education_stage in ('Preescolar','Primaria','Secundaria','Universidad')),
  education_year text check (education_year is null or char_length(education_year) <= 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references auth.users(id) on delete cascade,
  display_alias text not null check (char_length(display_alias) between 1 and 100),
  education_stage text not null check (education_stage in ('Preescolar','Primaria','Secundaria','Universidad')),
  education_year text not null check (char_length(education_year) between 1 and 50),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 1 and 200),
  status text not null default 'in_progress' check (status in ('in_progress','completed')),
  score numeric(5,2) check (score is null or score between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists child_profiles_guardian_id_idx on public.child_profiles(guardian_id);
create index if not exists learning_progress_user_id_idx on public.learning_progress(user_id);

alter table public.user_profiles enable row level security;
alter table public.child_profiles enable row level security;
alter table public.learning_progress enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_select_own" on public.user_profiles for select to authenticated using (id = auth.uid());
create policy "user_profiles_insert_own" on public.user_profiles for insert to authenticated with check (id = auth.uid());
create policy "user_profiles_update_own" on public.user_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "child_profiles_select_own" on public.child_profiles;
drop policy if exists "child_profiles_insert_own" on public.child_profiles;
drop policy if exists "child_profiles_update_own" on public.child_profiles;
drop policy if exists "child_profiles_delete_own" on public.child_profiles;
create policy "child_profiles_select_own" on public.child_profiles for select to authenticated using (guardian_id = auth.uid());
create policy "child_profiles_insert_own" on public.child_profiles for insert to authenticated with check (guardian_id = auth.uid());
create policy "child_profiles_update_own" on public.child_profiles for update to authenticated using (guardian_id = auth.uid()) with check (guardian_id = auth.uid());
create policy "child_profiles_delete_own" on public.child_profiles for delete to authenticated using (guardian_id = auth.uid());

drop policy if exists "learning_progress_select_own" on public.learning_progress;
drop policy if exists "learning_progress_insert_own" on public.learning_progress;
drop policy if exists "learning_progress_update_own" on public.learning_progress;
drop policy if exists "learning_progress_delete_own" on public.learning_progress;
create policy "learning_progress_select_own" on public.learning_progress for select to authenticated using (user_id = auth.uid());
create policy "learning_progress_insert_own" on public.learning_progress for insert to authenticated with check (user_id = auth.uid());
create policy "learning_progress_update_own" on public.learning_progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "learning_progress_delete_own" on public.learning_progress for delete to authenticated using (user_id = auth.uid());
