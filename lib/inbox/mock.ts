// Deterministic demo enquiries for the inbox in mock/preview mode.
// Dates are relative to today so cards feel current; everything else is fixed.

import { addDaysIso, londonToday } from "@/lib/utils";
import { toColumns } from "./stages";
import type { EnquiryItem, InboxData, PropertyOption } from "./types";

const DEMO_PROPERTIES: PropertyOption[] = [
  { id: "p-greek-st", name: "Greek St" },
  { id: "p-darblay", name: "D'arblay" },
  { id: "p-hay-hill", name: "Hay Hill" },
  { id: "p-paddington", name: "Paddington" },
  { id: "p-eastcastle", name: "Eastcastle" }
];

type Seed = {
  id: string;
  brand: string;
  email: string | null;
  valuePence: number | null;
  startOffset: number | null;
  durationDays: number | null;
  propertyId: string | null;
  area: string | null;
  stage: EnquiryItem["stage"];
  source: EnquiryItem["source"];
  needsReview: boolean;
  nextAction: string | null;
  summary: string;
  notes: string[];
};

const SEEDS: Seed[] = [
  { id: "e1", brand: "Mejuri", email: "popups@mejuri.com", valuePence: 1800000, startOffset: 21, durationDays: 28, propertyId: "p-greek-st", area: "Soho", stage: "request", source: "email", needsReview: true, nextAction: "Qualify budget and dates", summary: "Jewellery brand wants a 4 week Soho pop up in late summer.", notes: ["Inbound via website form, forwarded to enquiries inbox."] },
  { id: "e2", brand: "Oatly", email: "uk@oatly.com", valuePence: 950000, startOffset: 10, durationDays: 7, propertyId: null, area: "East London", stage: "request", source: "email", needsReview: true, nextAction: "Suggest Kingsland Rd options", summary: "One week sampling activation, flexible on exact street.", notes: [] },
  { id: "e3", brand: "Polaroid", email: "events@polaroid.com", valuePence: 2400000, startOffset: 14, durationDays: 21, propertyId: "p-hay-hill", area: "Mayfair", stage: "viewing", source: "manual", needsReview: false, nextAction: "Viewing booked Thu 2pm", summary: "Premium camera brand, viewing arranged for Hay Hill.", notes: ["Called, keen on Hay Hill.", "Viewing set for Thursday 2pm."] },
  { id: "e4", brand: "Glossier", email: "retail@glossier.com", valuePence: 3200000, startOffset: 30, durationDays: 42, propertyId: "p-greek-st", area: "Soho", stage: "viewing", source: "referral", needsReview: false, nextAction: "Send floorplan after viewing", summary: "Returning brand, six week flagship pop up.", notes: ["Referred by their agency.", "Viewing done, loved the space."] },
  { id: "e5", brand: "Aesop", email: "uk.property@aesop.com", valuePence: 4100000, startOffset: 18, durationDays: 60, propertyId: "p-darblay", area: "Soho", stage: "in_offer", source: "email", needsReview: false, nextAction: "Awaiting signed terms", summary: "Two month residency, terms sent.", notes: ["Terms issued Monday.", "Verbal yes, paperwork pending."] },
  { id: "e6", brand: "Allbirds", email: "emea@allbirds.com", valuePence: 1500000, startOffset: 7, durationDays: 14, propertyId: "p-paddington", area: "Marylebone", stage: "in_offer", source: "manual", needsReview: false, nextAction: "Chase deposit", summary: "Fortnight footwear pop up at Paddington.", notes: ["Offer accepted, deposit invoice sent."] },
  { id: "e7", brand: "Reformation", email: "popup@thereformation.com", valuePence: 2800000, startOffset: 3, durationDays: 30, propertyId: "p-eastcastle", area: "Fitzrovia", stage: "pre_check_in", source: "email", needsReview: false, nextAction: "Confirm signage install", summary: "Booked, prepping space and signage before check in.", notes: ["Booking confirmed.", "Signage vendor briefed."] },
  { id: "e8", brand: "Ganni", email: "studio@ganni.com", valuePence: 3600000, startOffset: -4, durationDays: 35, propertyId: "p-greek-st", area: "Soho", stage: "in_tenancy", source: "manual", needsReview: false, nextAction: "Mid stay check in", summary: "Currently in residency at Greek St.", notes: ["Checked in smoothly.", "Brand happy at week one."] },
  { id: "e9", brand: "Diptyque", email: "uk@diptyque.com", valuePence: 2100000, startOffset: -20, durationDays: 14, propertyId: "p-hay-hill", area: "Mayfair", stage: "post_check_out", source: "email", needsReview: false, nextAction: "Resolve deposit", summary: "Stay finished, settling condition report and deposit.", notes: ["Checked out on time.", "Minor wall scuff flagged."] },
  { id: "e10", brand: "Cuyana", email: null, valuePence: 700000, startOffset: 40, durationDays: 7, propertyId: null, area: "Notting Hill", stage: "lost", source: "web", needsReview: false, nextAction: null, summary: "Went with another landlord on price.", notes: ["Budget too low for Portobello."] },
  { id: "e11", brand: "Skims", email: "retail@skims.com", valuePence: 5200000, startOffset: 45, durationDays: 56, propertyId: "p-greek-st", area: "Soho", stage: "request", source: "email", needsReview: true, nextAction: "High value, prioritise", summary: "Large eight week flagship enquiry, premium budget.", notes: ["Flagged high value on arrival."] },
  { id: "e12", brand: "Lemaire", email: "press@lemaire.fr", valuePence: 1900000, startOffset: 25, durationDays: 21, propertyId: "p-darblay", area: "Soho", stage: "viewing", source: "manual", needsReview: false, nextAction: "Arrange viewing", summary: "Three week showroom, viewing to be set.", notes: [] }
];

function buildItem(seed: Seed, todayIso: string): EnquiryItem {
  const start = seed.startOffset === null ? null : addDaysIso(todayIso, seed.startOffset);
  const end =
    seed.startOffset === null || seed.durationDays === null
      ? null
      : addDaysIso(todayIso, seed.startOffset + seed.durationDays);
  const propertyName = DEMO_PROPERTIES.find((p) => p.id === seed.propertyId)?.name ?? null;
  return {
    id: seed.id,
    brandOrTenantName: seed.brand,
    contactEmail: seed.email,
    contactPhone: null,
    valuePence: seed.valuePence,
    requestedStartDate: start,
    requestedEndDate: end,
    propertyId: seed.propertyId,
    propertyName,
    requestedArea: seed.area,
    stage: seed.stage,
    source: seed.source,
    bookingId: null,
    summary: seed.summary,
    nextAction: seed.nextAction,
    needsReview: seed.needsReview,
    updatedAt: `${todayIso}T09:00:00Z`,
    events: seed.notes.map((body, i) => ({
      id: `${seed.id}-ev${i}`,
      kind: "note" as const,
      body,
      createdAt: `${todayIso}T09:0${i}:00Z`
    }))
  };
}

export function generateMockInbox(now: Date = new Date()): InboxData {
  const todayIso = londonToday(now);
  const items = SEEDS.map((s) => buildItem(s, todayIso));
  const totalValuePence = items
    .filter((it) => it.stage !== "lost")
    .reduce((sum, it) => sum + (it.valuePence ?? 0), 0);
  return {
    columns: toColumns(items),
    properties: DEMO_PROPERTIES,
    totalValuePence,
    needsReviewCount: items.filter((it) => it.needsReview).length,
    source: "mock",
    generatedAt: now.toISOString()
  };
}
