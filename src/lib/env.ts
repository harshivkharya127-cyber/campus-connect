/**
 * Central place where the app reads its Supabase configuration.
 *
 * Both variables are `NEXT_PUBLIC_*` because the browser client needs them too.
 * Supabase migrated from "anon key" to "publishable key" naming, so we accept both.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/**
 * When Supabase is not configured the app boots into **demo mode**:
 * it renders fully with a seeded in-memory dataset (and clearly says so in the UI)
 * so anyone cloning the repo can explore every screen without a database.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Storage bucket used by the "share notes" feature. */
export const NOTE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_NOTE_BUCKET ?? "notes";

/** Hard limit for uploaded note files (10 MB). */
export const MAX_NOTE_FILE_BYTES = 10 * 1024 * 1024;

export const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/harshivkharya127-cyber/campus-connect";