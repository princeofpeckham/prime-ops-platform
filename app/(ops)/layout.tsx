import Link from "next/link";
import { signOut } from "@/app/(auth)/login/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { extractRole } from "@/lib/auth/roles";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const previewMode = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";
  let role: string | null = null;
  let email: string | null = null;

  if (!previewMode) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    role = extractRole(user);
    email = user?.email ?? null;
  } else {
    role = "ops";
    email = "preview@local";
  }

  return (
    <div className="flex min-h-screen flex-col bg-prime-paper">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-prime-ink">
              PRIME Ops
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-neutral-600 md:flex">
              <Link href="/dashboard" className="hover:text-neutral-900">Command Centre</Link>
              <Link href="/inbox" className="hover:text-neutral-900">Inbox</Link>
              <Link href="/calendar" className="hover:text-neutral-900">Calendar</Link>
              <Link href="/shifts" className="hover:text-neutral-900">Shifts</Link>
              <Link href="/cleaning" className="hover:text-neutral-900">Cleaning</Link>
              <Link href="/reports" className="hover:text-neutral-900">Reports</Link>
              <Link href="/flags" className="hover:text-neutral-900">Flags</Link>
              <Link href="/vendors" className="hover:text-neutral-900">Vendors</Link>
              <Link href="/deposits" className="hover:text-neutral-900">Deposits</Link>
              <Link href="/invoices" className="hover:text-neutral-900">Invoices</Link>
              <Link href="/analytics" className="hover:text-neutral-900">Analytics</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            {previewMode ? (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                Preview mode
              </span>
            ) : null}
            <span className="hidden sm:inline">{email}</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-700">
              {role ?? "no role"}
            </span>
            <form action={signOut}>
              <button type="submit" className="text-xs text-neutral-600 hover:text-neutral-900">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-6 py-6">{children}</main>
    </div>
  );
}
