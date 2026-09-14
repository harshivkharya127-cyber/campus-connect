-- ===========================================================================
-- Campus Connect — optional sample content
--
-- Run this AFTER schema.sql and AFTER at least one student has signed up.
-- Every row is attributed to the earliest registered profile, because the
-- foreign keys point at real auth users.
--
-- Notes are deliberately not seeded: their files have to exist in Storage,
-- and the app creates both the object and the row when a student uploads.
-- ===========================================================================

do $$
declare
  seed_user uuid;
begin
  select id into seed_user from public.profiles order by created_at limit 1;

  if seed_user is null then
    raise notice 'No profiles found yet — sign up in the app first, then re-run this file.';
    return;
  end if;

  -- ---------------------------------------------------------------- events --
  insert into public.events (id, title, description, category, location, starts_at, ends_at, capacity, created_by)
  values
    ('11111111-1111-4111-8111-111111111101',
     'HackSprint 2026 — 36 hour campus hackathon',
     'Build anything in 36 hours: web, mobile, hardware or ML. Mentors from four alumni startups, free meals, and prizes for the top three teams.',
     'Tech', 'Innovation Lab, Block C', now() + interval '3 days', now() + interval '4 days', 120, seed_user),
    ('11111111-1111-4111-8111-111111111102',
     'Resume & LinkedIn clinic with alumni',
     'Bring a printed resume. Twenty alumni review it live and run 15-minute mock interview rounds.',
     'Career', 'Seminar Hall 2', now() + interval '2 days', now() + interval '2 days 3 hours', 60, seed_user),
    ('11111111-1111-4111-8111-111111111103',
     'DSA Study Jam: graphs & dynamic programming',
     'Whiteboard-first session: five graph problems and four DP patterns. Bring a notebook.',
     'Academic', 'Library Discussion Room 4', now() + interval '1 day', now() + interval '1 day 2 hours', 30, seed_user),
    ('11111111-1111-4111-8111-111111111104',
     'Rangmanch — spring cultural night',
     'Live bands, the dance society showcase, slam poetry and a student-run food street.',
     'Cultural', 'Open Air Theatre', now() + interval '9 days', now() + interval '9 days 4 hours', 400, seed_user),
    ('11111111-1111-4111-8111-111111111105',
     'Inter-college basketball trials',
     'Selection trials for the men''s and women''s squads. Arrive 15 minutes early with your ID card.',
     'Sports', 'Main Court', now() + interval '5 days', now() + interval '5 days 2 hours', 40, seed_user),
    ('11111111-1111-4111-8111-111111111106',
     'Startup pitch night with local founders',
     'Six student teams pitch to founders and angel investors. Spectators welcome, networking dinner after.',
     'Career', 'Auditorium A', now() + interval '12 days', now() + interval '12 days 3 hours', 150, seed_user)
  on conflict (id) do nothing;

  -- ----------------------------------------------------------------- clubs --
  insert into public.clubs (id, name, slug, description, category, contact_email, created_by)
  values
    ('22222222-2222-4222-8222-222222222201', 'CodeCrafters — Programming Club', 'codecrafters',
     'Weekly build sessions, competitive programming ladders and the team behind HackSprint.',
     'Technology', 'codecrafters@campus.edu', seed_user),
    ('22222222-2222-4222-8222-222222222202', 'Robotics & Embedded Guild', 'robotics-guild',
     'Line followers, drones and an annual bot-wars arena, plus PCB design workshops.',
     'Technology', 'robotics@campus.edu', seed_user),
    ('22222222-2222-4222-8222-222222222203', 'Rhythm — Music & Dance Society', 'rhythm',
     'Six practice rooms, a twelve-piece band and the loudest cultural night on campus.',
     'Arts', 'rhythm@campus.edu', seed_user),
    ('22222222-2222-4222-8222-222222222204', 'Campus Sustainability Collective', 'sustainability-collective',
     'Composting, e-waste drives, a rooftop solar audit and a bicycle-share pilot.',
     'Social impact', 'green@campus.edu', seed_user),
    ('22222222-2222-4222-8222-222222222205', 'E-Cell — Entrepreneurship Cell', 'e-cell',
     'Idea validation sprints, a seed micro-grant, founder office hours and the annual pitch night.',
     'Entrepreneurship', 'ecell@campus.edu', seed_user)
  on conflict (id) do nothing;

  insert into public.club_members (club_id, user_id, role)
  values
    ('22222222-2222-4222-8222-222222222201', seed_user, 'member'),
    ('22222222-2222-4222-8222-222222222205', seed_user, 'member')
  on conflict (club_id, user_id) do nothing;

  -- ----------------------------------------------------------------- RSVPs --
  insert into public.event_rsvps (event_id, user_id, status)
  values
    ('11111111-1111-4111-8111-111111111101', seed_user, 'going'),
    ('11111111-1111-4111-8111-111111111102', seed_user, 'going')
  on conflict (event_id, user_id) do nothing;

  -- ------------------------------------------------------ teammate posts --
  insert into public.teammate_posts (id, title, description, project_type, skills, deadline, contact_url, created_by)
  values
    ('33333333-3333-4333-8333-333333333301',
     'Need a frontend dev for Smart India Hackathon',
     'We have the problem statement (smart campus navigation) and two backend folks. Looking for someone comfortable with React and maps.',
     'Hackathon', array['React', 'TypeScript', 'Tailwind CSS'], now() + interval '10 days', null, seed_user),
    ('33333333-3333-4333-8333-333333333302',
     'Building a campus marketplace — looking for a backend partner',
     'MVP is already on Supabase: listings, chat, a payments stub. Need someone who enjoys Postgres, RLS and edge functions.',
     'Startup', array['Node.js', 'Postgres', 'Supabase'], now() + interval '21 days', null, seed_user),
    ('33333333-3333-4333-8333-333333333303',
     'Study group: DBMS + Operating Systems finals',
     'Five people, twice a week, library room 4. We solve past papers under time and explain every answer out loud.',
     'Study group', array['DBMS', 'Operating Systems'], now() + interval '30 days', null, seed_user),
    ('33333333-3333-4333-8333-333333333304',
     'Research help: computer-vision attendance system',
     'Faculty-backed project on low-light face recognition for classroom attendance. Co-authorship possible.',
     'Research', array['Python', 'PyTorch', 'OpenCV'], now() + interval '45 days', null, seed_user)
  on conflict (id) do nothing;

  insert into public.teammate_interests (post_id, user_id, message)
  values ('33333333-3333-4333-8333-333333333301', seed_user, 'I can take the maps integration.')
  on conflict (post_id, user_id) do nothing;

  -- ------------------------------------------------------------------- Q&A --
  insert into public.questions (id, title, body, tags, created_by)
  values
    ('44444444-4444-4444-8444-444444444401',
     'How do I start preparing for summer internships in second year?',
     'I know basic C++ and some HTML/CSS. Applications open around December and I feel behind. What should the next 90 days look like?',
     array['internships', 'career', 'dsa'], seed_user),
    ('44444444-4444-4444-8444-444444444402',
     'Best way to learn React with TypeScript in 2026?',
     'Every tutorial is either React-with-JS or dives straight into advanced generics. I want a path that ends in a deployed project.',
     array['react', 'typescript', 'learning'], seed_user),
    ('44444444-4444-4444-8444-444444444403',
     'How do I get funding approved for a student club event?',
     'We want to host a two-day robotics workshop and need roughly 18k for kits and refreshments. Which office approves it?',
     array['clubs', 'funding', 'events'], seed_user)
  on conflict (id) do nothing;

  insert into public.answers (id, question_id, body, is_accepted, created_by)
  values
    ('55555555-5555-4555-8555-555555555501',
     '44444444-4444-4444-8444-444444444401',
     'Do all three, in this order: eight weeks of DSA, one full-stack project you can demo in five minutes, then apply everywhere in December — startups included.',
     true, seed_user),
    ('55555555-5555-4555-8555-555555555502',
     '44444444-4444-4444-8444-444444444401',
     'Fix your resume now rather than in November: one page, projects above coursework, every bullet backed by a number.',
     false, seed_user),
    ('55555555-5555-4555-8555-555555555503',
     '44444444-4444-4444-8444-444444444402',
     'Read the official React docs once, then build with create-next-app + TypeScript + Tailwind and deploy the same week so the feedback loop is real.',
     true, seed_user),
    ('55555555-5555-4555-8555-555555555504',
     '44444444-4444-4444-8444-444444444403',
     'Submit the proposal to the Student Activities Office at least 21 days ahead with a budget table, attendance estimate and your faculty advisor''s signature.',
     true, seed_user)
  on conflict (id) do nothing;

  raise notice 'Seeded Campus Connect sample content for profile %', seed_user;
end
$$;