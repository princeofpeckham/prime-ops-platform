-- vendors directory and vendor_jobs pipeline.

create table public.vendors (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null unique,
  trade              public.trade_type not null,
  contact_name       text,
  contact_email      text,
  contact_phone      text,
  coverage_area      text,
  avg_response_hours real,
  avg_delivery_days  real,
  quality_rating     real check (quality_rating between 0 and 5),
  total_jobs         integer not null default 0 check (total_jobs >= 0),
  total_spend_pence  bigint  not null default 0 check (total_spend_pence >= 0),
  is_approved        boolean not null default false,
  notes              text,
  created_at         timestamptz not null default now()
);

create index vendors_trade_idx    on public.vendors(trade);
create index vendors_approved_idx on public.vendors(is_approved) where is_approved = true;

alter table public.vendors enable row level security;

-- vendor_jobs: signage, repairs, deep cleans, etc. Auto created from damage flags.

create table public.vendor_jobs (
  id                  uuid primary key default gen_random_uuid(),
  property_id         uuid not null references public.properties(id) on delete restrict,
  condition_report_id uuid references public.condition_reports(id) on delete set null,
  vendor_id           uuid references public.vendors(id) on delete set null,
  title               text not null,
  description         text,
  trade               public.trade_type not null,
  status              public.vendor_job_status not null default 'draft',
  quote_amount_pence  integer check (quote_amount_pence is null or quote_amount_pence >= 0),
  actual_amount_pence integer check (actual_amount_pence is null or actual_amount_pence >= 0),
  chase_count         integer not null default 0 check (chase_count >= 0),
  last_chased_at      timestamptz,
  due_date            date,
  completed_at        timestamptz,
  photos              text[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index vendor_jobs_status_idx   on public.vendor_jobs(status);
create index vendor_jobs_vendor_idx   on public.vendor_jobs(vendor_id);
create index vendor_jobs_property_idx on public.vendor_jobs(property_id);
create index vendor_jobs_due_idx      on public.vendor_jobs(due_date) where status not in ('completed', 'disputed');

create trigger vendor_jobs_set_updated_at
before update on public.vendor_jobs
for each row execute function public.set_updated_at();

alter table public.vendor_jobs enable row level security;
