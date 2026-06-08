// Pure presentation helpers for settings: labels, badge tones, role tallies.
// No Supabase, no React, so it stays unit-testable.

import type { Badge } from "@/components/ui/Badge";
import type {
  MemberRole,
  PropertyStatus,
  PropertyTier,
  RoleCount,
  TeamMember
} from "./types";

type BadgeTone = Parameters<typeof Badge>[0]["tone"];

export const ROLE_ORDER: readonly MemberRole[] = ["ops", "brandhost", "cleaner"] as const;

export const ROLE_LABEL: Record<MemberRole, string> = {
  ops: "Ops",
  brandhost: "Brand host",
  cleaner: "Cleaner"
};

// Short description of what each role can do, shown next to the count.
export const ROLE_BLURB: Record<MemberRole, string> = {
  ops: "Full access to the ops platform.",
  brandhost: "Runs check ins, viewings and tenancies on site.",
  cleaner: "Receives and confirms cleaning jobs."
};

export const TIER_LABEL: Record<PropertyTier, string> = {
  prime: "Prime",
  pro: "Pro",
  other: "Other"
};

export const TIER_TONE: Record<PropertyTier, BadgeTone> = {
  prime: "accent",
  pro: "neutral",
  other: "muted"
};

export const STATUS_LABEL: Record<PropertyStatus, string> = {
  active: "Active",
  fit_out: "Fit out",
  archived: "Archived"
};

export const STATUS_TONE: Record<PropertyStatus, BadgeTone> = {
  active: "good",
  fit_out: "warn",
  archived: "muted"
};

// Tally memberships into ordered per-role counts, always covering every role.
export function countRoles(members: TeamMember[]): RoleCount[] {
  return ROLE_ORDER.map((role) => ({
    role,
    count: members.filter((m) => m.role === role).length
  }));
}
