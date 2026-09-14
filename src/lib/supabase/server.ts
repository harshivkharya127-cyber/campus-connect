import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * `cookies()` is async in Next.js 15+/16, hence the async factory.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
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
          /* Called from a Server Component — the proxy refreshes the session instead. */
        }
      },
    },
  });
}