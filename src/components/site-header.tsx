import Link from "next/link";

import { DemoModeBanner, Logo } from "@/components/chrome";
import { NavLinks } from "@/components/nav-links";
import { SubmitButton } from "@/components/submit-button";
import { signOutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/data/auth";

/** Server component: reads the session, then hands off to the client nav for menu state. */
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream-50">
      <DemoModeBanner />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <NavLinks
            isSignedIn={Boolean(user)}
            userName={user?.fullName ?? null}
            signOut={
              <form action={signOutAction}>
                <SubmitButton className="btn-quiet px-3.5 py-2" pendingText="Signing out…">
                  Sign out
                </SubmitButton>
              </form>
            }
          />
        </div>
      </div>
    </header>
  );
}