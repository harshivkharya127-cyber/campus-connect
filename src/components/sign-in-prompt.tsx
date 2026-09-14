import Link from "next/link";

/** Shown in place of a create-form when nobody is signed in. */
export function SignInPrompt({ message }: { message: string }) {
  return (
    <div className="space-y-4 text-sm text-ink-muted">
      <p>{message}</p>
      <div className="flex flex-wrap gap-2">
        <Link href="/login" className="btn-primary px-4 py-2.5">
          Log in
        </Link>
        <Link href="/signup" className="btn-quiet px-4 py-2.5">
          Create an account
        </Link>
      </div>
    </div>
  );
}