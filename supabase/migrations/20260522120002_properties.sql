-- properties: master list of all Appear Here spaces.

create table public.properties (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null unique,
  address              text not null,
  postcode             text,
  tier                 public.property_tier not null,
  status               public.property_status not null default 'active',
  keynest_instructions text,
  cleaning_rate_pence  integer not null default 15000 check (cleaning_rate_pence >= 0),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index properties_status_idx on public.properties(status);
create index properties_tier_idx   on public.properties(tier);

create trigger properties_set_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

alter table public.properties enable row level security;
