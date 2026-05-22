import { formatInTimeZone } from "date-fns-tz";

const LONDON_TZ = "Europe/London";

export function penceToGbp(pence: number): string {
  const pounds = pence / 100;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pounds);
}

export function londonTz(): string {
  return LONDON_TZ;
}

// Today's date in Europe/London as ISO YYYY-MM-DD.
export function londonToday(now: Date = new Date()): string {
  return formatInTimeZone(now, LONDON_TZ, "yyyy-MM-dd");
}

// Add N days to an ISO YYYY-MM-DD string. Pure string math to avoid TZ drift.
export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// Generate N consecutive ISO dates starting at startIso (inclusive).
export function isoDateRange(startIso: string, days: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i++) out.push(addDaysIso(startIso, i));
  return out;
}

// Inclusive on both ends.
export function isoBetween(iso: string, startIso: string, endIso: string): boolean {
  return iso >= startIso && iso <= endIso;
}

// Day-of-week 0-6 (Sun-Sat) for an ISO date.
export function isoDow(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isoIsWeekend(iso: string): boolean {
  const d = isoDow(iso);
  return d === 0 || d === 6;
}

// "Mon", "Tue", etc.
export function isoShortDow(iso: string): string {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names[isoDow(iso)] ?? "";
}

// "21 May" style.
export function isoShortLabel(iso: string): string {
  const [, m, d] = iso.split("-") as [string, string, string];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(d)} ${months[Number(m) - 1] ?? ""}`;
}
