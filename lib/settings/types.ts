import type { Tables, Enums } from "@/lib/supabase/types";

export type MemberRole = Enums<"member_role">;
export type PropertyStatus = Enums<"property_status">;
export type PropertyTier = Enums<"property_tier">;

export type MembershipRow = Tables<"memberships">;
export type PropertyRow = Tables<"properties">;

// One team member, reduced to what we can safely show without auth.users access.
export type TeamMember = {
  id: string;
  role: MemberRole;
  createdAt: string;
};

export type RoleCount = {
  role: MemberRole;
  count: number;
};

// One property row, shaped for the config table and the edit modal.
export type PropertyConfig = {
  id: string;
  name: string;
  address: string;
  postcode: string | null;
  tier: PropertyTier;
  status: PropertyStatus;
  cleaningRatePence: number;
  keynestInstructions: string | null;
};

// A notification template named in the spec. Static, informational only.
export type NotificationTemplate = {
  key: string;
  name: string;
  channel: "SMS" | "Email" | "Slack";
  trigger: string;
  audience: string;
};

export type SettingsData = {
  team: TeamMember[];
  roleCounts: RoleCount[];
  properties: PropertyConfig[];
  templates: NotificationTemplate[];
  source: "supabase" | "mock";
  generatedAt: string;
};
