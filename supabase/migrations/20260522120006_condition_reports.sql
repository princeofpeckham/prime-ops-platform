-- condition_reports and condition_report_areas.
-- One row per CI or CO inspection; areas are room-by-room observations.

create table public.condition_reports (
  id                 uuid primary key default gen_random_uuid(),
  booking_id         uuid not null references public.bookings(id) on delete cascade,
  property_id        uuid not null references public.properties(id) on delete restrict,
  type               public.condition_report_type not null,
  submitted_by       uuid not null references auth.users(id) on delete restrict,
  status             public.condition_report_status not null default 'draft',
  overall_condition  public.condition_overall,
  has_damage_flags   boolean not null default false,
  summary            text,
  submitted_at       timestamptz,
  reviewed_at        timestamptz,
  reviewed_by        uuid references auth.users(id),
  created_at         timestamptz not null default now()
);

create index condition_reports_booking_idx     on public.condition_reports(booking_id);
create index condition_reports_status_idx      on public.condition_reports(status);
create index condition_reports_submitted_by_idx on public.condition_reports(submitted_by);
create index condition_reports_damage_idx      on public.condition_reports(has_damage_flags) where has_damage_flags = true;

alter table public.condition_reports enable row level security;

-- condition_report_areas: one row per inspected area (Main Floor, Walls, Kitchen, etc).

create table public.condition_report_areas (
  id         uuid primary key default gen_random_uuid(),
  report_id  uuid not null references public.condition_reports(id) on delete cascade,
  area_name  text not null,
  condition  public.condition_area_state not null,
  notes      text,
  photos     text[] not null default '{}'
);

create index cra_report_idx on public.condition_report_areas(report_id);

alter table public.condition_report_areas enable row level security;
