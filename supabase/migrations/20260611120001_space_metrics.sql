-- Historical space performance: one row per property per calendar month.
-- Booked days + TTV come from the occupancy reporting (initially imported from
-- the V3 Occupancy sheet; later refreshed by the Looker ingestion). Occupancy
-- percent is computed at read time from days in the month, never stored.

create table public.space_metrics (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  property_id  uuid not null references public.properties(id) on delete cascade,
  month        date not null,                 -- first day of the month
  booked_days  integer not null default 0 check (booked_days >= 0),
  ttv_pence    bigint not null default 0 check (ttv_pence >= 0),
  source       text not null default 'import',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (org_id, property_id, month)
);

create index space_metrics_org_idx      on public.space_metrics(org_id);
create index space_metrics_property_idx on public.space_metrics(property_id, month);

create trigger space_metrics_set_updated_at
before update on public.space_metrics
for each row execute function public.set_updated_at();

alter table public.space_metrics enable row level security;

create policy space_metrics_ops_all on public.space_metrics
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));
