-- ===========================================================================
-- Campus Connect — Supabase schema
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- It creates every table, indexes it, enables row level security and adds the
-- policies + triggers the app relies on.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles: one row per authenticated user, created by a trigger on sign-up.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  full_name text not null,
  avatar_url text,
  college text,
  major text,
  grad_year int check (grad_year between 2000 and 2040),
  bio text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
create policy "Profiles are readable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Students can insert their own profile" on public.profiles;
create policy "Students can insert their own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "Students can update their own profile" on public.profiles;
create policy "Students can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Create the profile row automatically when someone signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username := coalesce(
    nullif(new.raw_user_meta_data ->> 'username', ''),
    split_part(coalesce(new.email, 'student@campus.edu'), '@', 1),
    'student'
  );

  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    base_username || '_' || substr(new.id::text, 1, 4),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), base_username)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
-- ---------------------------------------------------------------------------
-- Events + RSVPs
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'Other',
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity int check (capacity is null or capacity > 0),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  constraint events_created_by_fkey foreign key (created_by) references public.profiles (id) on delete cascade
);

create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_created_by_idx on public.events (created_by);

create table if not exists public.event_rsvps (
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'going' check (status in ('going', 'interested')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index if not exists event_rsvps_user_idx on public.event_rsvps (user_id);

alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

drop policy if exists "Events are readable by everyone" on public.events;
create policy "Events are readable by everyone"
  on public.events for select using (true);

drop policy if exists "Students can create events" on public.events;
create policy "Students can create events"
  on public.events for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Authors can update their events" on public.events;
create policy "Authors can update their events"
  on public.events for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Authors can delete their events" on public.events;
create policy "Authors can delete their events"
  on public.events for delete to authenticated
  using (created_by = auth.uid());

drop policy if exists "RSVPs are readable by everyone" on public.event_rsvps;
create policy "RSVPs are readable by everyone"
  on public.event_rsvps for select using (true);

drop policy if exists "Students can RSVP for themselves" on public.event_rsvps;
create policy "Students can RSVP for themselves"
  on public.event_rsvps for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Students can cancel their own RSVP" on public.event_rsvps;
create policy "Students can cancel their own RSVP"
  on public.event_rsvps for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Clubs + memberships
-- ---------------------------------------------------------------------------
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text not null default 'Other',
  contact_email text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  constraint clubs_created_by_fkey foreign key (created_by) references public.profiles (id) on delete cascade
);

create index if not exists clubs_created_by_idx on public.clubs (created_by);

create table if not exists public.club_members (
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'admin')),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

create index if not exists club_members_user_idx on public.club_members (user_id);

alter table public.clubs enable row level security;
alter table public.club_members enable row level security;

drop policy if exists "Clubs are readable by everyone" on public.clubs;
create policy "Clubs are readable by everyone"
  on public.clubs for select using (true);

drop policy if exists "Students can create clubs" on public.clubs;
create policy "Students can create clubs"
  on public.clubs for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Club creators can update their club" on public.clubs;
create policy "Club creators can update their club"
  on public.clubs for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Club creators can delete their club" on public.clubs;
create policy "Club creators can delete their club"
  on public.clubs for delete to authenticated
  using (created_by = auth.uid());

drop policy if exists "Memberships are readable by everyone" on public.club_members;
create policy "Memberships are readable by everyone"
  on public.club_members for select using (true);

drop policy if exists "Students can join a club" on public.club_members;
create policy "Students can join a club"
  on public.club_members for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Students can leave a club" on public.club_members;
create policy "Students can leave a club"
  on public.club_members for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Teammate posts + interest pings
-- ---------------------------------------------------------------------------
create table if not exists public.teammate_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  project_type text not null default 'Hackathon',
  skills text[] not null default '{}',
  deadline timestamptz,
  contact_url text,
  is_open boolean not null default true,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  constraint teammate_posts_created_by_fkey foreign key (created_by) references public.profiles (id) on delete cascade
);

create index if not exists teammate_posts_created_by_idx on public.teammate_posts (created_by);
create index if not exists teammate_posts_is_open_idx on public.teammate_posts (is_open);

