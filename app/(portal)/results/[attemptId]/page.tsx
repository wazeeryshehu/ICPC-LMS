import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileCheck2,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { attemptCount } from "@/lib/learning";

export const dynamic = "force-dynamic";

interface ReviewQuestion {
  id: number;
  type: string;
  prompt: string;
  options: unknown;
  correct: unknown;
  explanation: string | null;
  points: number;
  answer: unknown;
  auto_score: number | null;
  manual_score: number | null;
  is_correct: number | null;
  feedback: string | null;
}

function parse(value: string | null): unknown {
  if (value === null || value === "") return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function renderAnswer(type: string, value: unknown, options: unknown): string {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) return "No answer provided";
  const opts = Array.isArray(options) ? (options as unknown[]) : [];
  switch (type) {
    case "mcq":
      return opts[Number(value)] !== undefined ? String(opts[Number(value)]) : String(value);
    case "multi":
      return Array.isArray(value)
        ? (value as unknown[]).map((v) => (opts[Number(v)] !== undefined ? String(opts[Number(v)]) : String(v))).join("; ")
        : String(value);
    case "true_false":
      return String(value) === "true" ? "True" : "False";
    case "fill":
      return String(value);
    case "matching": {
      const obj = value as Record<string, string>;
      return Object.entries(obj).map(([k, v]) => `${k} → ${v || "—"}`).join("; ");
    }
    default:
      return String(value);
  }
}

function renderCorrect(type: string, value: unknown, options: unknown): string {
  if (value === null || value === undefined) return "Manually graded";
  const opts = Array.isArray(options) ? (options as unknown[]) : [];
  switch (type) {
    case "mcq":
      return opts[Number(value)] !== undefined ? String(opts[Number(value)]) : String(value);
    case "multi":
      return Array.isArray(value)
        ? (value as unknown[]).map((v) => (opts[Number(v)] !== undefined ? String(opts[Number(v)]) : String(v))).join("; ")
        : String(value);
    case "true_false":
      return String(value) === "true" ? "True" : "False";
    case "fill":
      return Array.isArray(value) ? (value as unknown[]).map(String).join(" or ") : String(value);
    case "matching": {
      const obj = value as Record<string, string>;
      return Object.entries(obj).map(([k, v]) => `${k} → ${v}`).join("; ");
    }
    default:
      return String(value);
  }
}

