import { test } from "node:test";
import assert from "node:assert/strict";

import {
  STAGE_ORDER,
  STAGE_LABEL,
  nextStage,
  canPromote,
  toColumns
} from "../lib/inbox/stages";
import type { EnquiryItem } from "../lib/inbox/types";

test("STAGE_ORDER has all seven funnel stages, lost last", () => {
  assert.equal(STAGE_ORDER.length, 7);
  assert.equal(STAGE_ORDER[0], "request");
  assert.equal(STAGE_ORDER[STAGE_ORDER.length - 1], "lost");
});

test("every stage has a label", () => {
  for (const s of STAGE_ORDER) {
    assert.ok(STAGE_LABEL[s] && STAGE_LABEL[s].length > 0);
  }
});

test("nextStage advances linearly and stops at post_check_out", () => {
  assert.equal(nextStage("request"), "viewing");
  assert.equal(nextStage("viewing"), "in_offer");
  assert.equal(nextStage("in_offer"), "pre_check_in");
  assert.equal(nextStage("post_check_out"), null);
  assert.equal(nextStage("lost"), null);
});

test("canPromote is true from in_offer onward, false before and when already booked", () => {
  assert.equal(canPromote({ stage: "request", bookingId: null }), false);
  assert.equal(canPromote({ stage: "viewing", bookingId: null }), false);
  assert.equal(canPromote({ stage: "in_offer", bookingId: null }), true);
  assert.equal(canPromote({ stage: "in_tenancy", bookingId: null }), true);
  assert.equal(canPromote({ stage: "in_offer", bookingId: "b1" }), false);
  assert.equal(canPromote({ stage: "lost", bookingId: null }), false);
});

test("toColumns groups items by stage in order", () => {
  const mk = (id: string, stage: EnquiryItem["stage"]): EnquiryItem => ({
    id,
    brandOrTenantName: id,
    contactEmail: null,
    contactPhone: null,
    valuePence: null,
    requestedStartDate: null,
    requestedEndDate: null,
    propertyId: null,
    propertyName: null,
    requestedArea: null,
    stage,
    source: "manual",
    bookingId: null,
    summary: null,
    nextAction: null,
    needsReview: false,
    updatedAt: "1970-01-01T00:00:00Z",
    events: []
  });
  const cols = toColumns([mk("a", "request"), mk("b", "in_offer"), mk("c", "request")]);
  assert.equal(cols.length, 7);
  assert.equal(cols[0]?.stage, "request");
  assert.equal(cols[0]?.items.length, 2);
  assert.equal(cols[2]?.stage, "in_offer");
  assert.equal(cols[2]?.items.length, 1);
});
