import { test } from "node:test";
import assert from "node:assert/strict";

import {
  extractRole,
  decideRoute,
  findRouteRule,
  defaultLandingFor
} from "../lib/auth/roles";

const fakeUser = (role: string | null) => ({
  app_metadata: role ? { role } : {},
  user_metadata: {}
});

test("extractRole reads ops|brandhost|cleaner from app_metadata", () => {
  assert.equal(extractRole(fakeUser("ops") as any), "ops");
  assert.equal(extractRole(fakeUser("brandhost") as any), "brandhost");
  assert.equal(extractRole(fakeUser("cleaner") as any), "cleaner");
});

test("extractRole rejects unknown roles", () => {
  assert.equal(extractRole(fakeUser("admin") as any), null);
  assert.equal(extractRole(fakeUser("") as any), null);
  assert.equal(extractRole(fakeUser(null) as any), null);
  assert.equal(extractRole(null), null);
});

test("extractRole falls back to user_metadata.role", () => {
  const user = { app_metadata: {}, user_metadata: { role: "brandhost" } };
  assert.equal(extractRole(user as any), "brandhost");
});

test("defaultLandingFor maps each role to its home", () => {
  assert.equal(defaultLandingFor("ops"), "/dashboard");
  assert.equal(defaultLandingFor("brandhost"), "/bh/shifts");
  assert.equal(defaultLandingFor("cleaner"), "/cleaner/jobs");
});

test("findRouteRule matches path prefixes", () => {
  assert.equal(findRouteRule("/dashboard")?.allow, "ops");
  assert.equal(findRouteRule("/dashboard/whatever")?.allow, "ops");
  assert.equal(findRouteRule("/bh/shifts")?.allow, "brandhost");
  assert.equal(findRouteRule("/cleaner/jobs")?.allow, "cleaner");
  assert.equal(findRouteRule("/login"), null);
  assert.equal(findRouteRule("/"), null);
});

test("decideRoute: unauthenticated users get sent to /login", () => {
  assert.deepEqual(decideRoute("/dashboard", null), { kind: "redirect", to: "/login" });
  assert.deepEqual(decideRoute("/bh/shifts", null), { kind: "redirect", to: "/login" });
  assert.deepEqual(decideRoute("/cleaner/jobs", null), { kind: "redirect", to: "/login" });
});

test("decideRoute: /login is public for anon, redirects authed users to landing", () => {
  assert.deepEqual(decideRoute("/login", null), { kind: "allow" });
  assert.deepEqual(decideRoute("/login", "ops"), { kind: "redirect", to: "/dashboard" });
  assert.deepEqual(decideRoute("/login", "brandhost"), { kind: "redirect", to: "/bh/shifts" });
  assert.deepEqual(decideRoute("/login", "cleaner"), { kind: "redirect", to: "/cleaner/jobs" });
});

test("decideRoute: / routes each role to its landing", () => {
  assert.deepEqual(decideRoute("/", "ops"), { kind: "redirect", to: "/dashboard" });
  assert.deepEqual(decideRoute("/", "brandhost"), { kind: "redirect", to: "/bh/shifts" });
  assert.deepEqual(decideRoute("/", "cleaner"), { kind: "redirect", to: "/cleaner/jobs" });
});

test("decideRoute: ops can access ops routes, redirected away from BH/cleaner routes", () => {
  assert.deepEqual(decideRoute("/dashboard", "ops"), { kind: "allow" });
  assert.deepEqual(decideRoute("/vendors", "ops"), { kind: "allow" });
  assert.deepEqual(decideRoute("/deposits", "ops"), { kind: "allow" });
  assert.deepEqual(decideRoute("/bh/shifts", "ops"), { kind: "redirect", to: "/dashboard" });
  assert.deepEqual(decideRoute("/cleaner/jobs", "ops"), { kind: "redirect", to: "/dashboard" });
});

test("decideRoute: brandhost can access /bh/*, blocked from ops and cleaner areas", () => {
  assert.deepEqual(decideRoute("/bh/shifts", "brandhost"), { kind: "allow" });
  assert.deepEqual(decideRoute("/bh/reports/new", "brandhost"), { kind: "allow" });
  assert.deepEqual(decideRoute("/dashboard", "brandhost"), { kind: "redirect", to: "/bh/shifts" });
  assert.deepEqual(decideRoute("/cleaner/jobs", "brandhost"), { kind: "redirect", to: "/bh/shifts" });
  assert.deepEqual(decideRoute("/deposits", "brandhost"), { kind: "redirect", to: "/bh/shifts" });
});

test("decideRoute: cleaner can access /cleaner/*, blocked from ops and BH areas", () => {
  assert.deepEqual(decideRoute("/cleaner/jobs", "cleaner"), { kind: "allow" });
  assert.deepEqual(decideRoute("/cleaner/history", "cleaner"), { kind: "allow" });
  assert.deepEqual(decideRoute("/dashboard", "cleaner"), { kind: "redirect", to: "/cleaner/jobs" });
  assert.deepEqual(decideRoute("/bh/shifts", "cleaner"), { kind: "redirect", to: "/cleaner/jobs" });
});

test("decideRoute: webhook and static paths bypass role checks", () => {
  assert.deepEqual(decideRoute("/api/webhooks/n8n", null), { kind: "allow" });
  assert.deepEqual(decideRoute("/_next/static/x.css", null), { kind: "allow" });
});
