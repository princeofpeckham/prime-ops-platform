-- Money wave: invoices for deposit deductions and brand charges, matching the
-- existing AH format (per-space invoice numbers like DARB019, itemised lines,
-- VAT at 20%, bank details footer). Per-space numbering lives on properties so
-- sequences continue from the existing paper trail; ops can adjust in Settings.

create type public.invoice_status as enum ('draft', 'issued', 'paid', 'void');

-- Per-space invoice numbering. Prefix + next sequence number.
alter table public.properties add column if not exists invoice_prefix text;
alter table public.properties add column if not exists invoice_next_seq integer not null default 1;

create table public.invoices (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id) on delete cascade,
  property_id      uuid not null references public.properties(id) on delete restrict,
  booking_id       uuid references public.bookings(id) on delete set null,
  deposit_id       uuid references public.deposits(id) on delete set null,
  invoice_number   text not null,
  issued_date      date,
  billed_to_name   text not null,
  billed_to_address text,
  -- [{ item, quantity, rate_pence, amount_pence, waived }]
  line_items       jsonb not null default '[]',
  subtotal_pence   integer not null default 0 check (subtotal_pence >= 0),
  vat_pence        integer not null default 0 check (vat_pence >= 0),
  total_pence      integer not null default 0 check (total_pence >= 0),
  status           public.invoice_status not null default 'draft',
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (org_id, invoice_number)
);

create index invoices_org_idx      on public.invoices(org_id);
create index invoices_property_idx on public.invoices(property_id);
create index invoices_deposit_idx  on public.invoices(deposit_id) where deposit_id is not null;
create index invoices_status_idx   on public.invoices(org_id, status);

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

alter table public.invoices enable row level security;

create policy invoices_ops_all on public.invoices
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));

-- Seed prefixes for the Appear Here spaces, continuing the existing sequences
-- observed in the live invoice folder (DARB019 -> next 20, GS029 -> next 30, etc).
update public.properties set invoice_prefix = 'GS',    invoice_next_seq = 30 where name = 'Greek St'            and invoice_prefix is null;
update public.properties set invoice_prefix = 'DARB',  invoice_next_seq = 20 where name = 'D''arblay'           and invoice_prefix is null;
update public.properties set invoice_prefix = 'HH',    invoice_next_seq = 10 where name = 'Hay Hill'            and invoice_prefix is null;
update public.properties set invoice_prefix = 'PADD',  invoice_next_seq = 9  where name = 'Paddington'          and invoice_prefix is null;
update public.properties set invoice_prefix = 'MONM',  invoice_next_seq = 5  where name = 'Monmouth'            and invoice_prefix is null;
update public.properties set invoice_prefix = 'EASTC', invoice_next_seq = 4  where name = 'Eastcastle'          and invoice_prefix is null;
update public.properties set invoice_prefix = 'BATE',  invoice_next_seq = 8  where name = 'Gallery'             and invoice_prefix is null;
update public.properties set invoice_prefix = 'SIDG',  invoice_next_seq = 1  where name = 'Sidings Ground'      and invoice_prefix is null;
update public.properties set invoice_prefix = 'SIDU',  invoice_next_seq = 1  where name = 'Sidings Underground' and invoice_prefix is null;
update public.properties set invoice_prefix = 'RETRO', invoice_next_seq = 1  where name = 'Retro Studio'        and invoice_prefix is null;
update public.properties set invoice_prefix = 'CORN',  invoice_next_seq = 1  where name = 'Corner Space'        and invoice_prefix is null;
update public.properties set invoice_prefix = 'BBOX',  invoice_next_seq = 1  where name = 'Black Box'           and invoice_prefix is null;
update public.properties set invoice_prefix = 'BBS',   invoice_next_seq = 1  where name = 'Black Brick Shop'    and invoice_prefix is null;
update public.properties set invoice_prefix = 'BVS',   invoice_next_seq = 1  where name = 'Blue Vintage Shop'   and invoice_prefix is null;
update public.properties set invoice_prefix = 'RGS',   invoice_next_seq = 1  where name = 'Raw Glass Shop'      and invoice_prefix is null;
update public.properties set invoice_prefix = 'PORT3', invoice_next_seq = 1  where name = 'Portobello 331'      and invoice_prefix is null;
update public.properties set invoice_prefix = 'PORT2', invoice_next_seq = 1  where name = 'Portobello 281'      and invoice_prefix is null;
update public.properties set invoice_prefix = 'KPR',   invoice_next_seq = 1  where name = 'Kensington Park Rd'  and invoice_prefix is null;

-- Atomically claim the next invoice number for a property.
create or replace function public.next_invoice_number(p_property uuid)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_prefix text;
  v_seq integer;
begin
  update public.properties
    set invoice_next_seq = invoice_next_seq + 1
    where id = p_property
    returning invoice_prefix, invoice_next_seq - 1 into v_prefix, v_seq;
  if v_prefix is null then
    raise exception 'property % has no invoice prefix', p_property;
  end if;
  return v_prefix || lpad(v_seq::text, 3, '0');
end;
$$;

grant execute on function public.next_invoice_number(uuid) to authenticated;
