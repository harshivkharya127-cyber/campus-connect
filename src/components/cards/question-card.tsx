import Link from "next/link";

import { AuthorLine, Badge, Card } from "@/components/ui";
import type { Question } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export function QuestionCard({ question }: { question: Question }) {
  return (
    <Card className="card-hover flex h-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={question.answer_count > 0 ? "success" : "warning"}>
          {question.answer_count === 0
            ? "Needs an answer"
            : `${question.answer_count} answer${question.answer_count === 1 ? "" : "s"}`}
        </Badge>
        {question.tags.map((tag) => (
          <span key={tag} className="chip">
            #{tag}
          </span>
        ))}
      </div>

      <Link href={`/qa/${question.id}`} className="group">
        <h3 className="text-lg font-semibold text-white group-hover:text-brand-200">{question.title}</h3>
      </Link>
      <p className="line-clamp-2 text-sm text-slate-400">{question.body}</p>

      <div className="mt-auto">
        <AuthorLine name={question.author_name} timestamp={timeAgo(question.created_at)} />
      </div>
    </Card>
  );
}