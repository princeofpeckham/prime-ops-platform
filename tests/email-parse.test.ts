import { test } from "node:test";
import assert from "node:assert/strict";

import {
  classifyEmail,
  extractReference,
  extractValuePence,
  extractDates,
  extractPropertyAddress,
  matchProperty,
  brandFromBody,
  parseEmail,
  type PropertyRef
} from "../lib/email/parse";

// Synthetic properties mirroring the seeded Appear Here addresses.
const PROPS: PropertyRef[] = [
  { id: "p-greek", name: "Greek St", address: "59 Greek St" },
  { id: "p-monmouth", name: "Monmouth", address: "6 Monmouth St" },
  { id: "p-darblay", name: "D'arblay", address: "19 D'Arblay St" },
  { id: "p-eastcastle", name: "Eastcastle", address: "36 Eastcastle St" }
];

// Synthetic body modelled on the real offer template shape (no real data).
const OFFER_BODY =
  "THEY WANT TO BOOK YOUR SPACE Please review the offer before sending it to the brand. " +
  "Demo Brand 6, Monmouth Street 8 Jul '26 - 13 Jul '26 (6 days) You make: £4,896 " +
  "View full request https://www.appearhere.co.uk/landlord/requests/CE-4D-80?utm_source=mandrill " +
  "Price breakdown Rent (6 days) including £1,020 VAT £6,120 Refundable security deposit £2,000 " +
  "Appear Here commission (- 20.0%) incl. VAT - £1,224 You make incl. VAT £4,896";

test("classify: offer / viewing / booked / reminder / noise", () => {
  assert.deepEqual(classifyEmail("hello@appearhere.co.uk", "Demo Brand wants to book your space"), { kind: "offer", stage: "in_offer" });
  assert.deepEqual(classifyEmail("hello@appearhere.co.uk", "Book a viewing for The Soho Shop"), { kind: "viewing_request", stage: "viewing" });
  assert.deepEqual(classifyEmail("hello@appearhere.co.uk", "You are booked in to show The Gallery"), { kind: "viewing_booked", stage: "viewing" });
  assert.deepEqual(classifyEmail("hello@appearhere.co.uk", "Your viewing is in 2 hours"), { kind: "viewing_reminder", stage: null });
  assert.deepEqual(classifyEmail("concierge@appearhere.co.uk", "RE: The Designer Boutique"), { kind: "message", stage: null });
  // Noise from non-platform senders is ignored.
  assert.equal(classifyEmail("onboarding@info.n8n.io", "Welcome to n8n!").kind, "ignore");
  assert.equal(classifyEmail("noreply@email.castlewater.co.uk", "Your Latest Bill").kind, "ignore");
});

test("extractReference pulls the AH landlord request ref", () => {
  assert.equal(extractReference(OFFER_BODY), "CE-4D-80");
  assert.equal(extractReference("no link here"), null);
});

test("extractValuePence handles commas and plain numbers", () => {
  assert.equal(extractValuePence("You make: £4,896"), 489600);
  assert.equal(extractValuePence("You make: £12096"), 1209600);
  assert.equal(extractValuePence("no money"), null);
});

test("extractDates parses '26 short year and infers end year", () => {
  assert.deepEqual(extractDates("8 Jul '26 - 13 Jul '26 (6 days)", 2026), { start: "2026-07-08", end: "2026-07-13" });
  // No year on tokens: falls back, end inherits start year.
  assert.deepEqual(extractDates("15 Oct - 17 Oct", 2026), { start: "2026-10-15", end: "2026-10-17" });
});

test("extractPropertyAddress + matchProperty resolve to a seeded property", () => {
  assert.equal(extractPropertyAddress(OFFER_BODY), "6, Monmouth Street");
  assert.equal(matchProperty("6, Monmouth Street", PROPS), "p-monmouth");
  assert.equal(matchProperty("19, D'Arblay Street", PROPS), "p-darblay");
  assert.equal(matchProperty("999, Nowhere Street", PROPS), null);
});

test("parseEmail: a complete offer is fully resolved and needs no review", () => {
  const parsed = parseEmail(
    { sender: "hello@appearhere.co.uk", subject: "Demo Brand wants to book your space", body: OFFER_BODY },
    PROPS,
    2026
  );
  assert.equal(parsed.kind, "offer");
  assert.equal(parsed.stage, "in_offer");
  assert.equal(parsed.reference, "CE-4D-80");
  assert.equal(parsed.brand, "Demo Brand");
  assert.equal(parsed.propertyId, "p-monmouth");
  assert.equal(parsed.valuePence, 489600);
  assert.equal(parsed.startDate, "2026-07-08");
  assert.equal(parsed.endDate, "2026-07-13");
  assert.equal(parsed.needsReview, false);
});

test("parseEmail: noise is ignored", () => {
  const parsed = parseEmail(
    { sender: "onboarding@info.n8n.io", subject: "Welcome to n8n!", body: "..." },
    PROPS,
    2026
  );
  assert.equal(parsed.ignore, true);
});

test("brandFromBody captures the brand before the address in viewing/message bodies", () => {
  assert.equal(brandFromBody("Your viewing is booked Forrester Photography 59, Greek Street 15 Oct - 17 Oct"), "Forrester Photography");
  assert.equal(brandFromBody("Would you accept this? London Kyrgyz Art 15, Bateman Street 6 Nov - 8 Nov"), "London Kyrgyz Art");
  assert.equal(brandFromBody("nothing structured here"), null);
});

test("parseEmail: a free-text concierge message is kept but flagged for review", () => {
  const parsed = parseEmail(
    { sender: "concierge@appearhere.co.uk", subject: "RE: The Designer Boutique", body: "Hi, can we confirm dates?" },
    PROPS,
    2026
  );
  assert.equal(parsed.kind, "message");
  assert.equal(parsed.needsReview, true);
});
