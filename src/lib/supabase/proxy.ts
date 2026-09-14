import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on every request and writes the rotated
 * cookies back onto the response. Called from `src/proxy.ts` (Next.js 16 renamed
 * `middleware.ts` to `proxy.ts`).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured) {
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Verifies the JWT (locally when the project uses asymmetric signing keys).
  // Do not replace this with getSession() — that does not revalidate the token.
  await supabase.auth.getClaims();

  return response;
}