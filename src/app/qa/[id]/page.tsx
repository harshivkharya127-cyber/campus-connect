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
          <Badge tone={question.answer_count > 0 ? "success" : "warning"}>
            {question.answer_count} answer{question.answer_count === 1 ? "" : "s"}
          </Badge>
          {question.tags.map((tag) => (
            <span key={tag} className="chip">
              #{tag}
            </span>
          ))}
          {isAuthor ? <Badge tone="brand">Your question</Badge> : null}
        </div>

        <h1 className="text-2xl font-bold text-white sm:text-3xl">{question.title}</h1>
        <p className="text-sm whitespace-pre-line text-slate-300">{question.body}</p>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Avatar name={question.author_name} className="size-7 text-[10px]" />
          <span className="font-medium text-slate-300">Asked by {question.author_name ?? "a student"}</span>
          <span aria-hidden>·</span>
          <span>{timeAgo(question.created_at)}</span>
        </div>
      </article>

      <section className="space-y-5">
        <h2 className="text-xl font-semibold text-white">
          {answers.length === 0 ? "No answers yet — be the first" : `${answers.length} answer${answers.length === 1 ? "" : "s"}`}
        </h2>

        {answers.map((answer) => (
          <Card
            key={answer.id}
            className={answer.is_accepted ? "border-emerald-400/40 bg-emerald-500/[0.06]" : undefined}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Avatar name={answer.author_name} className="size-7 text-[10px]" />
                  <span className="font-medium text-slate-300">{answer.author_name ?? "Student"}</span>
                  <span aria-hidden>·</span>
                  <span>{timeAgo(answer.created_at)}</span>
                </div>
                {answer.is_accepted ? <Badge tone="success">✓ Accepted answer</Badge> : null}
              </div>

              <p className="text-sm whitespace-pre-line text-slate-200">{answer.body}</p>

              {isAuthor && !answer.is_accepted ? (
                <ActionForm
                  action={acceptAnswerAction}
                  fields={{ answerId: answer.id, questionId: question.id }}
                  label="Accept this answer"
                  pendingLabel="Saving…"
                  className="btn-ghost"
                />
              ) : null}
            </div>
          </Card>
        ))}

        <Card>
          <h3 className="text-base font-semibold text-white">Your answer</h3>
          <p className="mt-1 mb-4 text-sm text-slate-400">
            Specifics beat opinions: what you did, what worked, and what you would skip.
          </p>
          {user ? (
            <AnswerForm questionId={question.id} />
          ) : (
            <p className="text-sm text-slate-400">
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