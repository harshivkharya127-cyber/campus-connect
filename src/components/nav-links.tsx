"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/events", label: "Events" },
  { href: "/clubs", label: "Clubs" },
  { href: "/teammates", label: "Teammates" },
  { href: "/notes", label: "Notes" },
  { href: "/qa", label: "Q&A" },
];

export function NavLinks({
  isSignedIn,
  userName,
  signOut,
}: {
  isSignedIn: boolean;
  userName: string | null;
  signOut: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Shared link styles: the current section is a solid navy pill, so location
  // is communicated by more than colour (helps colour-blind users too).
  const desktopLink = (active: boolean) =>
    cn(
      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
      active ? "bg-navy-900 text-cream-50" : "text-navy-800 hover:bg-cream-200/70 hover:text-navy-900",
    );
  const mobileLink = (active: boolean) =>
    cn(
      "rounded-md px-3 py-2.5 text-sm font-medium",
      active ? "bg-navy-900 text-cream-50" : "text-navy-800 hover:bg-cream-200/70",
    );

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={desktopLink(isActive(item.href))} aria-current={isActive(item.href) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        {isSignedIn ? (
          <>
            <Link href="/profile" className="chip hover:border-navy-600/40">
              {userName ?? "My profile"}
            </Link>
            {signOut}
          </>
        ) : (
          <>
            <Link href="/login" className="btn-quiet px-3.5 py-2">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary px-3.5 py-2">
              Join campus
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn-quiet px-3 py-2 md:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close navigation" : "Open navigation"}
      >
        {open ? "Close" : "Menu"}
      </button>

      {open ? (
        <div id="mobile-nav" className="absolute top-full right-0 left-0 z-40 border-b border-line bg-cream-50 px-4 pt-2 pb-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={mobileLink(isActive(item.href))}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isSignedIn ? (
              <>
                <Link href="/profile" className="btn-quiet px-3.5 py-2" onClick={() => setOpen(false)}>
                  My profile
                </Link>
                {signOut}
              </>
            ) : (
              <>
                <Link href="/login" className="btn-quiet px-3.5 py-2" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link href="/signup" className="btn-primary px-3.5 py-2" onClick={() => setOpen(false)}>
                  Join campus
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}