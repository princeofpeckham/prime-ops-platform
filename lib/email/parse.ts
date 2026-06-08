// Pure parser for Appear Here platform emails. No Supabase, no network, so it
// is fully unit-testable. The [PLUS] inbox carries structured AH notifications
// (offers, viewing requests, viewing confirmations) plus noise (bills, signups).
// We classify by sender + subject, then extract fields with regex. Free-text
// concierge messages fall through to needs_review for a human or Claude.

import type { EnquiryStage } from "@/lib/inbox/types";

const PLATFORM_DOMAIN = "@appearhere.co.uk";

export type EmailKind =
  | "offer"
  | "viewing_request"
  | "viewing_booked"
  | "viewing_reminder"
  | "viewing_rescheduled"
  | "message"
  | "other"
  | "ignore";

export type EmailInput = {
  sender: string;
  subject: string;
  body: string;
};

export type PropertyRef = { id: string; name: string; address: string };

export type ParsedEmail = {
  kind: EmailKind;
  stage: EnquiryStage | null;     // null = event only, no stage change
  ignore: boolean;
  reason?: string;
  reference: string | null;       // AH landlord request ref, e.g. CE-4D-80
  brand: string | null;
  propertyId: string | null;
  propertyAddress: string | null;
  valuePence: number | null;
  startDate: string | null;       // ISO yyyy-mm-dd
  endDate: string | null;
  needsReview: boolean;
};

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
};

// ---------- classification ----------
export function classifyEmail(sender: string, subject: string): { kind: EmailKind; stage: EnquiryStage | null } {
  const s = sender.toLowerCase();
  if (!s.endsWith(PLATFORM_DOMAIN)) return { kind: "ignore", stage: null };

  const subj = subject.toLowerCase();
  if (/wants to book your space/.test(subj)) return { kind: "offer", stage: "in_offer" };
  if (/^book a viewing for/.test(subj)) return { kind: "viewing_request", stage: "viewing" };
  if (/you are booked in to show|your viewing is booked/.test(subj)) return { kind: "viewing_booked", stage: "viewing" };
  if (/your viewing is in \d+\s*hour/.test(subj)) return { kind: "viewing_reminder", stage: null };
  if (/viewing has been rescheduled/.test(subj)) return { kind: "viewing_rescheduled", stage: "viewing" };
  if (s.startsWith("concierge@") || /^re:|^message about/.test(subj)) return { kind: "message", stage: null };
  return { kind: "other", stage: null };
}

// ---------- field extractors ----------
export function extractReference(body: string): string | null {
  const m = body.match(/\/landlord\/requests\/([A-Z0-9]{2}-[A-Z0-9]{2}-[A-Z0-9-]{2,})/);
  return m ? (m[1] ?? null) : null;
}

// "You make: £4,896" or "You make: £12096" -> pence
export function extractValuePence(body: string): number | null {
  const m = body.match(/You make:?\s*£\s*([\d,]+)/i);
  if (!m || !m[1]) return null;
  const pounds = Number(m[1].replace(/,/g, ""));
  return Number.isNaN(pounds) ? null : pounds * 100;
}

