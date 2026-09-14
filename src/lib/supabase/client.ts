import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

/**
 * Supabase client for Client Components (browser).
 * Reads/writes the auth session from cookies so SSR and the browser stay in sync.
 */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local",
    );
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}