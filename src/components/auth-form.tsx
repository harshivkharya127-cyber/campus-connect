"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { TextField } from "@/components/fields";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Email + password auth. Runs entirely on the browser client so Supabase writes
 * the session cookie that the server then reads (`src/proxy.ts` refreshes it).
 */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("fullName") ?? "").trim();

    if (password.length < 8) {
      setFeedback({ ok: false, text: "Password must be at least 8 characters." });
      return;
    }
    if (mode === "signup" && fullName.length < 2) {
      setFeedback({ ok: false, text: "Please enter your full name." });
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username: fullName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "")
                .slice(0, 24),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

        if (!data.session) {
          setFeedback({ ok: true, text: "Almost there — confirm your email address, then log in." });
          setPending(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      router.push("/events");
      router.refresh();
    } catch (error) {
      setFeedback({ ok: false, text: error instanceof Error ? error.message : "Something went wrong." });
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" ? (
        <TextField label="Full name" name="fullName" placeholder="Aditi Rao" required autoComplete="name" maxLength={80} />
      ) : null}
      <TextField
        label="College email"
        name="email"
        type="email"
        placeholder="you@campus.edu"
        required
        autoComplete="email"
        maxLength={160}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        placeholder="At least 8 characters"
        required
        minLength={8}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
      />

      {feedback ? (
        <p
          className={
            feedback.ok
              ? "rounded-md border border-positive/25 bg-positive/5 px-3.5 py-2.5 text-meta text-positive"
              : "rounded-md border border-danger/25 bg-danger/5 px-3.5 py-2.5 text-meta text-danger"
          }
          role={feedback.ok ? "status" : "alert"}
        >
          {feedback.text}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="link">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="link">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}