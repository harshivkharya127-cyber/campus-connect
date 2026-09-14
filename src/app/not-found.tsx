import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="text-sm font-semibold tracking-widest text-accent-700 uppercase">404</p>
      <h1 className="mt-3 text-3xl font-bold text-navy-900">That page graduated</h1>
      <p className="mt-3 text-sm text-ink-muted">
        The link you followed does not exist — the event may have been deleted, or the URL has a typo.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary px-5 py-3">
          Back home
        </Link>
        <Link href="/events" className="btn-quiet px-5 py-3">
          Browse events
        </Link>
      </div>
    </div>
  );
}