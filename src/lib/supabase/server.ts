import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server client bound to the request cookies (respects RLS and the
 * signed-in user, used for admin pages and auth checks).
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore when
            // middleware refreshes sessions.
          }
        },
      },
    },
  );
}
