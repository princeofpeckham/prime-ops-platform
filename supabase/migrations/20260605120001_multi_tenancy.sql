-- Multi tenancy foundation.
-- Introduces organizations + memberships, adds org_id to every domain table,
-- backfills existing Appear Here data, and adds membership based access helpers.
-- The org scoped RLS rewrite lives in the next migration.

-- =========================================================
-- Enum + tables
-- =========================================================
create type public.member_role as enum ('ops', 'brandhost', 'cleaner');

create table public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create table public.memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.member_role not null,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index memberships_user_idx on public.memberships(user_id);
create index memberships_org_idx  on public.memberships(org_id);

-- =========================================================
-- Access helpers. SECURITY DEFINER so they can read memberships
-- without tripping that table's own RLS (avoids recursion).
-- =========================================================
create or replace function public.auth_org_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select org_id from public.memberships where user_id = auth.uid();
$$;

create or replace function public.auth_has_role(p_org uuid, p_role public.member_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid() and org_id = p_org and role = p_role
  );
$$;

grant execute on function public.auth_org_ids() to authenticated;
grant execute on function public.auth_has_role(uuid, public.member_role) to authenticated;

-- =========================================================
-- Seed the Appear Here organization (deterministic id so backfill is stable)
-- =========================================================
insert into public.organizations (id, name, slug)
values ('a0000000-0000-4000-8000-000000000001', 'Appear Here', 'appear-here')
on conflict (id) do nothing;

-- =========================================================
-- Add org_id to every domain table: nullable, backfill, then enforce.
-- Existing rows (18 properties, 12 vendors) backfill to Appear Here.
-- Other tables are empty on this project, so the backfill is a no op there.
-- =========================================================
do $$
declare
  ah_id uuid := 'a0000000-0000-4000-8000-000000000001';
  t text;
  tables text[] := array[
    'properties', 'bookings', 'shifts', 'shift_applications',
    'cleaning_jobs', 'condition_reports', 'condition_report_areas',
    'vendors', 'vendor_jobs', 'notifications', 'deposits'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I add column if not exists org_id uuid', t);
    execute format('update public.%I set org_id = %L where org_id is null', t, ah_id);
    execute format('alter table public.%I alter column org_id set not null', t);
    execute format(
      'alter table public.%I add constraint %I foreign key (org_id) references public.organizations(id) on delete restrict',
      t, t || '_org_id_fkey'
    );
    execute format('create index if not exists %I on public.%I(org_id)', t || '_org_idx', t);
  end loop;
end $$;

-- =========================================================
-- Memberships for the three existing users (idempotent, no op on a fresh DB)
-- =========================================================
insert into public.memberships (org_id, user_id, role)
select 'a0000000-0000-4000-8000-000000000001', u.id, 'ops'::public.member_role
from auth.users u where u.email = 'pierce.jullian@appearhere.co.uk'
on conflict (org_id, user_id) do nothing;

insert into public.memberships (org_id, user_id, role)
select 'a0000000-0000-4000-8000-000000000001', u.id, 'brandhost'::public.member_role
from auth.users u where u.email = 'pierce.jullian+pro@appearhere.co.uk'
on conflict (org_id, user_id) do nothing;

insert into public.memberships (org_id, user_id, role)
select 'a0000000-0000-4000-8000-000000000001', u.id, 'cleaner'::public.member_role
from auth.users u where u.email = 'piercejullian04@gmail.com'
on conflict (org_id, user_id) do nothing;

-- =========================================================
-- RLS for the two new tables
-- =========================================================
alter table public.organizations enable row level security;
alter table public.memberships  enable row level security;

create policy organizations_member_select on public.organizations
  for select to authenticated
  using (id in (select public.auth_org_ids()));

create policy organizations_ops_update on public.organizations
  for update to authenticated
  using (public.auth_has_role(id, 'ops'))
  with check (public.auth_has_role(id, 'ops'));

create policy memberships_self_select on public.memberships
  for select to authenticated
  using (user_id = auth.uid());

create policy memberships_ops_select on public.memberships
  for select to authenticated
  using (public.auth_has_role(org_id, 'ops'));

create policy memberships_ops_write on public.memberships
  for insert to authenticated
  with check (public.auth_has_role(org_id, 'ops'));

create policy memberships_ops_update on public.memberships
  for update to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));

create policy memberships_ops_delete on public.memberships
  for delete to authenticated
  using (public.auth_has_role(org_id, 'ops'));
