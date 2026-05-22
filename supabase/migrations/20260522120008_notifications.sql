-- notifications: log of every SMS, email, and Slack message the platform sends.

create table public.notifications (
  id                uuid primary key default gen_random_uuid(),
  channel           public.notification_channel not null,
  recipient_id      uuid references auth.users(id) on delete set null,
  recipient_address text not null,
  template          text,
  body              text not null,
  related_type      text,
  related_id        uuid,
  status            public.notification_status not null default 'sent',
  sent_at           timestamptz,
  created_at        timestamptz not null default now()
);

create index notifications_related_idx   on public.notifications(related_type, related_id);
create index notifications_recipient_idx on public.notifications(recipient_id) where recipient_id is not null;
create index notifications_status_idx    on public.notifications(status);

alter table public.notifications enable row level security;
