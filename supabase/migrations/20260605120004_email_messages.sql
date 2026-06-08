-- Phase C: raw ingested emails. Provider agnostic (source column), org scoped.
-- The Inbox Scanner stores every fetched message here, then the parser turns
-- platform emails into enquiries. Noise (bills, signups) is marked ignored.

create type public.email_message_status as enum ('received', 'parsed', 'ignored', 'failed');

create table public.email_messages (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references public.organizations(id) on delete cascade,
  source              text not null default 'gmail',
  external_message_id text not null,
  thread_id           text,
  from_address        text,
  to_address          text,
  subject             text,
  body_text           text,
  received_at         timestamptz,
  status              public.email_message_status not null default 'received',
  classified_kind     text,            -- e.g. offer, viewing_request, viewing_booked, message
  parsed_reference    text,            -- AH landlord request reference, e.g. CE-4D-80
  enquiry_id          uuid references public.enquiries(id) on delete set null,
  parse_error         text,
  created_at          timestamptz not null default now(),
  unique (org_id, source, external_message_id)
);

create index email_messages_org_idx     on public.email_messages(org_id);
create index email_messages_status_idx  on public.email_messages(org_id, status);
create index email_messages_enquiry_idx on public.email_messages(enquiry_id) where enquiry_id is not null;
create index email_messages_ref_idx     on public.email_messages(parsed_reference) where parsed_reference is not null;

alter table public.email_messages enable row level security;

create policy email_messages_ops_all on public.email_messages
  for all to authenticated
  using (public.auth_has_role(org_id, 'ops'))
  with check (public.auth_has_role(org_id, 'ops'));
