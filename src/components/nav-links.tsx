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

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive(item.href) ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        {isSignedIn ? (
          <>
            <Link href="/profile" className="chip hover:border-brand-400/40">
              {userName ?? "My profile"}
            </Link>
            {signOut}
          </>
        ) : (
          <>
            <Link href="/login" className="btn-ghost px-3.5 py-2">
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
        className="btn-ghost px-3 py-2 md:hidden"
        aria-expanded={open}
        aria-label="Toggle navigation"
      >
        {open ? "Close" : "Menu"}
      </button>

      {open ? (
        <div className="absolute top-full right-0 left-0 z-40 border-b border-white/10 bg-ink-950/95 px-4 pt-2 pb-4 backdrop-blur md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  isActive(item.href) ? "bg-white/10 text-white" : "text-slate-300",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isSignedIn ? (
              <>
                <Link href="/profile" className="btn-ghost px-3.5 py-2" onClick={() => setOpen(false)}>
                  My profile
                </Link>
                {signOut}
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost px-3.5 py-2" onClick={() => setOpen(false)}>
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