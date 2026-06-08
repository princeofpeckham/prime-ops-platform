-- Phase B: enquiries (front of funnel CRM) + per card event timeline.
-- Enquiries are an ops/property-manager concept, so RLS is ops scoped per org.
-- An enquiry promotes into a booking when it reaches the in_offer stage.

-- =========================================================
-- Enums
-- =========================================================
create type public.enquiry_stage as enum (
  'request', 'viewing', 'in_offer', 'pre_check_in', 'in_tenancy', 'post_check_out', 'lost'
);
create type public.enquiry_source as enum ('email', 'manual', 'web', 'referral');
create type public.enquiry_event_kind as enum ('stage_change', 'note', 'email_in', 'email_out');

-- =========================================================
-- enquiries
-- =========================================================
create table public.enquiries (
  id                   uuid primary key default gen_random_uuid(),
  org_id               uuid not null references public.organizations(id) on delete cascade,
  brand_or_tenant_name text not null,
  contact_email        text,
  contact_phone        text,
  value_pence          integer check (value_pence is null or value_pence >= 0),
  requested_start_date date,
  requested_end_date   date,
  property_id          uuid references public.properties(id) on delete set null,
  requested_area       text,
  stage                public.enquiry_stage not null default 'request',
  source               public.enquiry_source not null default 'manual',
  booking_id           uuid references public.bookings(id) on delete set null,
  owner_id             uuid references auth.users(id) on delete set null,
  summary              text,
  next_action          text,
  needs_review         boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  stage_changed_at     timestamptz not null default now(),
  constraint enquiries_dates_valid check (
    requested_start_date is null
    or requested_end_date is null
    or requested_end_date >= requested_start_date
  )
);

create index enquiries_org_idx        on public.enquiries(org_id);
create index enquiries_stage_idx      on public.enquiries(org_id, stage);
create index enquiries_property_idx   on public.enquiries(property_id) where property_id is not null;
create index enquiries_booking_idx    on public.enquiries(booking_id) where booking_id is not null;
create index enquiries_needs_review_idx on public.enquiries(org_id) where needs_review = true;

create trigger enquiries_set_updated_at
before update on public.enquiries
for each row execute function public.set_updated_at();

create or replace function public.enquiries_touch_stage()
returns trigger
language plpgsql
as $$
begin
  if new.stage is distinct from old.stage then
    new.stage_changed_at = now();
  end if;
  return new;
end;
$$;

create trigger enquiries_stage_changed
before update on public.enquiries
for each row execute function public.enquiries_touch_stage();

alter table public.enquiries enable row level security;

create policy enquiries_ops_all on public.enquiries
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));

-- =========================================================
-- enquiry_events: per card timeline (stage changes, notes, emails)
-- =========================================================
create table public.enquiry_events (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  enquiry_id  uuid not null references public.enquiries(id) on delete cascade,
  kind        public.enquiry_event_kind not null,
  body        text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index enquiry_events_enquiry_idx on public.enquiry_events(enquiry_id, created_at);
create index enquiry_events_org_idx     on public.enquiry_events(org_id);

alter table public.enquiry_events enable row level security;

create policy enquiry_events_ops_all on public.enquiry_events
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));
