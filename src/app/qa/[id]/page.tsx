import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionForm } from "@/components/action-form";
import { AnswerForm } from "@/components/forms/answer-form";
import { Avatar, Badge, Card } from "@/components/ui";
import { acceptAnswerAction } from "@/lib/actions/qa";
import { getCurrentUser } from "@/lib/data/auth";
import { getQuestionThread } from "@/lib/data/qa";
import { timeAgo } from "@/lib/utils";

export const metadata = {
  title: "Question",
};

export default async function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const thread = await getQuestionThread(id);

  if (!thread) notFound();

  const { question, answers } = thread;
  const isAuthor = user?.id === question.created_by;

  return (
    <div className="space-y-8">
      <Link href="/qa" className="link text-sm">
        ← Back to all questions
      </Link>

      <article className="card space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={question.answer_count > 0 ? "positive" : "caution"}>
            {question.answer_count} answer{question.answer_count === 1 ? "" : "s"}
          </Badge>
          {question.tags.map((tag) => (
            <span key={tag} className="chip">
              #{tag}
            </span>
          ))}
          {isAuthor ? <Badge tone="accent">Your question</Badge> : null}
        </div>

        <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">{question.title}</h1>
        <p className="text-sm whitespace-pre-line text-ink">{question.body}</p>

        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <Avatar name={question.author_name} className="size-7 text-[10px]" />
          <span className="font-medium text-ink">Asked by {question.author_name ?? "a student"}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(question.created_at)}</span>
        </div>
      </article>

      <section className="space-y-5">
        <h2 className="text-xl font-semibold text-navy-900">
          {answers.length === 0 ? "No answers yet — be the first" : `${answers.length} answer${answers.length === 1 ? "" : "s"}`}
        </h2>

        {answers.map((answer) => (
          <Card
            key={answer.id}
            className={answer.is_accepted ? "border-positive/40 bg-positive/5" : undefined}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <Avatar name={answer.author_name} className="size-7 text-[10px]" />
                  <span className="font-medium text-ink">{answer.author_name ?? "Student"}</span>
                  <span aria-hidden>·</span>
                  <span>{timeAgo(answer.created_at)}</span>
                </div>
                {answer.is_accepted ? <Badge tone="positive">✓ Accepted answer</Badge> : null}
              </div>

              <p className="text-sm whitespace-pre-line text-navy-900">{answer.body}</p>

              {isAuthor && !answer.is_accepted ? (
                <ActionForm
                  action={acceptAnswerAction}
                  fields={{ answerId: answer.id, questionId: question.id }}
                  label="Accept this answer"
                  pendingLabel="Saving…"
                  className="btn-quiet"
                />
              ) : null}
            </div>
          </Card>
        ))}

        <Card>
          <h3 className="text-base font-semibold text-navy-900">Your answer</h3>
          <p className="mt-1 mb-4 text-sm text-ink-muted">
            Specifics beat opinions: what you did, what worked, and what you would skip.
          </p>
          {user ? (
            <AnswerForm questionId={question.id} />
          ) : (
            <p className="text-sm text-ink-muted">
              <Link href="/login" className="link">
                Log in
              </Link>{" "}
              to post an answer.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}