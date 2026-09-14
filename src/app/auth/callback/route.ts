import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Handles both link styles Supabase sends:
 *  - `?code=...`            → PKCE code exchange (default for the browser flow)
 *  - `?token_hash=...&type=` → email OTP verification links
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") ?? "/events";

  if (isSupabaseConfigured && (code || (tokenHash && type))) {
    const supabase = await createSupabaseServerClient();

    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash as string });

    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}