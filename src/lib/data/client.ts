import { isSupabaseConfigured } from "@/lib/env";

/**
 * Returns a Supabase server client, or `null` when the app runs in demo mode.
 * Every data function in `src/lib/data/*` uses this pattern:
 *
 *   const supabase = await getSupabase();
 *   if (!supabase) return demoImplementation();
 *   return supabaseImplementation();
 *
 * The client is imported lazily so demo-mode data functions can run outside a
 * Next.js request (for example in `npm test`).
 */
export async function getSupabase() {
  if (!isSupabaseConfigured) return null;
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  return createSupabaseServerClient();
}

export { isSupabaseConfigured };