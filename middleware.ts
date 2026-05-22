import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";
import { decideRoute, extractRole } from "@/lib/auth/roles";

// Preview mode: bypass Supabase auth and treat every visitor as ops. Used to
// view the UI before Supabase is fully wired. NEVER enable in production.
const PREVIEW_MODE = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  if (PREVIEW_MODE) {
    const decision = decideRoute(req.nextUrl.pathname, "ops");
    if (decision.kind === "redirect") {
      return NextResponse.redirect(new URL(decision.to, req.url));
    }
    return res;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: "", ...options });
          res = NextResponse.next({ request: { headers: req.headers } });
          res.cookies.set({ name, value: "", ...options });
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const role = extractRole(user);
  const decision = decideRoute(req.nextUrl.pathname, role);

  if (decision.kind === "redirect") {
    return NextResponse.redirect(new URL(decision.to, req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"
  ]
};
