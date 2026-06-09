-- The routing spine: a property flag is anything that needs action on a space
-- (from a condition report, a cleaner, a brand host, or a manual ops drop).
-- It routes to a vendor (by trade) or a brand-host task, and notifies ops/LL/PM.
-- Also: landlord contacts on properties, and a Storage bucket for report photos.

-- =========================================================
-- Enums
-- =========================================================
create type public.flag_severity as enum ('low', 'medium', 'high', 'urgent');
create type public.flag_status   as enum ('raised', 'triaged', 'assigned', 'in_progress', 'resolved', 'dismissed');
create type public.flag_source   as enum ('condition_report', 'cleaner', 'brandhost', 'ops_manual', 'system');

-- =========================================================
-- Landlord contacts on properties (for deposit comms + multi-landlord grow-out)
-- =========================================================
alter table public.properties add column if not exists landlord_contact_name  text;
alter table public.properties add column if not exists landlord_contact_email text;
alter table public.properties add column if not exists landlord_contact_phone text;

-- =========================================================
-- property_flags
-- =========================================================
create table public.property_flags (
  id                       uuid primary key default gen_random_uuid(),
  org_id                   uuid not null references public.organizations(id) on delete cascade,
  property_id              uuid not null references public.properties(id) on delete restrict,
  title                    text not null,
  description              text,
  trade                    public.trade_type,            -- null until triaged
  severity                 public.flag_severity not null default 'medium',
  status                   public.flag_status not null default 'raised',
  source                   public.flag_source not null default 'ops_manual',
  condition_report_id      uuid references public.condition_reports(id) on delete set null,
  condition_report_area_id uuid references public.condition_report_areas(id) on delete set null,
  vendor_job_id            uuid references public.vendor_jobs(id) on delete set null,   -- set when routed to a vendor
  assigned_to              uuid references auth.users(id) on delete set null,           -- set when routed to a BH/person
  photos                   text[] not null default '{}',
  raised_by                uuid references auth.users(id) on delete set null,
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  resolved_at              timestamptz
);

create index property_flags_org_idx      on public.property_flags(org_id);
create index property_flags_status_idx   on public.property_flags(org_id, status);
create index property_flags_property_idx on public.property_flags(property_id);
create index property_flags_open_idx     on public.property_flags(org_id) where status not in ('resolved', 'dismissed');

create trigger property_flags_set_updated_at
before update on public.property_flags
for each row execute function public.set_updated_at();

alter table public.property_flags enable row level security;

-- Ops: full control within their org.
create policy property_flags_ops_all on public.property_flags
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));

-- Any org member (BH, cleaner) can see and raise flags for their org.
create policy property_flags_member_select on public.property_flags
  for select to authenticated
  using (org_id in (select public.auth_org_ids()));

create policy property_flags_member_insert on public.property_flags
  for insert to authenticated
  with check (org_id in (select public.auth_org_ids()) and raised_by = auth.uid());

-- =========================================================
-- Storage: condition report + flag photos, scoped by org folder
-- Path convention: <org_id>/<report_or_flag_id>/<filename>
-- =========================================================
insert into storage.buckets (id, name, public)
values ('condition-photos', 'condition-photos', false)
on conflict (id) do nothing;

create policy condition_photos_member_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'condition-photos'
    and (storage.foldername(name))[1]::uuid in (select public.auth_org_ids())
  );

create policy condition_photos_member_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'condition-photos'
    and (storage.foldername(name))[1]::uuid in (select public.auth_org_ids())
  );
