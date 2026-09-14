# Campus Connect

**A full-stack campus platform where students post events, join clubs, find teammates, share notes and answer each other's questions.**

Built end-to-end: React server components for the UI, server actions as the backend, Postgres with row-level security for the data, Supabase Auth for sessions and Supabase Storage for file uploads.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%7C%20Auth%20%7C%20Storage-3ecf8e?logo=supabase&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![CI](https://github.com/harshivkharya127-cyber/campus-connect/actions/workflows/ci.yml/badge.svg)

---

## Why this project exists

College life is scattered across WhatsApp groups, notice boards, Drive folders and Instagram stories. Campus Connect pulls the five things students actually need into one place:

| Feature | What a student can do | Route |
| --- | --- | --- |
| 📅 **Events** | Post hackathons, workshops and fests with a capacity, then RSVP in one tap | `/events` |
| 🎓 **Clubs** | Browse every society with live member counts, join or leave instantly, or start a new club | `/clubs` |
| 🤝 **Teammates** | Post what a project needs (hackathon squad, study group, research partner) and let people raise a hand | `/teammates` |
| 📝 **Notes** | Upload unit-wise PDFs to Storage, tag them by course and semester, track downloads | `/notes` |
| ❓ **Q&A** | Ask about internships, electives or exams; the asker accepts the best answer | `/qa` |
| 🙋 **Profile** | One page with everything you contributed | `/profile` |

---

## What makes it a real full-stack app

- **Authentication** — email + password sign-up with Supabase Auth, sessions stored in cookies and refreshed on every request in `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`).
- **Relational database** — ten tables (including join tables), foreign keys, check constraints, indexes and a `SECURITY DEFINER` RPC for download counters.
- **Row level security** — enabled on *every* table. Anyone can read campus content; only the owner can insert, update or delete their own rows, and only a question's author can accept an answer.
- **File uploads** — notes go to the `notes` Storage bucket under a `{user_id}/filename` prefix, with policies mirroring the table rules, a 10 MB limit, and the storage object cleaned up if the metadata insert fails.
- **Server-side validation** — every form is validated again inside a server action, so nothing can be bypassed from the browser.
- **Streaming + revalidation** — mutations call `revalidatePath()` and the updated server components stream back. No hand-written API routes, no client-side fetch code.
- **21-check smoke test** — `npm test` exercises the entire data layer (events, RSVPs, clubs, teammates, notes, Q&A, permissions, aggregates) in memory, with no database required.

---

## Quick start

```bash
git clone https://github.com/harshivkharya127-cyber/campus-connect.git
cd campus-connect
npm install
npm run dev
```

Open <http://localhost:3000>. **No configuration needed** — without environment variables the app boots into **demo mode**: a seeded campus (events, clubs, teammate posts, notes and Q&A) backed by an in-memory store, so every screen and interaction works. A banner makes it clear that nothing is persisted.