create table if not exists public.teammate_interests (
  post_id uuid not null references public.teammate_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists teammate_interests_user_idx on public.teammate_interests (user_id);

alter table public.teammate_posts enable row level security;
alter table public.teammate_interests enable row level security;

drop policy if exists "Teammate posts are readable by everyone" on public.teammate_posts;
create policy "Teammate posts are readable by everyone"
  on public.teammate_posts for select using (true);

drop policy if exists "Students can create teammate posts" on public.teammate_posts;
create policy "Students can create teammate posts"
  on public.teammate_posts for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Authors can update their teammate post" on public.teammate_posts;
create policy "Authors can update their teammate post"
  on public.teammate_posts for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Authors can delete their teammate post" on public.teammate_posts;
create policy "Authors can delete their teammate post"
  on public.teammate_posts for delete to authenticated
  using (created_by = auth.uid());

-- Interest rows are readable by signed-in students so counters stay accurate.
-- Tighten this to (user_id = auth.uid() or post author) if you want private pings.
drop policy if exists "Interest pings are readable by signed-in students" on public.teammate_interests;
create policy "Interest pings are readable by signed-in students"
  on public.teammate_interests for select to authenticated
  using (true);

drop policy if exists "Students can register interest once" on public.teammate_interests;
create policy "Students can register interest once"
  on public.teammate_interests for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Students can withdraw their interest" on public.teammate_interests;
create policy "Students can withdraw their interest"
  on public.teammate_interests for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Shared notes (metadata; the file itself lives in Storage)
-- ---------------------------------------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject text not null,
  course_code text,
  semester text,
  file_path text not null,
  file_name text not null,
  file_size bigint,
  mime_type text,
  downloads int not null default 0,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  constraint notes_created_by_fkey foreign key (created_by) references public.profiles (id) on delete cascade
);

create index if not exists notes_created_by_idx on public.notes (created_by);
create index if not exists notes_subject_idx on public.notes (subject);

alter table public.notes enable row level security;

drop policy if exists "Notes are readable by everyone" on public.notes;
create policy "Notes are readable by everyone"
  on public.notes for select using (true);

drop policy if exists "Students can share notes" on public.notes;
create policy "Students can share notes"
  on public.notes for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Authors can update their notes" on public.notes;
create policy "Authors can update their notes"
  on public.notes for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Authors can delete their notes" on public.notes;
create policy "Authors can delete their notes"
  on public.notes for delete to authenticated
  using (created_by = auth.uid());

-- Download counters: everyone may bump the number, nobody gets update rights on the row.
create or replace function public.increment_note_download(note_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.notes
     set downloads = downloads + 1
   where id = note_id;
$$;

grant execute on function public.increment_note_download(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Q&A
-- ---------------------------------------------------------------------------
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  tags text[] not null default '{}',
  created_by uuid not null,
  created_at timestamptz not null default now(),
  constraint questions_created_by_fkey foreign key (created_by) references public.profiles (id) on delete cascade
);

create index if not exists questions_created_by_idx on public.questions (created_by);
create index if not exists questions_created_at_idx on public.questions (created_at desc);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  body text not null,
  is_accepted boolean not null default false,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  constraint answers_created_by_fkey foreign key (created_by) references public.profiles (id) on delete cascade
);

create index if not exists answers_question_idx on public.answers (question_id);
create index if not exists answers_created_by_idx on public.answers (created_by);

alter table public.questions enable row level security;
alter table public.answers enable row level security;

drop policy if exists "Questions are readable by everyone" on public.questions;
create policy "Questions are readable by everyone"
  on public.questions for select using (true);

drop policy if exists "Students can ask questions" on public.questions;
create policy "Students can ask questions"
  on public.questions for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Authors can update their question" on public.questions;
create policy "Authors can update their question"
  on public.questions for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Authors can delete their question" on public.questions;
create policy "Authors can delete their question"
  on public.questions for delete to authenticated
  using (created_by = auth.uid());

drop policy if exists "Answers are readable by everyone" on public.answers;
create policy "Answers are readable by everyone"
  on public.answers for select using (true);

drop policy if exists "Students can answer questions" on public.answers;
create policy "Students can answer questions"
  on public.answers for insert to authenticated
  with check (created_by = auth.uid());

-- Only the student who asked the question can accept / unaccept an answer.
drop policy if exists "Question authors can accept answers" on public.answers;
create policy "Question authors can accept answers"
  on public.answers for update to authenticated
  using (exists (select 1 from public.questions q where q.id = answers.question_id and q.created_by = auth.uid()))
  with check (exists (select 1 from public.questions q where q.id = answers.question_id and q.created_by = auth.uid()));

drop policy if exists "Authors can delete their answer" on public.answers;
create policy "Authors can delete their answer"
  on public.answers for delete to authenticated
  using (created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: the `notes` bucket
-- Public read so shared notes are downloadable, writes restricted to the
-- uploader's own folder (`{user_id}/filename`).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('notes', 'notes', true, 10485760)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "Note files are publicly readable" on storage.objects;
create policy "Note files are publicly readable"
  on storage.objects for select
  using (bucket_id = 'notes');

drop policy if exists "Students upload notes into their own folder" on storage.objects;
create policy "Students upload notes into their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'notes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Uploaders can delete their own note files" on storage.objects;
create policy "Uploaders can delete their own note files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'notes'
    and owner = auth.uid()
  );

drop policy if exists "Uploaders can replace their own note files" on storage.objects;
create policy "Uploaders can replace their own note files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'notes'
    and owner = auth.uid()
  );