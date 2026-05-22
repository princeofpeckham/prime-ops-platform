-- PRIME Ops Platform: bootstrap extensions, role helpers, shared functions.
-- All amounts in pence. All timestamps in UTC.

create extension if not exists pgcrypto;

-- =========================================================
-- updated_at trigger function
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- Role helpers. Role is stored in the Supabase Auth JWT
-- under app_metadata.role with one of: ops, brandhost, cleaner.
-- =========================================================
create or replace function public.user_role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    nullif(auth.jwt() ->> 'user_role', '')
  );
$$;

create or replace function public.is_ops()
returns boolean
language sql
stable
as $$ select public.user_role() = 'ops'; $$;

create or replace function public.is_brandhost()
returns boolean
language sql
stable
as $$ select public.user_role() = 'brandhost'; $$;

create or replace function public.is_cleaner()
returns boolean
language sql
stable
as $$ select public.user_role() = 'cleaner'; $$;

grant execute on function public.user_role() to anon, authenticated;
grant execute on function public.is_ops() to anon, authenticated;
grant execute on function public.is_brandhost() to anon, authenticated;
grant execute on function public.is_cleaner() to anon, authenticated;

-- =========================================================
-- Enums
-- =========================================================
create type public.property_tier   as enum ('prime', 'pro', 'other');
create type public.property_status as enum ('active', 'fit_out', 'archived');

create type public.booking_status  as enum ('confirmed', 'active', 'completed', 'cancelled');

create type public.shift_type      as enum ('check_in', 'check_out', 'viewing');
create type public.shift_status    as enum ('open', 'applied', 'assigned', 'completed', 'cancelled');
create type public.shift_application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');

create type public.cleaning_job_type   as enum ('pre_clean', 'post_clean', 'deep_clean');
create type public.cleaning_job_status as enum ('pending', 'dispatched', 'confirmed', 'completed', 'cancelled');

create type public.condition_report_type   as enum ('check_in', 'check_out');
create type public.condition_report_status as enum ('draft', 'submitted', 'reviewed');
create type public.condition_overall       as enum ('good', 'minor_issues', 'damage');
create type public.condition_area_state    as enum ('fine', 'minor_wear', 'damage', 'missing');

create type public.trade_type as enum (
  'signage', 'blinds', 'painting', 'plumbing',
  'electrical', 'cleaning', 'security', 'general'
);
create type public.vendor_job_status as enum (
  'draft', 'quoted', 'approved', 'scheduled',
  'in_progress', 'completed', 'disputed'
);

create type public.notification_channel as enum ('sms', 'email', 'slack');
create type public.notification_status  as enum ('sent', 'delivered', 'failed');

create type public.deposit_status as enum (
  'pending_review', 'deduction_proposed',
  'approved', 'processed', 'auto_refunded'
);
