-- bookings: synced from Looker via Google Sheets every 6 hours.
-- Source of truth remains Redshift; this is a read replica for ops state.

create table public.bookings (
  id                   uuid primary key default gen_random_uuid(),
  external_id          text not null unique,
  property_id          uuid not null references public.properties(id) on delete restrict,
  brand_name           text not null,
  brand_contact_email  text,
  brand_contact_phone  text,
  check_in_date        date not null,
  check_out_date       date not null,
  check_in_time        time not null default '09:00',
  check_out_time       time not null default '17:00',
  ttv_pence            integer not null default 0 check (ttv_pence >= 0),
  status               public.booking_status not null default 'confirmed',
  special_instructions text,
  synced_at            timestamptz,
  created_at           timestamptz not null default now(),
  constraint bookings_dates_valid check (check_out_date >= check_in_date)
);

create index bookings_property_idx on public.bookings(property_id);
create index bookings_status_idx   on public.bookings(status);
create index bookings_ci_idx       on public.bookings(check_in_date);
create index bookings_co_idx       on public.bookings(check_out_date);

alter table public.bookings enable row level security;
