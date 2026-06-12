import Link from "next/link";
import { signOut } from "@/app/(auth)/login/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function BrandHostLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex min-h-screen flex-col bg-cream-100">
      <header className="bg-pine-800 text-pine-100">
        <div className="mx-auto flex w-full max-w-screen-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-5">
            <Link href="/bh/shifts" className="text-sm font-semibold tracking-tight text-white">
              PRIME Brand Host
            </Link>
            <nav className="hidden items-center gap-1 text-sm sm:flex">
              <Link href="/bh/shifts" className="rounded-lg px-3 py-1.5 text-pine-300 hover:bg-pine-700 hover:text-white">Shifts</Link>
              <Link href="/bh/my-shifts" className="rounded-lg px-3 py-1.5 text-pine-300 hover:bg-pine-700 hover:text-white">My shifts</Link>
              <Link href="/bh/reports/new" className="rounded-lg px-3 py-1.5 text-pine-300 hover:bg-pine-700 hover:text-white">New report</Link>
              <Link href="/bh/reports" className="rounded-lg px-3 py-1.5 text-pine-300 hover:bg-pine-700 hover:text-white">My reports</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-xs text-pine-300">
            {previewMode ? (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
                Preview mode
              </span>
            ) : null}
            <span className="hidden sm:inline">{email}</span>
            <form action={signOut}>
              <button type="submit" className="text-xs text-pine-300 hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-screen-md items-center gap-1 overflow-x-auto px-4 pb-2 text-sm sm:hidden">
          <Link href="/bh/shifts" className="shrink-0 rounded-lg px-3 py-1.5 text-pine-300 hover:bg-pine-700 hover:text-white">Shifts</Link>
          <Link href="/bh/my-shifts" className="shrink-0 rounded-lg px-3 py-1.5 text-pine-300 hover:bg-pine-700 hover:text-white">My shifts</Link>
          <Link href="/bh/reports/new" className="shrink-0 rounded-lg px-3 py-1.5 text-pine-300 hover:bg-pine-700 hover:text-white">New report</Link>
          <Link href="/bh/reports" className="shrink-0 rounded-lg px-3 py-1.5 text-pine-300 hover:bg-pine-700 hover:text-white">My reports</Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-screen-md flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
