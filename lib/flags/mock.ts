// Deterministic demo flags for the routing board in mock/preview mode.
// Created dates are relative to today so cards feel current; everything else is fixed.

import { addDaysIso, londonToday } from "@/lib/utils";
import { isOpen, toColumns } from "./statuses";
import type { FlagItem, FlagsData, PropertyOption, VendorOption } from "./types";

const DEMO_PROPERTIES: PropertyOption[] = [
  { id: "p-greek-st", name: "Greek St" },
  { id: "p-darblay", name: "D'arblay" },
  { id: "p-hay-hill", name: "Hay Hill" },
  { id: "p-paddington", name: "Paddington" },
  { id: "p-eastcastle", name: "Eastcastle" }
];

const DEMO_VENDORS: VendorOption[] = [
  { id: "v-signsmith", name: "Signsmith Co", trade: "signage", coverageArea: "Central London" },
  { id: "v-westend-blinds", name: "West End Blinds", trade: "blinds", coverageArea: "W1" },
  { id: "v-soho-decorators", name: "Soho Decorators", trade: "painting", coverageArea: "Soho" },
  { id: "v-rapid-plumb", name: "Rapid Plumbing", trade: "plumbing", coverageArea: "Greater London" },
  { id: "v-brightspark", name: "Brightspark Electrical", trade: "electrical", coverageArea: "Central London" },
  { id: "v-citywide-clean", name: "Citywide Cleaning", trade: "cleaning", coverageArea: "Zone 1" },
  { id: "v-sentry-security", name: "Sentry Security", trade: "security", coverageArea: "Greater London" },
  { id: "v-mayfair-handyman", name: "Mayfair Handyman", trade: "general", coverageArea: "Mayfair" }
];

type Seed = {
  id: string;
  propertyId: string;
  title: string;
  description: string | null;
  trade: FlagItem["trade"];
  severity: FlagItem["severity"];
  source: FlagItem["source"];
  status: FlagItem["status"];
  photoCount: number;
  vendorJobId: string | null;
  createdOffset: number;       // days from today (negative = past)
  resolvedOffset: number | null;
};

const SEEDS: Seed[] = [
  { id: "f1", propertyId: "p-greek-st", title: "Window vinyl peeling at entrance", description: "Glossier storefront vinyl lifting at the bottom left corner, visible from the street.", trade: "signage", severity: "high", source: "brandhost", status: "raised", photoCount: 3, vendorJobId: null, createdOffset: -1, resolvedOffset: null },
  { id: "f2", propertyId: "p-paddington", title: "Leaking tap in back kitchen", description: "Slow drip under the sink, small puddle forming overnight.", trade: "plumbing", severity: "urgent", source: "cleaner", status: "raised", photoCount: 2, vendorJobId: null, createdOffset: 0, resolvedOffset: null },
  { id: "f3", propertyId: "p-darblay", title: "Scuffed wall by till point", description: "Aesop fit out left marks along the right wall, needs a repaint before next tenant.", trade: "painting", severity: "medium", source: "condition_report", status: "triaged", photoCount: 1, vendorJobId: null, createdOffset: -3, resolvedOffset: null },
  { id: "f4", propertyId: "p-hay-hill", title: "Blind mechanism jammed", description: "Front blind will not lower, stuck halfway.", trade: "blinds", severity: "medium", source: "ops_manual", status: "triaged", photoCount: 0, vendorJobId: null, createdOffset: -2, resolvedOffset: null },
  { id: "f5", propertyId: "p-eastcastle", title: "Flickering spotlight track", description: "Two ceiling spots flickering on the Reformation rail, possible loose driver.", trade: "electrical", severity: "high", source: "brandhost", status: "assigned", photoCount: 2, vendorJobId: "vj-mock-5", createdOffset: -4, resolvedOffset: null },
  { id: "f6", propertyId: "p-greek-st", title: "New fascia install for Ganni", description: "Swap entrance fascia ahead of Ganni check in, vendor briefed and booked.", trade: "signage", severity: "medium", source: "ops_manual", status: "assigned", photoCount: 1, vendorJobId: "vj-mock-6", createdOffset: -5, resolvedOffset: null },
  { id: "f7", propertyId: "p-paddington", title: "Alarm panel beeping", description: "Security panel intermittently beeping, engineer attending.", trade: "security", severity: "high", source: "system", status: "in_progress", photoCount: 0, vendorJobId: "vj-mock-7", createdOffset: -6, resolvedOffset: null },
  { id: "f8", propertyId: "p-darblay", title: "Deep clean after fit out dust", description: "Builders dust across floor and shelving, deep clean in progress.", trade: "cleaning", severity: "low", source: "cleaner", status: "in_progress", photoCount: 4, vendorJobId: "vj-mock-8", createdOffset: -7, resolvedOffset: null },
  { id: "f9", propertyId: "p-hay-hill", title: "Replaced cracked floor tile", description: "Single cracked tile at threshold, replaced and grouted.", trade: "general", severity: "low", source: "condition_report", status: "resolved", photoCount: 2, vendorJobId: "vj-mock-9", createdOffset: -12, resolvedOffset: -2 },
  { id: "f10", propertyId: "p-greek-st", title: "Repainted back office", description: "Touch up after Glossier checkout, signed off by ops.", trade: "painting", severity: "low", source: "ops_manual", status: "resolved", photoCount: 1, vendorJobId: "vj-mock-10", createdOffset: -15, resolvedOffset: -5 },
  { id: "f11", propertyId: "p-eastcastle", title: "Reported draught at front door", description: "Brand flagged a draught, on inspection the seal was intact, no action needed.", trade: "general", severity: "low", source: "brandhost", status: "dismissed", photoCount: 0, vendorJobId: null, createdOffset: -9, resolvedOffset: null },
  { id: "f12", propertyId: "p-paddington", title: "Duplicate signage request", description: "Logged twice by the cleaner and the brandhost, kept the earlier flag.", trade: "signage", severity: "low", source: "cleaner", status: "dismissed", photoCount: 0, vendorJobId: null, createdOffset: -8, resolvedOffset: null }
];

function buildItem(seed: Seed, todayIso: string): FlagItem {
  const propertyName = DEMO_PROPERTIES.find((p) => p.id === seed.propertyId)?.name ?? null;
  const createdDate = addDaysIso(todayIso, seed.createdOffset);
  const resolvedDate = seed.resolvedOffset === null ? null : addDaysIso(todayIso, seed.resolvedOffset);
  return {
    id: seed.id,
    propertyId: seed.propertyId,
    propertyName,
    title: seed.title,
    description: seed.description,
    trade: seed.trade,
    severity: seed.severity,
    source: seed.source,
    status: seed.status,
    photoCount: seed.photoCount,
    vendorJobId: seed.vendorJobId,
    assignedTo: null,
    createdAt: `${createdDate}T09:00:00Z`,
    resolvedAt: resolvedDate ? `${resolvedDate}T17:00:00Z` : null
  };
}

export function generateMockFlags(now: Date = new Date()): FlagsData {
  const todayIso = londonToday(now);
  const items = SEEDS.map((s) => buildItem(s, todayIso));
  const openItems = items.filter((it) => isOpen(it.status));
  return {
    columns: toColumns(items),
    properties: DEMO_PROPERTIES,
    vendors: DEMO_VENDORS,
    openCount: openItems.length,
    urgentCount: openItems.filter((it) => it.severity === "urgent").length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
