/**
 * Demo-mode smoke test.
 *
 * Exercises the whole data layer against the in-memory demo store, so it runs
 * without a database: `npm test`.
 */

import { createClub, listClubs, toggleClubMembership } from "@/lib/data/clubs";
import { DEMO_USER } from "@/lib/data/demo-store";
import { createEvent, getCampusStats, listEvents, toggleEventRsvp } from "@/lib/data/events";
import { createNote, listNotes, recordNoteDownload } from "@/lib/data/notes";
import { acceptAnswer, createAnswer, createQuestion, getQuestionThread } from "@/lib/data/qa";
import { createTeammatePost, expressInterest, listTeammatePosts, setTeammatePostOpen } from "@/lib/data/teammates";
import { formatFileSize, parseTags, slugify, timeAgo } from "@/lib/utils";

let failures = 0;

function check(label: string, condition: boolean, detail = ""): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    return;
  }
  failures += 1;
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

function section(title: string): void {
  console.log(`\n${title}`);
}

async function main(): Promise<void> {
  section("Utilities");
  check("slugify normalises a club name", slugify("  AI & ML Club!!  ") === "ai-ml-club", slugify("  AI & ML Club!!  "));
  check("parseTags splits, trims and de-duplicates", parseTags("#react, react, TypeScript").join("|") === "react|TypeScript");
  check("formatFileSize renders megabytes", formatFileSize(1_258_291) === "1.2 MB", formatFileSize(1_258_291));
  check("timeAgo handles a fresh timestamp", timeAgo(new Date()).includes("just now") || timeAgo(new Date()).includes("m ago"));

  section("Events + RSVPs");
  const events = await listEvents(DEMO_USER.id);
  check("seeded events are listed", events.length >= 6, `got ${events.length}`);

  const target = events[0];
  const nowJoined = await toggleEventRsvp(target.id, DEMO_USER.id);
  const afterToggle = (await listEvents(DEMO_USER.id)).find((event) => event.id === target.id);
  check("RSVP toggles the viewer's state", afterToggle?.joined === nowJoined);
  check(
    "RSVP count moves with the toggle",
    afterToggle?.rsvp_count === target.rsvp_count + (nowJoined ? 1 : -1),
    `${target.rsvp_count} → ${afterToggle?.rsvp_count}`,
  );

  const newEventId = await createEvent(
    {
      title: "Smoke test study session",
      description: "Created by the smoke test.",
      category: "Academic",
      location: "Library",
      startsAt: new Date(Date.now() + 86_400_000).toISOString(),
      endsAt: null,
      capacity: 20,
    },
    DEMO_USER.id,
  );
  check("created event shows up in the list", (await listEvents(DEMO_USER.id)).some((event) => event.id === newEventId));

  section("Clubs + memberships");
  const clubId = await createClub(
    { name: "Smoke Test Club", description: "Temporary club", category: "Technology", contactEmail: "smoke@campus.edu" },
    DEMO_USER.id,
  );
  const createdClub = (await listClubs(DEMO_USER.id)).find((club) => club.id === clubId);
  check("creator becomes the first member", createdClub?.member_count === 1 && createdClub?.joined === true);
  await toggleClubMembership(clubId, DEMO_USER.id);
  check(
    "membership can be toggled off",
    (await listClubs(DEMO_USER.id)).find((club) => club.id === clubId)?.member_count === 0,
  );

  section("Teammate posts");
  const postId = await createTeammatePost(
    {
      title: "Smoke test: need a designer",
      description: "Temporary post",
      projectType: "Hackathon",
      skills: ["Figma", "React"],
      deadline: null,
      contactUrl: null,
    },
    DEMO_USER.id,
  );
  await expressInterest(postId, "user-priya", "Happy to help!");
  await expressInterest(postId, "user-priya", "a duplicate should be ignored");
  const post = (await listTeammatePosts(DEMO_USER.id)).find((row) => row.id === postId);
  check("interest is counted once per student", post?.interest_count === 1, `got ${post?.interest_count}`);
  await setTeammatePostOpen(postId, DEMO_USER.id, false);
  check(
    "author can close their post",
    (await listTeammatePosts(DEMO_USER.id)).find((row) => row.id === postId)?.is_open === false,
  );

  section("Notes + uploads");
  const file = new File([new Uint8Array(2048)], "smoke-notes.pdf", { type: "application/pdf" });
  const upload = await createNote(
    {
      title: "Smoke test notes",
      description: null,
      subject: "Computer Science",
      courseCode: "CS999",
      semester: "Semester 1",
    },
    file,
    DEMO_USER.id,
  );
  check("demo mode reports that storage is not used", upload.storedInSupabase === false);
  const note = (await listNotes("smoke test")).find((row) => row.title === "Smoke test notes");
  check("note is discoverable through search", Boolean(note));
  check("file metadata is stored", note?.file_name === "smoke-notes.pdf" && note?.file_size === 2048);
  await recordNoteDownload(note!.id);
  check("download counter increments", (await listNotes()).find((row) => row.id === note?.id)?.downloads === 1);

  section("Questions + answers");
  const questionId = await createQuestion(
    {
      title: "Smoke test question about lab slots?",
      body: "This body is long enough to pass validation.",
      tags: ["smoke"],
    },
    DEMO_USER.id,
  );
  await createAnswer(questionId, "An answer body that is long enough.", "user-priya");
  const thread = await getQuestionThread(questionId);
  check("answer is attached to the question", thread?.question.answer_count === 1);
  await acceptAnswer(thread!.answers[0].id, DEMO_USER.id);
  check("the asker can accept an answer", (await getQuestionThread(questionId))!.answers[0].is_accepted === true);

  const foreignThread = await getQuestionThread("q-learn-react-ts");
  const foreignAnswer = foreignThread!.answers.find((answer) => !answer.is_accepted)!;
  await acceptAnswer(foreignAnswer.id, DEMO_USER.id);
  check(
    "a non-author cannot accept an answer",
    (await getQuestionThread("q-learn-react-ts"))!.answers.find((answer) => answer.id === foreignAnswer.id)?.is_accepted ===
      false,
  );

  section("Aggregates");
  const stats = await getCampusStats();
  check("stats include the new event", stats.events >= 7, `events: ${stats.events}`);
  check("stats include RSVPs", stats.rsvps > 0, `rsvps: ${stats.rsvps}`);

  console.log(failures === 0 ? "\nAll demo-mode checks passed ✅\n" : `\n${failures} check(s) failed ❌\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});