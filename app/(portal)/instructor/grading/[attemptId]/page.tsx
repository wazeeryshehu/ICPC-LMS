import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime, humanStatus } from "@/lib/format";
import { isAdministrator } from "@/lib/rbac";
import { PageHeader, ProgressBar } from "@/components/ui";
import { gradeAttemptAction } from "@/lib/actions/instructor";

export const dynamic = "force-dynamic";

function formatAnswer(type: string, answerJson: string | null, optionsJson: string | null = null): string {
  if (!answerJson) return "No answer";
  try {
    const answer = JSON.parse(answerJson);
    const options: string[] = optionsJson ? JSON.parse(optionsJson) : [];
    if (answer === null || answer === undefined || answer === "") return "No answer";
    if (type === "true_false") return answer === true || answer === "true" ? "True" : "False";
    if (type === "mcq") return options[Number(answer)] ?? String(answer);
    if (type === "multi") {
      return Array.isArray(answer) ? answer.map((i) => options[Number(i)] ?? String(i)).join("; ") : String(answer);
    }
    if (type === "matching") {
      return Object.entries(answer as Record<string, string>).map(([k, v]) => `${k} → ${v}`).join("\n") || "No answer";
    }
    if (Array.isArray(answer)) return answer.join(" / ");
    return String(answer);
  } catch {
    return String(answerJson);
  }
}

