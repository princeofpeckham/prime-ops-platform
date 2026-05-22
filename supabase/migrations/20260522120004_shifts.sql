-- shifts and shift_applications: BH marketplace + assignment.
-- One check_in and one check_out shift auto created per booking.

create table public.shifts (
  id               uuid primary key default gen_random_uuid(),
  booking_id       uuid not null references public.bookings(id) on delete cascade,
  property_id      uuid not null references public.properties(id) on delete restrict,
  type             public.shift_type not null,
  date             date not null,
  start_time       time not null,
  end_time         time not null,
  status           public.shift_status not null default 'open',
  assigned_bh_id   uuid references auth.users(id) on delete set null,
  rate_pence       integer not null check (rate_pence >= 0),
  is_escalated     boolean not null default false,
  escalation_level smallint not null default 0 check (escalation_level between 0 and 2),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint shifts_time_valid check (end_time > start_time)
);

create index shifts_property_date_idx on public.shifts(property_id, date);
create index shifts_status_idx        on public.shifts(status);
create index shifts_date_idx          on public.shifts(date);
create index shifts_assigned_idx      on public.shifts(assigned_bh_id) where assigned_bh_id is not null;

create trigger shifts_set_updated_at
before update on public.shifts
for each row execute function public.set_updated_at();

alter table public.shifts enable row level security;

-- shift_applications: BHs apply, ops accept.

create table public.shift_applications (
  id          uuid primary key default gen_random_uuid(),
  shift_id    uuid not null references public.shifts(id) on delete cascade,
  bh_id       uuid not null references auth.users(id) on delete cascade,
  status      public.shift_application_status not null default 'pending',
  applied_at  timestamptz not null default now(),
  decided_at  timestamptz,
  unique (shift_id, bh_id)
);

create index shift_applications_shift_idx on public.shift_applications(shift_id);
create index shift_applications_bh_idx    on public.shift_applications(bh_id);

alter table public.shift_applications enable row level security;
