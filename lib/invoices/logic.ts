// Pure invoice maths and line item handling. No Supabase, no React, so it is
// unit-testable and shared by the server action, the live queries and the
// client-side totals preview in the create invoice modal.

// One line on an invoice. Amount is quantity * ratePence; a waived line is
// still shown on the document but contributes nothing to the totals.
export type LineItem = {
  item: string;
  quantity: number;
  ratePence: number;
  waived: boolean;
};

export type InvoiceTotals = {
  subtotalPence: number;
  vatPence: number;
  totalPence: number;
};

export const VAT_RATE = 0.2;

// Amount for a single line in pence. Waived lines always read as zero.
export function lineAmountPence(line: LineItem): number {
  if (line.waived) return 0;
  return Math.round(line.quantity * line.ratePence);
}

// Subtotal is the sum of non-waived line amounts; VAT is 20% of that,
// rounded to the nearest penny; total is the sum of the two.
export function computeTotals(lineItems: LineItem[]): InvoiceTotals {
  const subtotalPence = lineItems.reduce((sum, line) => sum + lineAmountPence(line), 0);
  const vatPence = Math.round(subtotalPence * VAT_RATE);
  return { subtotalPence, vatPence, totalPence: subtotalPence + vatPence };
}

// Normalise raw line items (e.g. straight off a form): trim names, coerce
// numbers to sane non-negative values, drop lines with no name.
export function sanitiseLineItems(lineItems: LineItem[]): LineItem[] {
  return lineItems
    .map((line) => ({
      item: line.item.trim(),
      quantity: Number.isFinite(line.quantity) ? Math.max(0, line.quantity) : 0,
      ratePence: Number.isFinite(line.ratePence) ? Math.max(0, Math.round(line.ratePence)) : 0,
      waived: line.waived === true
    }))
    .filter((line) => line.item.length > 0);
}

// Parse the JSON line_items column back into typed line items, tolerating
// malformed entries rather than throwing on bad historic data.
export function parseLineItems(value: unknown): LineItem[] {
  if (!Array.isArray(value)) return [];
  const items: LineItem[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) continue;
    const record = entry as Record<string, unknown>;
    if (typeof record.item !== "string") continue;
    items.push({
      item: record.item,
      quantity: typeof record.quantity === "number" ? record.quantity : 0,
      ratePence: typeof record.ratePence === "number" ? record.ratePence : 0,
      waived: record.waived === true
    });
  }
  return items;
}
