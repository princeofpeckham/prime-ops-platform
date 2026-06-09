// Pure parser for the All-Check-Ins stripped feed (the CLEANER FEED columns:
// space_name, address, postcode, brand, checkin, checkout). No PII in this feed.
// Resolves each row to a seeded property by house number + street word, which
// is robust to trailing letters (14A, 17b) and our abbreviations (St vs Street).

export type FeedRow = {
  space_name: string;
  address: string;
  postcode: string;
  brand: string;
  checkin: string;   // YYYY-MM-DD
  checkout: string;  // YYYY-MM-DD
};

export type PropertyRef = { id: string; name: string; address: string };

export type ParsedBooking = {
  externalId: string;
  propertyId: string;
  brandName: string;
  checkInDate: string;
  checkOutDate: string;
};

type NumStreet = { num: string; street: string };

function normaliseAddress(addr: string): NumStreet | null {
  const cleaned = addr.toLowerCase().replace(/’/g, "'").replace(/,/g, " ").trim();
  // leading house number, optional trailing letter (14a, 17b), then the street word
  const m = cleaned.match(/(\d{1,4})\s*[a-z]?\s+([a-z'][a-z']*)/);
  if (!m) return null;
  return { num: m[1] ?? "", street: m[2] ?? "" };
}

export function matchPropertyByAddress(address: string, properties: PropertyRef[]): string | null {
  const target = normaliseAddress(address);
  if (!target) return null;
  for (const p of properties) {
    const pa = normaliseAddress(p.address);
    if (pa && pa.num === target.num && pa.street === target.street) return p.id;
  }
  return null;
}

// Deterministic short id from the row, so re-ingesting the same booking dedupes.
export function feedExternalId(row: Pick<FeedRow, "space_name" | "brand" | "checkin" | "checkout">): string {
  const basis = `${row.space_name}|${row.brand}|${row.checkin}|${row.checkout}`;
  let h = 2166136261;
  for (let i = 0; i < basis.length; i++) {
    h ^= basis.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `SHEET-${(h >>> 0).toString(16).toUpperCase().padStart(8, "0")}`;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function parseFeedRows(
  rows: FeedRow[],
  properties: PropertyRef[]
): { bookings: ParsedBooking[]; skipped: { row: FeedRow; reason: string }[] } {
  const bookings: ParsedBooking[] = [];
  const skipped: { row: FeedRow; reason: string }[] = [];

  for (const row of rows) {
    if (!ISO.test(row.checkin) || !ISO.test(row.checkout)) {
      skipped.push({ row, reason: "bad dates" });
      continue;
    }
    if (row.checkout < row.checkin) {
      skipped.push({ row, reason: "checkout before checkin" });
      continue;
    }
    const propertyId = matchPropertyByAddress(row.address, properties);
    if (!propertyId) {
      skipped.push({ row, reason: "no property match" });
      continue;
    }
    bookings.push({
      externalId: feedExternalId(row),
      propertyId,
      brandName: row.brand.trim(),
      checkInDate: row.checkin,
      checkOutDate: row.checkout
    });
  }

  return { bookings, skipped };
}