function parseUkDate(token: string, fallbackYear: number): string | null {
  // tokens: "8 Jul '26", "15 Oct", "8 Jul 2026"
  const m = token.trim().match(/^(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\.?(?:\s+'?(\d{2,4}))?$/);
  if (!m) return null;
  const day = Number(m[1]);
  const mon = MONTHS[(m[2] ?? "").toLowerCase()];
  if (!mon || !day) return null;
  let year = fallbackYear;
  if (m[3]) {
    const y = Number(m[3]);
    year = y < 100 ? 2000 + y : y;
  }
  return `${year}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// "8 Jul '26 - 13 Jul '26 (6 days)" or "15 Oct - 17 Oct"
export function extractDates(body: string, fallbackYear: number): { start: string | null; end: string | null } {
  const m = body.match(
    /(\d{1,2}\s+[A-Za-z]{3,9}(?:\s+'?\d{2,4})?)\s*[-–—]\s*(\d{1,2}\s+[A-Za-z]{3,9}(?:\s+'?\d{2,4})?)/
  );
  if (!m) return { start: null, end: null };
  const start = parseUkDate(m[1] ?? "", fallbackYear);
  // if the start token carried a year, reuse it for the end token
  const startYear = start ? Number(start.slice(0, 4)) : fallbackYear;
  const end = parseUkDate(m[2] ?? "", startYear);
  return { start, end };
}

// "6, Monmouth Street" / "59, Greek Street"
export function extractPropertyAddress(body: string): string | null {
  const m = body.match(/(\d{1,4},?\s+[A-Z][A-Za-z'’.]+(?:\s+[A-Z][A-Za-z'’.]+)*\s+(?:Street|St|Road|Rd|Lane|Hill|Place|Pl))/);
  return m && m[1] ? m[1].replace(/\s+/g, " ").trim() : null;
}

function normaliseStreet(addr: string): { num: string; street: string } | null {
  const cleaned = addr.toLowerCase().replace(/’/g, "'").replace(/,/g, " ");
  const m = cleaned.match(/(\d{1,4})\s+([a-z'][a-z']*)/);
  if (!m) return null;
  return { num: m[1] ?? "", street: m[2] ?? "" };
}

export function matchProperty(address: string | null, properties: PropertyRef[]): string | null {
  if (!address) return null;
  const target = normaliseStreet(address);
  if (!target) return null;
  for (const p of properties) {
    const pa = normaliseStreet(p.address);
    if (pa && pa.num === target.num && pa.street === target.street) return p.id;
  }
  return null;
}

// "Akiture London wants to book your space" -> "Akiture London"
function brandFromSubject(subject: string): string | null {
  const m = subject.match(/^(.*?)\s+wants to book your space/i);
  return m && m[1] ? m[1].trim() : null;
}

// In viewing/message bodies the brand sits right before the address token,
// e.g. "...booked Forrester Photography 59, Greek Street 15 Oct...".
// Lowercase words (booked, hours) break the run, so we capture the trailing
// run of capitalised words immediately before "N, Street".
export function brandFromBody(body: string): string | null {
  const m = body.match(
    /([A-Z][A-Za-z&'’.-]+(?:\s+[A-Z][A-Za-z&'’.-]+){0,4})\s+\d{1,4},?\s+[A-Z][A-Za-z'’.]+(?:\s+[A-Z][A-Za-z'’.]+)*\s+(?:Street|St|Road|Rd|Lane|Hill|Place|Pl)\b/
  );
  return m && m[1] ? m[1].trim() : null;
}

// ---------- top level ----------
export function parseEmail(
  input: EmailInput,
  properties: PropertyRef[],
  fallbackYear: number
): ParsedEmail {
  const { kind, stage } = classifyEmail(input.sender, input.subject);

  const base: ParsedEmail = {
    kind,
    stage,
    ignore: kind === "ignore",
    reason: kind === "ignore" ? "non-platform sender" : undefined,
    reference: null,
    brand: null,
    propertyId: null,
    propertyAddress: null,
    valuePence: null,
    startDate: null,
    endDate: null,
    needsReview: true
  };
  if (kind === "ignore") return base;

  const reference = extractReference(input.body);
  const valuePence = extractValuePence(input.body);
  const { start, end } = extractDates(input.body, fallbackYear);
  const propertyAddress = extractPropertyAddress(input.body);
  const propertyId = matchProperty(propertyAddress, properties);
  const brand = brandFromSubject(input.subject) ?? brandFromBody(input.body);

  // A structured offer with all key fields resolved does not need review.
  const fullyResolved =
    kind === "offer" && !!reference && !!brand && !!propertyId && !!start && !!end && valuePence != null;

  return {
    ...base,
    reference,
    brand,
    propertyId,
    propertyAddress,
    valuePence,
    startDate: start,
    endDate: end,
    needsReview: !fullyResolved
  };
}
