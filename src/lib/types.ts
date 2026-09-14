/**
 * Domain types for Campus Connect.
 *
 * These mirror the SQL schema in `supabase/schema.sql`. Once your Supabase project
 * is live you can regenerate them with:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 */

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialActionState: ActionState = { ok: false };

export type AppUser = {
  id: string;
  email: string | null;
  fullName: string;
  username: string;
  avatarUrl: string | null;
};

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  college: string | null;
  major: string | null;
  grad_year: number | null;
  bio: string | null;
  created_at: string;
};

export type CampusEvent = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  created_by: string;
  created_at: string;
  author_name: string | null;
  rsvp_count: number;
  joined: boolean;
};

export type Club = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  contact_email: string | null;
  created_by: string;
  created_at: string;
  member_count: number;
  joined: boolean;
};

export type TeammatePost = {
  id: string;
  title: string;
  description: string | null;
  project_type: string;
  skills: string[];
  deadline: string | null;
  contact_url: string | null;
  is_open: boolean;
  created_by: string;
  created_at: string;
  author_name: string | null;
  interest_count: number;
  interested: boolean;
};

export type Note = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  course_code: string | null;
  semester: string | null;
  file_name: string;
  file_size: number | null;
  file_url: string | null;
  created_by: string;
  created_at: string;
  author_name: string | null;
  downloads: number;
};

export type Question = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  created_by: string;
  created_at: string;
  author_name: string | null;
  answer_count: number;
};

export type Answer = {
  id: string;
  question_id: string;
  body: string;
  is_accepted: boolean;
  created_by: string;
  created_at: string;
  author_name: string | null;
};

export const EVENT_CATEGORIES = [
  "Academic",
  "Tech",
  "Cultural",
  "Sports",
  "Career",
  "Social",
  "Other",
] as const;

export const CLUB_CATEGORIES = [
  "Technology",
  "Arts",
  "Sports",
  "Academic",
  "Social impact",
  "Entrepreneurship",
  "Other",
] as const;

export const PROJECT_TYPES = [
  "Hackathon",
  "Startup",
  "Study group",
  "Research",
  "Side project",
] as const;

export const SEMESTERS = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"] as const;