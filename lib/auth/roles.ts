// Pure role-extraction and routing logic. Kept free of Supabase imports so
// it can be unit-tested without a DB. Used by middleware and pages.

import type { User } from "@supabase/supabase-js";
import type { AppRole } from "@/lib/supabase/types";

export const APP_ROLES = ["ops", "brandhost", "cleaner"] as const;

export function isAppRole(value: unknown): value is AppRole {
  return value === "ops" || value === "brandhost" || value === "cleaner";
}

// Roles are written to Supabase Auth `app_metadata` (server-side only) by ops
// when creating accounts. We also accept `user_metadata.role` as a fallback,
// but app_metadata is authoritative because users cannot edit it client-side.
export function extractRole(
  user: Pick<User, "app_metadata" | "user_metadata"> | null | undefined
): AppRole | null {
  if (!user) return null;
  const fromAppMeta = user.app_metadata?.role;
  if (isAppRole(fromAppMeta)) return fromAppMeta;
  const fromUserMeta = user.user_metadata?.role;
  if (isAppRole(fromUserMeta)) return fromUserMeta;
  return null;
}

export function defaultLandingFor(role: AppRole): string {
  switch (role) {
    case "ops":
      return "/dashboard";
    case "brandhost":
      return "/bh/shifts";
    case "cleaner":
      return "/cleaner/jobs";
  }
}

// Route protection rules. The longest prefix wins, so list specific paths
// before parent paths if there is any overlap.
type RouteRule = { prefix: string; allow: AppRole };

const ROUTE_RULES: ReadonlyArray<RouteRule> = [
  // brandhost area
  { prefix: "/bh", allow: "brandhost" },
  // cleaner area
  { prefix: "/cleaner", allow: "cleaner" },
  // ops areas
  { prefix: "/dashboard", allow: "ops" },
  { prefix: "/shifts", allow: "ops" },
  { prefix: "/cleaning", allow: "ops" },
  { prefix: "/reports", allow: "ops" },
  { prefix: "/vendors", allow: "ops" },
  { prefix: "/deposits", allow: "ops" },
  { prefix: "/analytics", allow: "ops" },
  { prefix: "/settings", allow: "ops" }
];

export function findRouteRule(pathname: string): RouteRule | null {
  for (const rule of ROUTE_RULES) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return rule;
    }
  }
  return null;
}

// Decide what the middleware should do for a given (path, role) pair.
//   - "allow" : pass the request through unchanged
//   - "redirect": send the user somewhere safer (login or their landing page)
export type RouteDecision =
  | { kind: "allow" }
  | { kind: "redirect"; to: string };

const PUBLIC_PATHS = new Set<string>(["/login"]);
const PUBLIC_PREFIXES = ["/api/webhooks", "/api/cron", "/_next", "/favicon"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function decideRoute(pathname: string, role: AppRole | null): RouteDecision {
  // Public routes are always allowed.
  if (isPublic(pathname)) {
    // If a logged-in user hits /login, redirect them home.
    if (pathname === "/login" && role) {
      return { kind: "redirect", to: defaultLandingFor(role) };
    }
    return { kind: "allow" };
  }

  // Authenticated checks below.
  if (!role) {
    return { kind: "redirect", to: "/login" };
  }

  // Root: send to role-specific landing.
  if (pathname === "/") {
    return { kind: "redirect", to: defaultLandingFor(role) };
  }

  const rule = findRouteRule(pathname);
  if (rule && rule.allow !== role) {
    return { kind: "redirect", to: defaultLandingFor(role) };
  }

  return { kind: "allow" };
}