export default async function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const user = await requireUser();
  const { attemptId } = await params;
  const db = getDb();

  const attempt = db
    .prepare(
      `SELECT at.*, a.title, a.type, a.pass_mark, a.max_attempts, a.show_results, a.duration_minutes,
              a.id AS assessment_id, c.id AS course_id, c.slug, c.title AS course_title
       FROM assessment_attempts at
       JOIN assessments a ON a.id = at.assessment_id
       JOIN courses c ON c.id = a.course_id
       WHERE at.id = ?`
    )
    .get(Number(attemptId)) as
    | {
        id: number;
        user_id: number;
        assessment_id: number;
        attempt_number: number;
        started_at: string;
        submitted_at: string | null;
        score: number | null;
        max_score: number | null;
        percent: number | null;
        passed: number | null;
        status: string;
        time_spent_seconds: number | null;
        title: string;
        type: string;
        pass_mark: number;
        max_attempts: number;
        show_results: number;
        duration_minutes: number;
        course_id: number;
        slug: string;
        course_title: string;
      }
    | undefined;
  if (!attempt) notFound();

  const privileged = ["super_admin", "training_admin", "instructor"].includes(user.role);
  if (attempt.user_id !== user.id && !privileged) redirect("/dashboard");
  if (attempt.status === "in_progress") redirect(`/learn/${attempt.slug}/exam/${attempt.assessment_id}?attempt=${attempt.id}`);

  const responses = db
    .prepare(
      `SELECT r.question_id AS id, q.type, q.prompt, q.options_json, q.correct_json, q.explanation, aq.points,
              r.answer_json, r.auto_score, r.manual_score, r.is_correct, r.feedback
       FROM attempt_responses r
       JOIN questions q ON q.id = r.question_id
       JOIN assessment_questions aq ON aq.assessment_id = ? AND aq.question_id = q.id
       WHERE r.attempt_id = ? ORDER BY aq.position ASC`
    )
    .all(attempt.assessment_id, attempt.id) as Array<{
    id: number;
    type: string;
    prompt: string;
    options_json: string | null;
    correct_json: string | null;
    explanation: string | null;
    points: number;
    answer_json: string | null;
    auto_score: number | null;
    manual_score: number | null;
    is_correct: number | null;
    feedback: string | null;
  }>;

  const review: ReviewQuestion[] = responses.map((r) => ({
    id: r.id,
    type: r.type,
    prompt: r.prompt,
    options: parse(r.options_json),
    correct: parse(r.correct_json),
    explanation: r.explanation,
    points: r.points,
    answer: parse(r.answer_json),
    auto_score: r.auto_score,
    manual_score: r.manual_score,
    is_correct: r.is_correct,
    feedback: r.feedback,
  }));

  const pending = attempt.status === "submitted";
  const passed = attempt.passed === 1;
  const used = attemptCount(attempt.user_id, attempt.assessment_id);
  const attemptsLeft = Math.max(0, attempt.max_attempts - used);

  const certificate = db
    .prepare("SELECT cert_no FROM certificates WHERE user_id = ? AND course_id = ? AND revoked = 0")
    .get(attempt.user_id, attempt.course_id) as { cert_no: string } | undefined;

  const correctCount = review.filter((r) => r.is_correct === 1).length;
  const canReview = attempt.show_results === 1 || privileged;

  const mins = attempt.time_spent_seconds ? Math.floor(attempt.time_spent_seconds / 60) : 0;
  const secs = attempt.time_spent_seconds ? attempt.time_spent_seconds % 60 : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link href={`/courses/${attempt.slug}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink">
        <ChevronLeft size={14} /> Back to {attempt.course_title}
      </Link>

      <section
        className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lift md:p-8 ${
          pending ? "bg-[#2f5da8]" : passed ? "bg-[#0b2550]" : "bg-[#5f1d1d]"
        }`}
      >
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/60">
              {attempt.type === "final_exam" ? "Final examination result" : attempt.type === "assignment" ? "Assignment result" : "Knowledge check result"}
            </div>
            <h1 className="mt-1.5 font-display text-[24px] font-bold leading-tight md:text-[30px]">{attempt.title}</h1>
            <p className="mt-1 text-[12px] text-white/60">
              {attempt.course_title} · Attempt {attempt.attempt_number} · Submitted {formatDateTime(attempt.submitted_at)}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold">
              {pending ? (
                <><Clock size={14} /> Awaiting manual grading</>
              ) : passed ? (
                <><CheckCircle2 size={14} /> Passed — pass mark {attempt.pass_mark}%</>
              ) : (
                <><XCircle size={14} /> Not passed — pass mark {attempt.pass_mark}%</>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[9px] border-white/15">
              <div className="text-center">
                <div className="font-display text-[30px] font-bold leading-none">{attempt.percent !== null ? `${attempt.percent}%` : "—"}</div>
                <div className="mt-1 text-[9px] uppercase tracking-wider text-white/55">Score</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {pending && (
        <div className="flex items-start gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-[12px] leading-relaxed text-gold-900 dark:border-gold-900/40 dark:bg-gold-900/20 dark:text-gold-100">
          <FileCheck2 size={15} className="mt-0.5 shrink-0" />
          <span>
            Your auto-graded score is shown above. One or more written responses require manual grading by the instructor. You will be notified when the final result is published.
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Score</div>
          <div className="mt-1 font-display text-[20px] font-bold text-ink">
            {attempt.score !== null ? `${attempt.score}` : "—"}<span className="text-[12px] font-normal text-muted"> / {attempt.max_score ?? "—"}</span>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Auto-graded correct</div>
          <div className="mt-1 font-display text-[20px] font-bold text-ink">{correctCount}<span className="text-[12px] font-normal text-muted"> / {review.filter((r) => r.type !== "essay" && r.type !== "short_answer").length}</span></div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Time spent</div>
          <div className="mt-1 font-display text-[20px] font-bold text-ink">{mins}<span className="text-[12px] font-normal text-muted">m {secs}s</span></div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Attempts</div>
          <div className="mt-1 font-display text-[20px] font-bold text-ink">{used}<span className="text-[12px] font-normal text-muted"> / {attempt.max_attempts}</span></div>
        </div>
      </div>

      {certificate && attempt.type === "final_exam" && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/40 dark:bg-green-950/30 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-[12.5px] text-green-900 dark:text-green-100">
            <Award size={16} /> Certificate issued — {certificate.cert_no}
          </div>
          <Link href="/certificates" className="btn btn-primary btn-sm">View certificate</Link>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!passed && !pending && attemptsLeft > 0 && (
          <Link href={`/courses/${attempt.slug}#assessments`} className="btn btn-primary btn-sm">
            <RotateCcw size={13} /> Retake ({attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} left)
          </Link>
        )}
        <Link href={`/courses/${attempt.slug}`} className="btn btn-outline btn-sm">Return to course</Link>
        <Link href="/history" className="btn btn-ghost btn-sm">My learning history</Link>
      </div>

      {canReview && review.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-bold text-ink">Answer review</h2>
            <span className="text-[11px] text-muted">{review.length} questions</span>
          </div>
          {review.map((r, idx) => {
            const manual = r.type === "essay" || r.type === "short_answer";
            const awarded = r.manual_score ?? r.auto_score;
            const status = manual && r.manual_score === null ? "pending" : r.is_correct === 1 ? "correct" : manual ? "graded" : "incorrect";
            return (
              <article key={`${r.id}-${idx}`} className="card p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    status === "correct" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      : status === "incorrect" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-gold-50 text-gold-700 dark:bg-gold-900/30 dark:text-gold-200"
                  }`}>
                    {status === "correct" ? <CheckCircle2 size={13} /> : status === "incorrect" ? <XCircle size={13} /> : <Clock size={13} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Question {idx + 1}</span>
                      <span className="chip chip-gray capitalize">{r.type.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-muted">{r.points} pt{r.points === 1 ? "" : "s"}</span>
                      <span className="ml-auto text-[10.5px] font-semibold text-ink">
                        {awarded !== null ? `${awarded}` : "—"} / {r.points}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink">{r.prompt}</p>

                    <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                      <div className={`rounded-lg border px-3 py-2 text-[11.5px] ${
                        status === "correct" ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-100"
                          : status === "incorrect" ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100"
                            : "border-line bg-panel-2 text-ink-soft"
                      }`}>
                        <div className="mb-0.5 text-[9.5px] font-bold uppercase tracking-wider opacity-60">Your answer</div>
                        <div className="whitespace-pre-wrap">{renderAnswer(r.type, r.answer, r.options)}</div>
                      </div>
                      <div className="rounded-lg border border-line bg-panel-2 px-3 py-2 text-[11.5px] text-ink-soft">
                        <div className="mb-0.5 text-[9.5px] font-bold uppercase tracking-wider text-muted">{manual ? "Grading" : "Correct answer"}</div>
                        <div className="whitespace-pre-wrap">{manual ? (r.manual_score !== null ? `Awarded ${r.manual_score} of ${r.points} points` : "Pending instructor grading") : renderCorrect(r.type, r.correct, r.options)}</div>
                      </div>
                    </div>

                    {r.feedback && (
                      <div className="mt-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[11.5px] text-ink-soft">
                        <span className="font-semibold text-ink">Instructor feedback: </span>{r.feedback}
                      </div>
                    )}
                    {r.explanation && (
                      <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
                        <ShieldCheck size={12} className="mt-0.5 shrink-0" /> <span><strong className="text-ink-soft">Explanation:</strong> {r.explanation}</span>
                      </p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {!canReview && (
        <div className="rounded-xl border border-line bg-panel-2 px-4 py-3 text-[11.5px] text-muted">
          Detailed answer review is not enabled for this assessment. Your score and completion status have been recorded.
        </div>
      )}
    </div>
  );
}
