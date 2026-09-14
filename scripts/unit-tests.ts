/**
 * Unit tests for the formatting helpers that render user-facing strings
 * (timestamps, avatars, file sizes) and for form validation plumbing.
 * Pure functions — no database, run anywhere. `npm test` runs this file
 * followed by the data-layer smoke test.
 */
import { firstError, formatFileSize, initials, parseTags, timeAgo } from "../src/lib/utils";

let failures = 0;
let checks = 0;

function check(name: string, condition: boolean, detail?: string) {
  checks += 1;
  if (condition) {
    console.log(`  ✓ ${name}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` (${detail})` : ""}`);
  }
}

function section(title: string) {
  console.log(`\n${title}`);
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000);
}

section("Relative timestamps");
check("a note posted 2 hours ago reads “2h ago”", timeAgo(minutesAgo(120)) === "2h ago", timeAgo(minutesAgo(120)));
check("a post from seconds ago reads “just now”", timeAgo(new Date(Date.now() - 5_000)) === "just now");
check("a 3-day-old answer reads “3d ago”", timeAgo(minutesAgo(3 * 24 * 60)) === "3d ago", timeAgo(minutesAgo(3 * 24 * 60)));
check("a club founded 2 years ago reads “2y ago”", timeAgo(minutesAgo(2 * 365 * 24 * 60)) === "2y ago", timeAgo(minutesAgo(2 * 365 * 24 * 60)));
check("future timestamps don't crash (renders as just now)", timeAgo(new Date(Date.now() + 60_000)) === "just now");

section("Avatar initials fallback");
check("“Aditi Rao” renders as AR", initials("Aditi Rao") === "AR");
check("a single-word name uses its first letter", initials("priya") === "P", initials("priya"));
check("extra whitespace is ignored", initials("  Ravi   Kumar ") === "RK");

section("File sizes and tags");
check("a 2 MB upload shows as “2.0 MB”", formatFileSize(2 * 1024 * 1024) === "2.0 MB", formatFileSize(2 * 1024 * 1024));
check("a 512 KB PDF stays human-readable", formatFileSize(512 * 1024) === "512 KB", formatFileSize(512 * 1024));
check("tags survive messy input", JSON.stringify(parseTags(" webdev ,  hackathon,, ")) === JSON.stringify(["webdev", "hackathon"]));
check("empty tag input yields no tags", parseTags(null).length === 0);

section("Form validation plumbing");
check(
  "first validation error wins, blanks are skipped",
  firstError([null, "Ends must be after starts.", "Another issue"]) === "Ends must be after starts.",
);
check("no errors means no message", firstError([null, undefined]) === undefined);

console.log(failures === 0 ? `\nAll ${checks} unit checks passed ✅` : `\n${failures} of ${checks} unit checks failed ❌`);
process.exit(failures === 0 ? 0 : 1);