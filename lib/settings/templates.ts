// The notification templates the platform sends, named in the spec.
// Static and informational: there is no table behind these yet.

import type { NotificationTemplate } from "./types";

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    key: "shift_reminder",
    name: "Shift reminder",
    channel: "SMS",
    trigger: "The evening before an assigned check in, check out or viewing.",
    audience: "Assigned brand host"
  },
  {
    key: "cleaner_dispatch",
    name: "Cleaner dispatch",
    channel: "SMS",
    trigger: "When a cleaning job is dispatched to a cleaner for confirmation.",
    audience: "Assigned cleaner"
  },
  {
    key: "checkout_reminder",
    name: "Checkout reminder",
    channel: "Email",
    trigger: "The morning of checkout, ahead of the 17:00 handover.",
    audience: "Brand contact"
  },
  {
    key: "deposit_deadline",
    name: "Deposit deadline",
    channel: "Email",
    trigger: "When a deposit decision deadline is approaching without a resolution.",
    audience: "Ops team"
  }
];
