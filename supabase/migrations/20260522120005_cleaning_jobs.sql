-- cleaning_jobs: pre-clean (before check-in), post-clean (after check-out).

create table public.cleaning_jobs (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid not null references public.bookings(id) on delete cascade,
  property_id         uuid not null references public.properties(id) on delete restrict,
  type                public.cleaning_job_type not null,
  date                date not null,
  time_window         text,
  status              public.cleaning_job_status not null default 'pending',
  assigned_cleaner_id uuid references auth.users(id) on delete set null,
  rate_pence          integer not null default 15000 check (rate_pence >= 0),
  sms_sent_at         timestamptz,
  confirmed_at        timestamptz,
  completed_at        timestamptz,
  completion_photos   text[] not null default '{}',
  notes               text,
  created_at          timestamptz not null default now()
);

create index cleaning_jobs_date_idx     on public.cleaning_jobs(date);
create index cleaning_jobs_status_idx   on public.cleaning_jobs(status);
create index cleaning_jobs_assigned_idx on public.cleaning_jobs(assigned_cleaner_id) where assigned_cleaner_id is not null;
create index cleaning_jobs_booking_idx  on public.cleaning_jobs(booking_id);

alter table public.cleaning_jobs enable row level security;
