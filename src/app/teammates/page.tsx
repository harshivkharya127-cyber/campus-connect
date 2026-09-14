import { TeammateCard } from "@/components/cards/teammate-card";
import { Panel } from "@/components/fields";
import { TeammateForm } from "@/components/forms/teammate-form";
import { PageHeader, PageShell } from "@/components/page-header";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { EmptyState, SectionHeading, Stat } from "@/components/ui";
import { getCurrentUser } from "@/lib/data/auth";
import { listTeammatePosts } from "@/lib/data/teammates";

export const metadata = {
  title: "Find teammates",
};

export default async function TeammatesPage() {
  const user = await getCurrentUser();
  const posts = await listTeammatePosts(user?.id ?? null);

  const openPosts = posts.filter((post) => post.is_open);
  const myPosts = posts.filter((post) => post.created_by === user?.id);
  const interested = posts.filter((post) => post.interested).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Teammates"
        title="Find people to build with"
        description="Hackathon squads, study groups, research partners and side projects. Post what you need — interested students tap once and you see the count."
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Open posts" value={openPosts.length} hint="looking for people" />
        <Stat label="Your posts" value={myPosts.length} hint="created by you" />
        <Stat label="Your interest" value={interested} hint="sent by you" />
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <section>
          <SectionHeading title="Open posts" description="Open requests first, newest at the top." />
          {posts.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {posts.map((post) => (
                <TeammateCard key={post.id} post={post} isOwner={post.created_by === user?.id} />
              ))}
            </div>
          ) : (
            <EmptyState title="No posts yet" description="Describe the teammate you're looking for." />
          )}
        </section>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Panel title="Post what you need" description="Be specific about skills and the time commitment and you'll get better replies.">
            {user ? <TeammateForm /> : <SignInPrompt message="Log in to post a teammate request." />}
          </Panel>

          <div className="card">
            <h3 className="text-sm font-semibold text-white">Tips that get replies</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li>• Name the project type and the deadline.</li>
              <li>• List the 2-3 skills you actually need.</li>
              <li>• Say how often you plan to meet.</li>
              <li>• Close the post once you have your team.</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}