import { test } from "node:test";
import assert from "node:assert/strict";

import { computeTotals, lineAmountPence, sanitiseLineItems, parseLineItems } from "../lib/invoices/logic";

test("computeTotals matches the real RIXO invoice: £150 + £30 VAT = £180", () => {
  const totals = computeTotals([
    { item: "Standard Cleaning", quantity: 1, ratePence: 15000, waived: false },
    { item: "Collection Services", quantity: 1, ratePence: 12000, waived: true }
  ]);
  assert.equal(totals.subtotalPence, 15000);
  assert.equal(totals.vatPence, 3000);
  assert.equal(totals.totalPence, 18000);
});

test("waived lines show an amount of zero", () => {
  assert.equal(lineAmountPence({ item: "Collection", quantity: 1, ratePence: 12000, waived: true }), 0);
  assert.equal(lineAmountPence({ item: "Clean", quantity: 2, ratePence: 15000, waived: false }), 30000);
});

test("VAT rounds to the nearest penny", () => {
  // £1.01 subtotal -> VAT 20.2p -> rounds to 20p
  const totals = computeTotals([{ item: "Odd", quantity: 1, ratePence: 101, waived: false }]);
  assert.equal(totals.vatPence, 20);
  assert.equal(totals.totalPence, 121);
});

test("sanitiseLineItems drops unnamed lines and clamps negatives", () => {
  const clean = sanitiseLineItems([
    { item: "  Keys ", quantity: -1, ratePence: -500, waived: false },
    { item: "", quantity: 1, ratePence: 1000, waived: false }
  ]);
  assert.equal(clean.length, 1);
  assert.equal(clean[0]?.item, "Keys");
  assert.equal(clean[0]?.quantity, 0);
  assert.equal(clean[0]?.ratePence, 0);
});

test("parseLineItems tolerates malformed JSON content", () => {
  assert.deepEqual(parseLineItems(null), []);
  assert.deepEqual(parseLineItems([{ nonsense: true }, 42]), []);
  const ok = parseLineItems([{ item: "Clean", quantity: 1, ratePence: 15000, waived: false }]);
  assert.equal(ok.length, 1);
});
