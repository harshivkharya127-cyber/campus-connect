import { getSupabase } from "@/lib/data/client";
import { demoDb, demoProfileName, nextId } from "@/lib/data/demo-store";
import type { Answer, Question } from "@/lib/types";

export type QuestionInput = {
  title: string;
  body: string;
  tags: string[];
};

type QuestionRow = {
  id: string;
  title: string;
  body: string;
  tags: string[] | null;
  created_by: string;
  created_at: string;
  answers?: { id: string }[] | null;
  author?: { full_name: string | null } | null;
};

type AnswerRow = {
  id: string;
  question_id: string;
  body: string;
  is_accepted: boolean;
  created_by: string;
  created_at: string;
  author?: { full_name: string | null } | null;
};

function mapAnswer(row: AnswerRow): Answer {
  return {
    id: row.id,
    question_id: row.question_id,
    body: row.body,
    is_accepted: row.is_accepted,
    created_by: row.created_by,
    created_at: row.created_at,
    author_name: row.author?.full_name ?? null,
  };
}

/** Accepted answers float to the top, then oldest first. */
function sortAnswers(answers: Answer[]): Answer[] {
  return [...answers].sort(
    (a, b) => Number(b.is_accepted) - Number(a.is_accepted) || a.created_at.localeCompare(b.created_at),
  );
}

export async function listQuestions(): Promise<Question[]> {
  const supabase = await getSupabase();

  if (!supabase) {
    return [...demoDb.questions]
      .map((question) => ({
        ...question,
        author_name: demoProfileName(question.created_by),
        answer_count: demoDb.answers.filter((answer) => answer.question_id === question.id).length,
      }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  const { data, error } = await supabase
    .from("questions")
    .select("*, answers(id), author:profiles!questions_created_by_fkey(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data as QuestionRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    tags: row.tags ?? [],
    created_by: row.created_by,
    created_at: row.created_at,
    author_name: row.author?.full_name ?? null,
    answer_count: row.answers?.length ?? 0,
  }));
}

export async function getQuestionThread(
  questionId: string,
): Promise<{ question: Question; answers: Answer[] } | null> {
  const supabase = await getSupabase();

  if (!supabase) {
    const question = demoDb.questions.find((row) => row.id === questionId);
    if (!question) return null;
    const answers = demoDb.answers
      .filter((answer) => answer.question_id === questionId)
      .map((answer) => ({ ...answer, author_name: demoProfileName(answer.created_by) }));
    return {
      question: { ...question, author_name: demoProfileName(question.created_by), answer_count: answers.length },
      answers: sortAnswers(answers),
    };
  }

  const { data: questionData, error } = await supabase
    .from("questions")
    .select("*, author:profiles!questions_created_by_fkey(full_name)")
    .eq("id", questionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!questionData) return null;

  const { data: answerData, error: answerError } = await supabase
    .from("answers")
    .select("*, author:profiles!answers_created_by_fkey(full_name)")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });
  if (answerError) throw new Error(answerError.message);

  const row = questionData as QuestionRow;
  const answers = (answerData as AnswerRow[]).map(mapAnswer);

  return {
    question: {
      id: row.id,
      title: row.title,
      body: row.body,
      tags: row.tags ?? [],
      created_by: row.created_by,
      created_at: row.created_at,
      author_name: row.author?.full_name ?? null,
      answer_count: answers.length,
    },
    answers: sortAnswers(answers),
  };
}

export async function createQuestion(input: QuestionInput, userId: string): Promise<string> {
  const supabase = await getSupabase();

  if (!supabase) {
    const id = nextId("q");
    demoDb.questions.unshift({
      id,
      ...input,
      created_by: userId,
      created_at: new Date().toISOString(),
      author_name: demoProfileName(userId),
      answer_count: 0,
    });
    return id;
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({ ...input, created_by: userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function createAnswer(questionId: string, body: string, userId: string): Promise<void> {
  const supabase = await getSupabase();

  if (!supabase) {
    demoDb.answers.push({
      id: nextId("a"),
      question_id: questionId,
      body,
      is_accepted: false,
      created_by: userId,
      created_at: new Date().toISOString(),
      author_name: demoProfileName(userId),
    });
    return;
  }

  const { error } = await supabase.from("answers").insert({ question_id: questionId, body, created_by: userId });
  if (error) throw new Error(error.message);
}

/** Only the person who asked the question may accept an answer (RLS enforces it too). */
export async function acceptAnswer(answerId: string, userId: string): Promise<void> {
  const supabase = await getSupabase();

  if (!supabase) {
    const target = demoDb.answers.find((answer) => answer.id === answerId);
    if (!target) return;
    const question = demoDb.questions.find((row) => row.id === target.question_id);
    if (!question || question.created_by !== userId) return;
    demoDb.answers.forEach((answer) => {
      if (answer.question_id === target.question_id) answer.is_accepted = answer.id === answerId;
    });
    return;
  }

  const { data } = await supabase.from("answers").select("question_id").eq("id", answerId).maybeSingle();
  const questionId = (data as { question_id: string } | null)?.question_id;
  if (!questionId) return;

  const { error: clearError } = await supabase
    .from("answers")
    .update({ is_accepted: false })
    .eq("question_id", questionId);
  if (clearError) throw new Error(clearError.message);

  const { error } = await supabase.from("answers").update({ is_accepted: true }).eq("id", answerId);
  if (error) throw new Error(error.message);
}

export async function deleteAnswer(answerId: string, userId: string): Promise<void> {
  const supabase = await getSupabase();

  if (!supabase) {
    demoDb.answers = demoDb.answers.filter((answer) => !(answer.id === answerId && answer.created_by === userId));
    return;
  }

  const { error } = await supabase.from("answers").delete().eq("id", answerId).eq("created_by", userId);
  if (error) throw new Error(error.message);
}