### Switch on the real database (about four minutes)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) — tables, indexes, RLS policies, the sign-up trigger and the Storage bucket.
3. Sign up once in the app, then optionally run [`supabase/seed.sql`](supabase/seed.sql) to load sample events, clubs, teammate posts and Q&A.
4. Copy the env file and paste in your project URL and publishable key:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```

5. Restart `npm run dev`. Auth, persistence and file uploads switch on automatically and the demo banner disappears.

> **Local testing tip:** in Supabase → Authentication → Sign In / Providers you can disable *Confirm email* while developing so new accounts can log in immediately. For production, add your deployed URL under Authentication → URL configuration and point redirects at `/auth/callback`.

---

## Architecture

```
┌──────────────────────────── browser ────────────────────────────┐
│  React 19 client components (forms, menus, buttons)             │
│  • useActionState + useFormStatus for pending states            │
│  • zero client-side fetch code                                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │  form submit → server action
┌───────────────────────────────▼─────────────────────────────────┐
│  Next.js 16 server (App Router, Node runtime)                   │
│                                                                 │
│  src/proxy.ts ──► refreshes the Supabase session cookie         │
│                                                                 │
│  Server Components (pages)          Server Actions (mutations)  │
│  src/app/*/page.tsx                 src/lib/actions/*.ts        │
│    │                                   │                        │
│    └──────────────┬────────────────────┘                        │
│                   ▼                                             │
│  Data layer: src/lib/data/*.ts                                  │
│  • Supabase branch  → Postgres + Storage (RLS applies)          │
│  • Demo branch      → in-memory store seeded from demo-data.ts  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ @supabase/ssr (caller's cookies)
┌───────────────────────────────▼─────────────────────────────────┐
│  Supabase: Postgres · Auth · Storage                            │
│  RLS policies on every table, owner-scoped storage objects      │
└─────────────────────────────────────────────────────────────────┘
```

## Project structure

```
campus-connect/
├── supabase/
│   ├── schema.sql              # tables, indexes, RLS, triggers, storage bucket
│   └── seed.sql                # optional sample campus content
├── scripts/
│   └── smoke-test.ts           # demo-mode data layer test (npm test)
├── src/
│   ├── proxy.ts                # session refresh on every request
│   ├── app/
│   │   ├── layout.tsx          # fonts, header, footer, metadata
│   │   ├── page.tsx            # landing page with live stats
│   │   ├── events/             # event list + hosting form
│   │   ├── clubs/              # club directory + creation form
│   │   ├── teammates/          # teammate board
│   │   ├── notes/              # note library, search, upload
│   │   ├── qa/                 # question list
│   │   │   └── [id]/           # question thread + accepted answers
│   │   ├── profile/            # your activity and profile editor
│   │   ├── about/              # architecture write-up
│   │   ├── login/ signup/      # auth screens
│   │   ├── auth/callback/      # email confirmation + PKCE exchange
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── cards/              # event, club, teammate, note, question cards
│   │   ├── forms/              # one client form per feature
│   │   ├── ui.tsx              # card, badge, avatar, stat primitives
│   │   ├── action-form.tsx     # generic one-click server-action button
│   │   ├── auth-form.tsx       # login / signup
│   │   ├── nav-links.tsx       # active-link aware navigation
│   │   └── site-header.tsx     # server header reading the session
│   └── lib/
│       ├── actions/            # server actions (validation lives here)
│       ├── data/               # data layer: Supabase ⇄ demo store
│       ├── supabase/           # browser, server and proxy clients
│       ├── env.ts              # configuration + demo-mode switch
│       ├── types.ts            # domain types and form options
│       └── utils.ts            # formatting helpers
└── .env.example
```

## Request lifecycle

1. A student submits a form — that is a React server action, not a `fetch` call.
2. The action re-validates every field, and redirects anonymous visitors to `/login`.
3. `src/lib/data/*` writes through the Supabase client bound to the caller's cookies, so RLS rules apply to the actual user.
4. `revalidatePath()` invalidates the affected pages; React streams the updated server components back.
5. If Supabase is not configured, the same functions run against the in-memory demo store instead — the UI cannot tell the difference.

---

## Database schema

Ten tables, all created by [`supabase/schema.sql`](supabase/schema.sql):

| Table | Purpose | Key columns |
| --- | --- | --- |
| `profiles` | Public student profile, auto-created on sign-up | `id → auth.users`, `username` (unique), `full_name`, `college`, `major`, `grad_year`, `bio` |
| `events` | Campus events | `title`, `category`, `starts_at`, `ends_at`, `capacity`, `created_by` |
| `event_rsvps` | Which student is going to which event | PK `(event_id, user_id)`, `status` |
| `clubs` | Club directory | `name`, `slug` (unique), `category`, `contact_email` |
| `club_members` | Club membership | PK `(club_id, user_id)`, `role ∈ {member, admin}` |
| `teammate_posts` | "Looking for a teammate" posts | `project_type`, `skills text[]`, `deadline`, `is_open` |
| `teammate_interests` | Who raised a hand | PK `(post_id, user_id)`, `message` |
| `notes` | Metadata for uploaded notes | `subject`, `course_code`, `semester`, `file_path`, `file_name`, `file_size`, `downloads` |
| `questions` | Q&A questions | `title`, `body`, `tags text[]` |
| `answers` | Replies, one of which can be accepted | `question_id`, `body`, `is_accepted` |

**Trigger** — `handle_new_user()` inserts a profile row whenever `auth.users` gains a row, deriving a unique username from the user's metadata or email.

**RPC** — `increment_note_download(note_id)` is `SECURITY DEFINER`, so any visitor can bump a download counter without being granted `UPDATE` on the row.

## Security model

- RLS is enabled on all ten tables — reads are public (it is campus content), writes never are.
- Inserts, updates and deletes are scoped to `auth.uid() = created_by` / `user_id`.
- Accepting an answer requires being the author of the parent question — enforced by both the policy and the server action.
- Storage: the `notes` bucket is publicly readable, but uploads must land in `{auth.uid()}/…` and only the uploader can delete or replace their objects.
- Sessions live in HTTP-only cookies. `src/proxy.ts` refreshes them on every request and the server verifies tokens with `getClaims()` (never `getSession()`, which is not re-validated).

## Deployment

The backend is server actions plus Supabase, so there is no separate API service to host.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/harshivkharya127-cyber/campus-connect&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY&envDescription=Supabase%20project%20URL%20and%20publishable%20key&project-name=campus-connect)

1. Push the repository to GitHub.
2. Import it into [Vercel](https://vercel.com/new) (framework preset: Next.js — no build tweaks needed).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the project's environment variables.
4. Add your deployed URL to Supabase → Authentication → URL configuration, with `https://your-app.vercel.app/auth/callback` as an allowed redirect.
5. Deploy. Any Node host works equally well (`npm run build && npm start`) — Docker, Railway, Fly.io, or a VPS.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build with type checking |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (Next.js + React Compiler rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Demo-mode data layer smoke test (21 checks) |

## Roadmap

- [ ] Realtime event comments with Supabase Realtime
- [ ] Email reminders for events a student has RSVP'd to
- [ ] Club admin dashboards (member management, announcement posts)
- [ ] Note ratings and a "most helpful" sort
- [ ] Calendar view and `.ics` export for events
- [ ] Generated Supabase types via `supabase gen types typescript`

## Design decisions & trade-offs

The UI is deliberately plain — a working product a student could have built for their own campus. The choices below are the reasons behind it.

**Colour and surfaces.** Three colours do all the work: deep navy for text and the active nav, off-white (cream) for surfaces, and one amber accent for primary buttons and highlights. Semantic tones (positive/caution/danger) exist only for status badges and messages. Every surface is flat with a 1px border — no gradients, glass blur or shadow stacks. Flat surfaces are cheaper to paint, don't shift when borders load late, and are easy to describe in a review: "navy on cream, one accent".

**A design-token CSS layer.** Instead of sprinkling raw Tailwind palette classes through components, `globals.css` defines semantic utilities (`text-ink`, `border-line`, `btn-primary`, `card`, `badge`). Components read like intent ("this is a card") rather than implementation ("rounded-xl border-slate-200 bg-white shadow-sm"). Re-theming or dark mode later means editing one layer, not thirty files.

**Density over decoration.** Cards are left-aligned, compact and information-first: what, where, when, how full, posted how long ago. Feature cards use small line icons rather than emoji or illustrations, because icons inherit text colour and stay quiet on every screen.

**Language.** Copy is written the way students talk ("Host one for your club", "your juniors will thank you") rather than the way libraries document themselves. Technical vocabulary (RLS, buckets, server actions) is confined to the About page and this README, where someone deciding whether to clone the repo actually needs it.

**States are first-class.** Every listing route has a `loading.tsx` skeleton that mirrors the real card grid (no layout jump), an empty state whose button scrolls to the create form, and a route-level `error.tsx` with a retry button and the error digest shown as a reference code. Destructive actions require a second, explicit confirmation with a visible way out — implemented once in `ActionForm` (arm → "Yes, delete" / "Keep it") rather than per page.

**Accessibility.** Visible `:focus-visible` rings everywhere via one CSS rule, a skip-to-content link, `aria-current="page"` on the active nav item, `aria-expanded`/`aria-controls` on the mobile menu, `role="status"`/`role="alert"` on form feedback, and `aria-label` on skeleton regions. The active nav item is a filled pill, so location never depends on colour alone. All interactive targets are real buttons or links — keyboard navigation works without extra code.

**Trade-offs worth defending in a review:**
- *Demo mode duplicates the data layer.* Running without Supabase needs an in-memory store that mirrors the real queries. It's extra code, but it makes the repo instantly explorable and doubles as an integration test fixture (`npm test` runs against it with no database).
- *Server components + server actions instead of an API layer.* No `fetch`-from-own-API round trip, no client state management library. The cost is that mutations must go through forms/actions rather than ad-hoc client code — which here is a feature, because every mutation is validated server-side.
- *`timeAgo` rather than a date library.* ~15 lines covers just-now → years, keeps the bundle free of a dependency, and the exact strings are pinned by unit tests.
- *One shared `ListSkeleton`* instead of per-route bespoke skeletons: slightly less precise, much less code to explain.

## License



MIT — use it, fork it, put your own campus's name on it.

---

Built by [Harshiv Kharya](https://github.com/harshivkharya127-cyber) as a flagship full-stack project. Issues and pull requests are welcome.
