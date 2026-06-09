import { test } from "node:test";
import assert from "node:assert/strict";

import { matchPropertyByAddress, parseFeedRows, feedExternalId, type PropertyRef, type FeedRow } from "../lib/sheets/parse";

const PROPS: PropertyRef[] = [
  { id: "p-greek", name: "Greek St", address: "59 Greek St" },
  { id: "p-darblay", name: "D'arblay", address: "19 D'Arblay St" },
  { id: "p-hay", name: "Hay Hill", address: "14a Hay Hill" },
  { id: "p-padd", name: "Paddington", address: "3 Paddington St" },
  { id: "p-blue", name: "Blue Vintage Shop", address: "17b Kingsland Rd" },
  { id: "p-kensington", name: "Kensington Park Rd", address: "19 Kensington Park Rd" }
];

test("matchPropertyByAddress handles abbreviations, trailing letters, apostrophes", () => {
  assert.equal(matchPropertyByAddress("59 Greek Street", PROPS), "p-greek");
  assert.equal(matchPropertyByAddress("14A Hay Hill", PROPS), "p-hay");       // trailing letter
  assert.equal(matchPropertyByAddress("17b Kingsland Road", PROPS), "p-blue"); // trailing letter
  assert.equal(matchPropertyByAddress("19 D'Arblay Street", PROPS), "p-darblay");
  // same number, different street must not collide
  assert.equal(matchPropertyByAddress("19 Kensington Park Road", PROPS), "p-kensington");
  assert.equal(matchPropertyByAddress("999 Nowhere Road", PROPS), null);
});

test("feedExternalId is stable for the same booking", () => {
  const row = { space_name: "Greek St", brand: "RIXO", checkin: "2026-06-10", checkout: "2026-06-14" };
  assert.equal(feedExternalId(row), feedExternalId({ ...row }));
  assert.match(feedExternalId(row), /^SHEET-[0-9A-F]{8}$/);
});

test("parseFeedRows resolves good rows and skips unmatched/bad", () => {
  const rows: FeedRow[] = [
    { space_name: "Greek St", address: "59 Greek Street", postcode: "W1D 3DZ", brand: "RIXO", checkin: "2026-06-10", checkout: "2026-06-14" },
    { space_name: "Mystery", address: "Unit 25 281 Portobello Road", postcode: "W11", brand: "X", checkin: "2026-06-10", checkout: "2026-06-14" },
    { space_name: "Bad", address: "59 Greek Street", postcode: "W1D 3DZ", brand: "Y", checkin: "nope", checkout: "2026-06-14" }
  ];
  const { bookings, skipped } = parseFeedRows(rows, PROPS);
  assert.equal(bookings.length, 1);
  assert.equal(bookings[0]?.propertyId, "p-greek");
  assert.equal(skipped.length, 2);
});
