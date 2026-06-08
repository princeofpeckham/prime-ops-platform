import { test } from "node:test";
import assert from "node:assert/strict";

import { buildOpsForBooking, shiftRateFor } from "../lib/bookings/ops";

const BOOKING = {
  id: "bk1",
  org_id: "org1",
  property_id: "prop1",
  brand_name: "Demo Brand",
  // 2026-07-08 is a Wednesday (weekday), 2026-07-13 is a Monday (weekday)
  check_in_date: "2026-07-08",
  check_out_date: "2026-07-13"
};

test("shiftRateFor returns weekday vs weekend rate", () => {
  assert.equal(shiftRateFor("2026-07-08"), 1700); // Wednesday
  assert.equal(shiftRateFor("2026-07-11"), 2000); // Saturday
  assert.equal(shiftRateFor("2026-07-12"), 2000); // Sunday
});

test("buildOpsForBooking creates one CI and one CO shift with spec times", () => {
  const { shifts } = buildOpsForBooking(BOOKING);
  assert.equal(shifts.length, 2);
  const ci = shifts.find((s) => s.type === "check_in");
  const co = shifts.find((s) => s.type === "check_out");
  assert.equal(ci?.date, "2026-07-08");
  assert.equal(ci?.start_time, "08:45:00");
  assert.equal(ci?.end_time, "09:30:00");
  assert.equal(co?.date, "2026-07-13");
  assert.equal(co?.start_time, "16:45:00");
  assert.equal(co?.end_time, "17:30:00");
  assert.equal(ci?.status, "open");
  assert.equal(co?.status, "open");
});

test("buildOpsForBooking creates pre and post cleans on the right days", () => {
  const { cleans } = buildOpsForBooking(BOOKING);
  assert.equal(cleans.length, 2);
  const pre = cleans.find((c) => c.type === "pre_clean");
  const post = cleans.find((c) => c.type === "post_clean");
  assert.equal(pre?.date, "2026-07-08");
  assert.equal(post?.date, "2026-07-13");
  assert.equal(pre?.rate_pence, 15000);
  assert.equal(post?.status, "pending");
});

test("weekend booking gets the weekend shift rate", () => {
  const weekend = buildOpsForBooking({ ...BOOKING, check_in_date: "2026-07-11", check_out_date: "2026-07-12" });
  const ci = weekend.shifts.find((s) => s.type === "check_in");
  assert.equal(ci?.rate_pence, 2000);
});

test("cleaning rate honours the property override", () => {
  const { cleans } = buildOpsForBooking({ ...BOOKING, cleaning_rate_pence: 18000 });
  assert.equal(cleans[0]?.rate_pence, 18000);
});
