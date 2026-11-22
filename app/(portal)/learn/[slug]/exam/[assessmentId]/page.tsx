import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ExamRunner, type RunnerQuestion } from "@/components/ExamRunner";
import { attemptCount } from "@/lib/learning";

export const dynamic = "force-dynamic";

export default async function ExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; assessmentId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const user = await requireUser();
  const { slug, assessmentId } = await params;
  const sp = await searchParams;
  const db = getDb();

  const assessment = db
    .prepare(
      `SELECT a.id, a.title, a.type, a.instructions, a.pass_mark, a.duration_minutes, a.show_results,
              c.slug, c.title AS course_title
       FROM assessments a JOIN courses c ON c.id = a.course_id
       WHERE a.id = ? AND c.slug = ? AND a.is_published = 1`
    )
    .get(Number(assessmentId), slug) as
    | {
        id: number;
        title: string;
        type: string;
        instructions: string | null;
        pass_mark: number;
        duration_minutes: number;
        show_results: number;
        slug: string;
        course_title: string;
      }
    | undefined;
  if (!assessment) notFound();

  const attemptId = Number(sp.attempt);
  if (!attemptId) redirect(`/courses/${slug}#assessments`);

  const attempt = db
    .prepare(
      `SELECT id, user_id, status, deadline_at, started_at FROM assessment_attempts
       WHERE id = ? AND assessment_id = ?`
    )
    .get(attemptId, assessment.id) as
    | { id: number; user_id: number; status: string; deadline_at: string | null; started_at: string }
    | undefined;
  if (!attempt) redirect(`/courses/${slug}#assessments`);
  if (attempt.user_id !== user.id) redirect("/dashboard");
  if (attempt.status !== "in_progress") redirect(`/results/${attempt.id}`);

  const questionRows = db
    .prepare(
      `SELECT q.id, q.type, q.prompt, q.options_json, aq.points
       FROM assessment_questions aq JOIN questions q ON q.id = aq.question_id
       WHERE aq.assessment_id = ? ORDER BY aq.position ASC`
    )
    .all(assessment.id) as Array<{
    id: number;
    type: string;
    prompt: string;
    options_json: string | null;
    points: number;
  }>;

  const questions: RunnerQuestion[] = questionRows.map((q) => {
    let options: RunnerQuestion["options"] = null;
    if (q.options_json) {
      try {
        options = JSON.parse(q.options_json) as RunnerQuestion["options"];
      } catch {
        options = null;
      }
    }
    return { id: q.id, type: q.type, prompt: q.prompt, points: q.points, options };
  });

  const previouslyAttempted = attemptCount(user.id, assessment.id);

  return (
    <div>
      <Link href={`/courses/${slug}`} className="mb-4 inline-flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink">
        <ChevronLeft size={14} /> Back to {assessment.course_title}
      </Link>

      <div className="mb-5">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#2f5da8] dark:text-[#6fa8e8]">
          {assessment.type === "final_exam" ? "Final examination" : assessment.type === "assignment" ? "Assignment submission" : "Knowledge check"}
        </div>
        <h1 className="mt-1 font-display text-[22px] font-bold text-ink md:text-[26px]">{assessment.title}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
          <span>{questions.length} questions</span> · <span>Pass mark {assessment.pass_mark}%</span> ·{" "}
          <span>{assessment.duration_minutes > 0 ? `${assessment.duration_minutes} minute time limit` : "Untimed"}</span> ·{" "}
          <span>Attempt {previouslyAttempted + 1}</span>
        </p>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-line bg-panel-2 px-4 py-2.5 text-[10.5px] leading-relaxed text-muted">
        <ShieldCheck size={13} className="mt-0.5 shrink-0" />
        <span>
          This is a controlled assessment. Your answers, attempt timing and result are recorded in the ICPC LMS audit trail against staff ID {user.staff_id}. Do not close the window while the assessment is in progress.
        </span>
      </div>

      <ExamRunner
        attemptId={attempt.id}
        questions={questions}
        deadline={attempt.deadline_at}
        instructions={assessment.instructions}
        title={assessment.type === "assignment" ? "Assignment" : assessment.course_title}
        attempted={previouslyAttempted}
        passMark={assessment.pass_mark}
      />
    </div>
  );
}
