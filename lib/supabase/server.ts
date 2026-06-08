import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

// Server Components, Route Handlers, and Server Actions.
// Reads/writes the auth cookie via Next's cookies() store (ssr getAll/setAll API).
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component without a mutating context.
            // Safe to ignore; middleware refreshes the cookie on the next request.
          }
        }
      }
    }
  );
}

// Service-role client. RLS bypass. Use only in:
//   - n8n webhook handlers (server-side)
//   - admin tools where we need to read across all rows
// Never expose this to the browser.
export function createSupabaseServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );
}
