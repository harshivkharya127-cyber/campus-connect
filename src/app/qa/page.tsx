import { QuestionCard } from "@/components/cards/question-card";
import { Panel } from "@/components/fields";
import { QuestionForm } from "@/components/forms/question-form";
import { PageHeader, PageShell } from "@/components/page-header";
import { SignInPrompt } from "@/components/sign-in-prompt";
import { EmptyState, SectionHeading, Stat } from "@/components/ui";
import { getCurrentUser } from "@/lib/data/auth";
import { listQuestions } from "@/lib/data/qa";

export const metadata = {
  title: "Questions & answers",
};

export default async function QaPage() {
  const user = await getCurrentUser();
  const questions = await listQuestions();

  const answered = questions.filter((question) => question.answer_count > 0).length;
  const totalAnswers = questions.reduce((sum, question) => sum + question.answer_count, 0);
  const tags = Array.from(new Set(questions.flatMap((question) => question.tags)));

  return (
    <PageShell>
      <PageHeader
        eyebrow="Q&A"
        title="Ask the campus"
        description="Internships, electives, exam prep, hostel life — ask it here. Answers are stored per question and the asker can accept the best one."
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Questions" value={questions.length} hint="asked by students" />
        <Stat label="Answers" value={totalAnswers} hint="posted in reply" />
        <Stat label="Answered" value={answered} hint={`${questions.length - answered} still open`} />
        <Stat label="Tags" value={tags.length} hint="topics in use" />
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <section>
          <SectionHeading title="Latest questions" description="Open a question to read and post answers." />
          {questions.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {questions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          ) : (
            <EmptyState title="No questions yet" description="Ask the first one — someone on campus has the answer." />
          )}
        </section>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <Panel title="Ask a question" description="Add tags so the right people notice it.">
            {user ? <QuestionForm /> : <SignInPrompt message="Log in to ask the campus." />}
          </Panel>

          {tags.length ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-white">Popular tags</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tags.slice(0, 12).map((tag) => (
                  <li key={tag} className="chip">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </PageShell>
  );
}