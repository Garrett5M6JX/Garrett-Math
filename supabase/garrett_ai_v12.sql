-- Garrett Math V12: cuota persistente y agregación mínima de uso de Garrett AI.
-- Migración aditiva. No elimina ni modifica tablas o políticas existentes.
create table if not exists public.garrett_ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  model text not null check (char_length(model) <= 80)
);

create index if not exists garrett_ai_usage_user_created_idx
  on public.garrett_ai_usage(user_id, created_at desc);

alter table public.garrett_ai_usage enable row level security;

drop policy if exists "garrett_ai_usage_select_own" on public.garrett_ai_usage;
create policy "garrett_ai_usage_select_own"
  on public.garrett_ai_usage for select to authenticated
  using (user_id = auth.uid());

revoke insert, update, delete on public.garrett_ai_usage from anon, authenticated;
grant select on public.garrett_ai_usage to authenticated;

create or replace function public.consume_garrett_ai_quota(
  p_max_per_minute integer default 10,
  p_max_per_day integer default 100,
  p_model text default 'configured'
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_minute_count integer;
  v_day_count integer;
begin
  if v_user_id is null then
    return false;
  end if;

  -- Serializa las solicitudes concurrentes del mismo usuario en esta transacción.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select count(*) into v_minute_count
  from public.garrett_ai_usage
  where user_id = v_user_id and created_at > now() - interval '1 minute';

  select count(*) into v_day_count
  from public.garrett_ai_usage
  where user_id = v_user_id and created_at > now() - interval '24 hours';

  if v_minute_count >= greatest(1, least(p_max_per_minute, 60))
     or v_day_count >= greatest(1, least(p_max_per_day, 1000)) then
    return false;
  end if;

  insert into public.garrett_ai_usage(user_id, model)
  values (v_user_id, left(coalesce(p_model, 'configured'), 80));

  return true;
end;
$$;

revoke all on function public.consume_garrett_ai_quota(integer, integer, text) from public, anon;
grant execute on function public.consume_garrett_ai_quota(integer, integer, text) to authenticated;

create or replace function public.get_garrett_ai_admin_stats()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'requests_24h', count(*) filter (where created_at > now() - interval '24 hours'),
    'requests_7d', count(*) filter (where created_at > now() - interval '7 days'),
    'active_users_7d', count(distinct user_id) filter (where created_at > now() - interval '7 days')
  ) into v_result
  from public.garrett_ai_usage;
  return coalesce(v_result, '{}'::jsonb);
end;
$$;
revoke all on function public.get_garrett_ai_admin_stats() from public, anon;
grant execute on function public.get_garrett_ai_admin_stats() to authenticated;
