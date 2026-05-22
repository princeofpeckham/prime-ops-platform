-- deposits: 14 day window from checkout, decision tracked here.

create table public.deposits (
  id                      uuid primary key default gen_random_uuid(),
  booking_id              uuid not null references public.bookings(id) on delete cascade,
  property_id             uuid not null references public.properties(id) on delete restrict,
  checkout_date           date not null,
  deadline_date           date not null,
  status                  public.deposit_status not null default 'pending_review',
  deduction_amount_pence  integer check (deduction_amount_pence is null or deduction_amount_pence >= 0),
  deduction_reason        text,
  condition_report_ci_id  uuid references public.condition_reports(id),
  condition_report_co_id  uuid references public.condition_reports(id),
  approved_by             uuid references auth.users(id),
  approved_at             timestamptz,
  processed_at            timestamptz,
  created_at              timestamptz not null default now(),
  constraint deposits_deadline_valid check (deadline_date >= checkout_date)
);

create index deposits_deadline_idx on public.deposits(deadline_date) where status in ('pending_review', 'deduction_proposed');
create index deposits_status_idx   on public.deposits(status);
create index deposits_booking_idx  on public.deposits(booking_id);

alter table public.deposits enable row level security;
