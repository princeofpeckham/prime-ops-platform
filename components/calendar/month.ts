// Small month-arithmetic helpers, kept as pure string math (Europe/London safe,
// no Date drift) and shared by the grid and the summary strip.

// First day (YYYY-MM-01) of the month containing iso.
export function monthStart(iso: string): string {
  const [y, m] = iso.split("-");
  return `${y}-${m}-01`;
}

export function addMonths(monthStartIso: string, delta: number): string {
  const [y, m] = monthStartIso.split("-").map(Number) as [number, number, number];
  const total = y * 12 + (m - 1) + delta;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}-01`;
}

// The YYYY-MM prefix of the month containing iso.
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}
