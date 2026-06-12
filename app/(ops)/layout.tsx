import Link from "next/link";
import { signOut } from "@/app/(auth)/login/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractRole } from "@/lib/auth/roles";
import { SidebarNav, TopbarNav, type ShellNavItem } from "@/components/shell/SidebarNav";

// Live counts for the nav pills. Fetched server-side with head queries so we
// never pull rows. Any failure degrades to "no badge" rather than a broken shell.
type NavCounts = {
  openShifts: number;
  inboxReview: number;
  activeFlags: number;
};

async function fetchNavCounts(
  supabase: ReturnType<typeof createSupabaseServerClient>
): Promise<NavCounts> {
  try {
    const [shiftsRes, inboxRes, flagsRes] = await Promise.all([
      supabase.from("shifts").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("needs_review", true),
      supabase.from("property_flags").select("id", { count: "exact", head: true }).in("status", ["raised", "triaged"])
    ]);
    return {
      openShifts: shiftsRes.count ?? 0,
      inboxReview: inboxRes.count ?? 0,
      activeFlags: flagsRes.count ?? 0
    };
  } catch {
    // Count queries are decoration; the shell must always render.
    return { openShifts: 0, inboxReview: 0, activeFlags: 0 };
  }
}

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const previewMode = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";
  let role: string | null = null;
  let email: string | null = null;
  let counts: NavCounts = { openShifts: 0, inboxReview: 0, activeFlags: 0 };

  if (!previewMode) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    role = extractRole(user);
    email = user?.email ?? null;
    counts = await fetchNavCounts(supabase);
  } else {
    role = "ops";
    email = "preview@local";
  }

  const navItems: ShellNavItem[] = [
    { href: "/dashboard", label: "Overview" },
    { href: "/inbox", label: "Inbox", count: counts.inboxReview },
    { href: "/calendar", label: "Calendar" },
    { href: "/shifts", label: "Shifts", count: counts.openShifts },
    { href: "/cleaning", label: "Cleaning" },
    { href: "/reports", label: "Reports" },
    { href: "/flags", label: "Flags", count: counts.activeFlags },
    { href: "/vendors", label: "Vendors" },
    { href: "/deposits", label: "Deposits" },
    { href: "/invoices", label: "Invoices" },
    { href: "/analytics", label: "Analytics" },
    { href: "/settings", label: "Settings" }
  ];

  const previewBadge = previewMode ? (
    <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
      Preview mode
    </span>
  ) : null;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Fixed sidebar, md and up */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-pine-800 text-pine-100 md:flex">
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-white">
            PRIME Ops
          </Link>
          {previewBadge}
        </div>
        <SidebarNav items={navItems} />
        <div className="mt-auto p-3">
          <div className="rounded-lg bg-pine-700 p-3">
            <p className="truncate text-xs text-pine-100">{email}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="rounded-full bg-pine-600 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-pine-100">
                {role ?? "no role"}
              </span>
              <form action={signOut}>
                <button type="submit" className="text-xs text-pine-300 hover:text-white">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Slim sticky top bar below md */}
      <header className="sticky top-0 z-30 bg-pine-800 text-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-white">
            PRIME Ops
          </Link>
          <div className="flex items-center gap-3">
            {previewBadge}
            <form action={signOut}>
              <button type="submit" className="text-xs text-pine-300 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <TopbarNav items={navItems} />
      </header>

      {/* Content area, offset for the fixed sidebar on md+ */}
      <div className="md:ml-60">
        <main className="mx-auto w-full max-w-screen-2xl p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
