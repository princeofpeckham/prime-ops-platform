// Deterministic demo settings for mock/preview mode, so the screen looks alive.
// Member-created dates are relative to today; everything else is fixed.

import { addDaysIso, londonToday } from "@/lib/utils";
import { countRoles } from "./labels";
import { NOTIFICATION_TEMPLATES } from "./templates";
import type { PropertyConfig, SettingsData, TeamMember } from "./types";

const TEAM_SEEDS: { id: string; role: TeamMember["role"]; joinedOffset: number }[] = [
  { id: "m-ops-1", role: "ops", joinedOffset: -420 },
  { id: "m-ops-2", role: "ops", joinedOffset: -360 },
  { id: "m-ops-3", role: "ops", joinedOffset: -120 },
  { id: "m-host-1", role: "brandhost", joinedOffset: -300 },
  { id: "m-host-2", role: "brandhost", joinedOffset: -210 },
  { id: "m-host-3", role: "brandhost", joinedOffset: -64 },
  { id: "m-host-4", role: "brandhost", joinedOffset: -21 },
  { id: "m-clean-1", role: "cleaner", joinedOffset: -240 },
  { id: "m-clean-2", role: "cleaner", joinedOffset: -150 },
  { id: "m-clean-3", role: "cleaner", joinedOffset: -45 }
];

const PROPERTY_SEEDS: PropertyConfig[] = [
  {
    id: "p-greek-st",
    name: "Greek St",
    address: "12 Greek Street",
    postcode: "W1D 4DH",
    tier: "prime",
    status: "active",
    cleaningRatePence: 9000,
    keynestInstructions: "KeyNest at Bar Italia, 22 Frith Street. Quote booking reference on collection."
  },
  {
    id: "p-darblay",
    name: "D'arblay",
    address: "27 D'Arblay Street",
    postcode: "W1F 8EP",
    tier: "prime",
    status: "active",
    cleaningRatePence: 8500,
    keynestInstructions: "KeyNest at the newsagent on Berwick Street. Photo ID required."
  },
  {
    id: "p-hay-hill",
    name: "Hay Hill",
    address: "3 Hay Hill",
    postcode: "W1J 6AS",
    tier: "prime",
    status: "active",
    cleaningRatePence: 11000,
    keynestInstructions: "Concierge desk holds keys, Monday to Saturday 08:00 to 18:00."
  },
  {
    id: "p-paddington",
    name: "Paddington",
    address: "5 Sheldon Square",
    postcode: "W2 6EZ",
    tier: "pro",
    status: "active",
    cleaningRatePence: 7500,
    keynestInstructions: "Smart lock, code rotates weekly. Check the booking note for the current code."
  },
  {
    id: "p-eastcastle",
    name: "Eastcastle",
    address: "40 Eastcastle Street",
    postcode: "W1W 8DW",
    tier: "pro",
    status: "fit_out",
    cleaningRatePence: 7000,
    keynestInstructions: null
  },
  {
    id: "p-marylebone-ln",
    name: "Marylebone Lane",
    address: "61 Marylebone Lane",
    postcode: "W1U 2PA",
    tier: "other",
    status: "archived",
    cleaningRatePence: 6500,
    keynestInstructions: "Lease ended. Keys returned to the landlord."
  }
];

export function generateMockSettings(now: Date = new Date()): SettingsData {
  const todayIso = londonToday(now);
  const team: TeamMember[] = TEAM_SEEDS.map((s) => ({
    id: s.id,
    role: s.role,
    createdAt: `${addDaysIso(todayIso, s.joinedOffset)}T09:00:00Z`
  }));

  return {
    team,
    roleCounts: countRoles(team),
    properties: PROPERTY_SEEDS,
    templates: NOTIFICATION_TEMPLATES,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
