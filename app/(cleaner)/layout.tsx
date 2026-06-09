import Link from "next/link";
import { signOut } from "@/app/(auth)/login/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Mobile-first shell for the cleaner portal. Cleaners are usually on a phone,
// in a hurry, so the chrome stays minimal: wordmark, two tabs, sign out.
export default async function CleanerLayout({ children }: { children: React.ReactNode }) {
  const previewMode = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";
  let email: string | null = null;

  if (!previewMode) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email ?? null;
  } else {
    email = "preview@local";
  }

  return (
    <div className="flex min-h-screen flex-col bg-prime-paper">
      <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-screen-sm items-center justify-between gap-3 px-4 py-3">
          <Link href="/cleaner/jobs" className="text-sm font-semibold tracking-tight text-prime-ink">
            PRIME Cleaner
          </Link>
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            {previewMode ? (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                Preview
              </span>
            ) : null}
            {email ? <span className="hidden truncate sm:inline">{email}</span> : null}
            <form action={signOut}>
              <button type="submit" className="text-xs text-neutral-600 hover:text-neutral-900">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-screen-sm items-center gap-1 px-4 pb-2 text-sm">
          <Link
            href="/cleaner/jobs"
            className="rounded-md px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
          >
            Jobs
          </Link>
          <Link
            href="/cleaner/history"
            className="rounded-md px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
          >
            History
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-screen-sm flex-1 px-4 py-5">{children}</main>
    </div>
  );
}