export default async function GradeAttemptPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const user = await requireUser(["instructor", "super_admin", "training_admin"]);
  const { attemptId } = await params;
  const db = getDb();
  const attempt = db
    .prepare(
      `SELECT at.id, at.status, at.score, at.max_score, at.percent, at.passed, at.submitted_at, at.started_at,
              at.attempt_number, a.title AS assessment_title, a.type AS assessment_type, a.pass_mark, a.show_results,
              a.id AS assessment_id, c.title AS course_title, c.id AS course_id, c.instructor_id, c.slug,
              u.first_name, u.last_name, u.staff_id, u.email, d.name AS department_name
       FROM assessment_attempts at
       JOIN assessments a ON a.id = at.assessment_id
       JOIN courses c ON c.id = a.course_id
       JOIN users u ON u.id = at.user_id
       LEFT JOIN departments d ON d.id = u.department_id
       WHERE at.id = ?`
    )
    .get(Number(attemptId)) as
    | {
        id: number;
        status: string;
        score: number | null;
        max_score: number | null;
        percent: number | null;
        passed: number | null;
        submitted_at: string | null;
        started_at: string;
        attempt_number: number;
        assessment_title: string;
        assessment_type: string;
        pass_mark: number;
        show_results: number;
        assessment_id: number;
        course_title: string;
        course_id: number;
        instructor_id: number | null;
        slug: string;
        first_name: string;
        last_name: string;
        staff_id: string;
        email: string;
        department_name: string | null;
      }
    | undefined;
  if (!attempt) notFound();
  if (!isAdministrator(user.role as "super_admin") && attempt.instructor_id !== user.id) notFound();

  const responses = db
    .prepare(
      `SELECT r.id, r.answer_json, r.auto_score, r.manual_score, r.is_correct, r.feedback,
              q.type, q.prompt, q.points, q.options_json, q.correct_json, q.explanation
       FROM attempt_responses r JOIN questions q ON q.id = r.question_id
       WHERE r.attempt_id = ? ORDER BY r.id`
    )
    .all(attempt.id) as Array<{
    id: number;
    answer_json: string | null;
    auto_score: number | null;
    manual_score: number | null;
    is_correct: number | null;
    feedback: string | null;
    type: string;
    prompt: string;
    points: number;
    options_json: string | null;
    correct_json: string | null;
    explanation: string | null;
  }>;

  const pending = attempt.status === "submitted";
  const manualResponses = responses.filter((r) => ["short_answer", "scenario", "essay"].includes(r.type));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${humanStatus(attempt.assessment_type)} · attempt ${attempt.attempt_number}`}
        title={attempt.assessment_title}
        description={`${attempt.first_name} ${attempt.last_name} (${attempt.staff_id}) · ${attempt.course_title} · submitted ${attempt.submitted_at ? formatDateTime(attempt.submitted_at) : "—"}`}
        actions={<Link href="/instructor/grading" className="btn btn-outline btn-sm"><ArrowLeft size={14} /> Grading queue</Link>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-4">
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted">Learner</div>
          <div className="mt-1.5 font-display text-[16px] font-bold text-ink">{attempt.first_name} {attempt.last_name}</div>
          <div className="text-[11px] text-muted">{attempt.email}</div>
          <div className="text-[11px] text-muted">{attempt.department_name ?? "Unassigned department"}</div>
        </div>
        <div className="card p-4">
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted">Provisional score</div>
          <div className="mt-1.5 font-display text-[24px] font-bold text-ink">{attempt.percent ?? 0}%</div>
          <div className="text-[11px] text-muted">{attempt.score ?? 0} / {attempt.max_score ?? 0} points auto-graded</div>
        </div>
        <div className="card p-4">
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted">Pass mark</div>
          <div className="mt-1.5 font-display text-[24px] font-bold text-ink">{attempt.pass_mark}%</div>
          <div className="text-[11px] text-muted">Manual items: {manualResponses.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted">Status</div>
          <div className="mt-1.5">
            <span className={`chip ${attempt.status === "graded" ? (attempt.passed ? "chip-green" : "chip-red") : "chip-gold"}`}>
              {attempt.status === "graded" ? (attempt.passed ? "Passed" : "Failed") : "Awaiting marking"}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-muted">Started {formatDateTime(attempt.started_at)}</div>
        </div>
      </div>

      <form action={gradeAttemptAction} className="space-y-4">
        <input type="hidden" name="attemptId" value={attempt.id} />
        {responses.map((r, index) => {
          const manual = ["short_answer", "scenario", "essay"].includes(r.type);
          return (
            <section key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-[10.5px] font-bold text-ink-soft">{index + 1}</span>
                  <span className="chip chip-blue">{humanStatus(r.type)}</span>
                  <span className="chip chip-gray">{r.points} pt{r.points === 1 ? "" : "s"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {!manual && (r.is_correct ? (
                    <span className="flex items-center gap-1 text-[11.5px] font-semibold text-green-700 dark:text-green-300"><CheckCircle2 size={14} /> Correct ({r.auto_score}/{r.points})</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11.5px] font-semibold text-red-600 dark:text-red-300"><XCircle size={14} /> Incorrect ({r.auto_score ?? 0}/{r.points})</span>
                  ))}
                  {manual && !pending && <span className="chip chip-green">Marked: {r.manual_score ?? 0}/{r.points}</span>}
                </div>
              </div>
              <p className="mt-3 text-[13px] font-semibold leading-relaxed text-ink">{r.prompt}</p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-line bg-panel-2 px-3.5 py-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-muted">Learner answer</div>
                  <div className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-ink-soft">{formatAnswer(r.type, r.answer_json)}</div>
                </div>
                <div className="rounded-lg border border-line bg-panel-2 px-3.5 py-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-muted">{manual ? "Marking guidance" : "Expected answer"}</div>
                  <div className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-ink-soft">
                    {manual
                      ? r.explanation ?? "Assess against the marking rubric for this question. Allocate marks out of the available points."
                      : formatAnswer(r.type, r.correct_json, r.options_json)}
                  </div>
                  {!manual && r.explanation && <div className="mt-1.5 text-[10.5px] text-muted">Explanation: {r.explanation}</div>}
                </div>
              </div>

              {manual && pending ? (
                <div className="mt-3 grid gap-3 rounded-lg border border-gold-200 bg-gold-50/60 p-3.5 dark:border-gold-900/40 dark:bg-gold-900/10 md:grid-cols-[130px_1fr]">
                  <div>
                    <label className="label" htmlFor={`score_${r.id}`}>Marks (0–{r.points})</label>
                    <input id={`score_${r.id}`} name={`score_${r.id}`} type="number" min={0} max={r.points} step={0.5} defaultValue={0} className="input" required />
                  </div>
                  <div>
                    <label className="label" htmlFor={`feedback_${r.id}`}>Feedback to learner</label>
                    <textarea id={`feedback_${r.id}`} name={`feedback_${r.id}`} className="textarea min-h-[64px]" placeholder="What was strong, what to improve" />
                  </div>
                </div>
              ) : manual ? (
                r.feedback && <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-[11px] text-muted">Feedback: {r.feedback}</p>
              ) : null}
            </section>
          );
        })}

        {pending ? (
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-[11.5px] leading-relaxed text-muted">
              Saving finalises the attempt, recomputes the score against the pass mark, notifies the learner and issues a certificate if a final exam is passed.
            </div>
            <div className="flex gap-2">
              <Link href="/instructor/grading" className="btn btn-ghost btn-sm">Cancel</Link>
              <button type="submit" className="btn btn-primary btn-sm"><CheckCircle2 size={14} /> Save marks & publish result</button>
            </div>
          </div>
        ) : (
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-[12px] text-ink-soft">
              <CheckCircle2 size={15} className="text-green-600" /> Final score {attempt.percent}% · {attempt.passed ? "Passed" : "Not passed"} (pass mark {attempt.pass_mark}%)
            </div>
            <div className="w-48"><ProgressBar value={attempt.percent ?? 0} /></div>
            <Link href={`/results/${attempt.id}`} className="btn btn-outline btn-sm">View learner result</Link>
          </div>
        )}
      </form>
    </div>
  );
}
