-- Phase D: one-off maintenance jobs (painting, collection, repairs) that the
-- ops team schedules onto the calendar. Can originate from a property_flag and
-- can be assigned to a vendor or an internal person. Org scoped, ops managed.

create type public.maintenance_status as enum (
  'unscheduled', 'scheduled', 'in_progress', 'completed', 'cancelled'
);

create table public.maintenance_jobs (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id) on delete cascade,
  property_id      uuid not null references public.properties(id) on delete restrict,
  property_flag_id uuid references public.property_flags(id) on delete set null,
  title            text not null,
  description      text,
  trade            public.trade_type,
  status           public.maintenance_status not null default 'unscheduled',
  scheduled_date   date,
  time_window      text,
  vendor_id        uuid references public.vendors(id) on delete set null,
  assigned_to      uuid references auth.users(id) on delete set null,
  notes            text,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index maintenance_jobs_org_idx       on public.maintenance_jobs(org_id);
create index maintenance_jobs_status_idx    on public.maintenance_jobs(org_id, status);
create index maintenance_jobs_property_idx  on public.maintenance_jobs(property_id);
create index maintenance_jobs_scheduled_idx on public.maintenance_jobs(scheduled_date) where scheduled_date is not null;

create trigger maintenance_jobs_set_updated_at
before update on public.maintenance_jobs
for each row execute function public.set_updated_at();

alter table public.maintenance_jobs enable row level security;

create policy maintenance_jobs_ops_all on public.maintenance_jobs
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));
