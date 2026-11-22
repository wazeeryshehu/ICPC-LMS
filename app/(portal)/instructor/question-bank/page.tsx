import Link from "next/link";
import { BookOpen, FileQuestion, Plus, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { humanStatus } from "@/lib/format";
import { isAdministrator } from "@/lib/rbac";
import { EmptyState, PageHeader } from "@/components/ui";
import { createQuestionAction, deleteQuestionAction } from "@/lib/actions/instructor";

export const dynamic = "force-dynamic";

function describeCorrect(type: string, optionsJson: string | null, correctJson: string | null): string {
  if (!correctJson) return "Manual marking";
  try {
    const correct = JSON.parse(correctJson);
    if (type === "mcq") {
      const options: string[] = optionsJson ? JSON.parse(optionsJson) : [];
      return options[Number(correct)] ?? "—";
    }
    if (type === "multi") {
      const options: string[] = optionsJson ? JSON.parse(optionsJson) : [];
      return (correct as number[]).map((i) => options[i]).filter(Boolean).join("; ");
    }
    if (type === "true_false") return correct ? "True" : "False";
    if (type === "fill") return (correct as string[]).join(" / ");
    if (type === "matching") return Object.entries(correct as Record<string, string>).map(([l, r]) => `${l} → ${r}`).join("; ");
    return "—";
  } catch {
    return "—";
  }
}

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; assessment?: string; saved?: string; error?: string }>;
}) {
  const user = await requireUser(["instructor", "super_admin", "training_admin"]);
  const q = await searchParams;
  const db = getDb();
  const admin = isAdministrator(user.role as "super_admin");

  const courses = db
    .prepare(
      `SELECT c.id, c.title, c.status FROM courses c
       WHERE ${admin ? "1=1" : "c.instructor_id = ?"} ORDER BY c.title`
    )
    .all(...(admin ? [] : [user.id])) as Array<{ id: number; title: string; status: string }>;
  const courseFilter = Number(q.course) || (courses[0]?.id ?? 0);
  const selectedCourse = courses.find((c) => c.id === courseFilter);
  const assessmentFilter = Number(q.assessment) || 0;

  const assessments = courseFilter
    ? (db
        .prepare("SELECT id, title, type FROM assessments WHERE course_id = ? ORDER BY id")
        .all(courseFilter) as Array<{ id: number; title: string; type: string }>)
    : [];

  const questions = courseFilter
    ? (db
        .prepare(
          `SELECT q.id, q.type, q.prompt, q.options_json, q.correct_json, q.explanation, q.points, q.difficulty,
                  (SELECT GROUP_CONCAT(a.title, ', ') FROM assessment_questions aq JOIN assessments a ON a.id = aq.assessment_id WHERE aq.question_id = q.id) AS linked
           FROM questions q WHERE q.course_id = ? ORDER BY q.id DESC`
        )
        .all(courseFilter) as Array<{
        id: number;
        type: string;
        prompt: string;
        options_json: string | null;
        correct_json: string | null;
        explanation: string | null;
        points: number;
        difficulty: string;
        linked: string | null;
      }>)
    : [];

  const counts = db
    .prepare(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN type IN ('essay','short_answer') THEN 1 ELSE 0 END) AS manual
       FROM questions WHERE course_id = ?`
    )
    .get(courseFilter) as { total: number; manual: number | null };

  const errorMessage: Record<string, string> = {
    prompt: "A question prompt is required.",
    options: "Provide at least two options (one per line).",
    correct: "The correct answer is missing or invalid for this question type.",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assessment content"
        title="Question bank"
        description="Reusable questions by course. Add questions to knowledge checks, quizzes, assignments or final examinations."
        actions={<Link href="/instructor/courses" className="btn btn-outline btn-sm"><BookOpen size={14} /> Courses</Link>}
      />

      {q.saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          Question saved to the bank.
        </div>
      )}
      {q.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {errorMessage[q.error] ?? "Please check the question details."}
        </div>
      )}

      <div className="card flex flex-wrap items-end gap-3 p-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="min-w-[260px] flex-1">
            <label className="label" htmlFor="course">Course</label>
            <select id="course" name="course" className="select" defaultValue={courseFilter || ""}>
              {courses.length === 0 && <option value="">No courses available</option>}
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="min-w-[200px]">
            <label className="label" htmlFor="assessment">Assessment</label>
            <select id="assessment" name="assessment" className="select" defaultValue={assessmentFilter || ""}>
              <option value="">All assessments</option>
              {assessments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-outline btn-sm">Filter</button>
        </form>
        <div className="ml-auto text-[11.5px] text-muted">{counts.total} questions · {counts.manual ?? 0} manually marked</div>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={<FileQuestion size={24} />}
          title="Create a course first"
          description="Questions belong to a course. Create or get assigned a course to start building the bank."
          action={<Link href="/instructor/courses/new" className="btn btn-primary btn-sm">Create course</Link>}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-3">
            {questions.length === 0 && selectedCourse && (
              <EmptyState icon={<FileQuestion size={24} />} title="No questions yet" description={`Add the first question to ${selectedCourse.title} using the form.`} />
            )}
            {questions.map((question) => (
              <div key={question.id} className="card p-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="chip chip-blue">{humanStatus(question.type)}</span>
                  <span className="chip chip-gray">{question.difficulty}</span>
                  <span className="chip chip-gold">{question.points} pt{question.points === 1 ? "" : "s"}</span>
                  {question.linked && <span className="text-[10px] text-muted">Used in: {question.linked}</span>}
                </div>
                <p className="mt-2 text-[13px] font-semibold leading-snug text-ink">{question.prompt}</p>
                <div className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-[11px] text-muted">
                  <span className="font-semibold text-ink-soft">Answer: </span>
                  {describeCorrect(question.type, question.options_json, question.correct_json)}
                </div>
                {question.explanation && <p className="mt-1.5 text-[11px] text-muted">Explanation: {question.explanation}</p>}
                <div className="mt-2.5 flex justify-end">
                  <form action={deleteQuestionAction}>
                    <input type="hidden" name="questionId" value={question.id} />
                    <input type="hidden" name="courseId" value={courseFilter} />
                    <button type="submit" className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 dark:text-red-300"><Trash2 size={13} /> Delete</button>
                  </form>
                </div>
              </div>
            ))}
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-brand-700 dark:text-brand-300" />
              <h2 className="font-display text-[16px] font-bold text-ink">New question</h2>
            </div>
            <p className="mt-1 text-[11px] text-muted">Supports multiple choice, multi-select, true/false, fill-in-the-gap, matching, short answer and essay.</p>

            <form action={createQuestionAction} className="mt-4 space-y-3">
              <input type="hidden" name="courseId" value={courseFilter} />
              <div>
                <label className="label">Question type</label>
                <select name="type" className="select" defaultValue="mcq">
                  <option value="mcq">Multiple choice (single answer)</option>
                  <option value="multi">Multi-select</option>
                  <option value="true_false">True / False</option>
                  <option value="fill">Fill in the gap</option>
                  <option value="matching">Matching</option>
                  <option value="short_answer">Short answer (manual)</option>
                  <option value="scenario">Scenario (manual)</option>
                  <option value="essay">Essay (manual)</option>
                </select>
              </div>
              <div>
                <label className="label">Prompt</label>
                <textarea name="prompt" className="textarea min-h-[80px]" required placeholder="State the question or scenario clearly" />
              </div>
              <div>
                <label className="label">Options</label>
                <textarea name="options" className="textarea min-h-[85px]" placeholder={"One option per line\nFor matching use: Left term = Right match"} />
              </div>
              <div>
                <label className="label">Correct answer</label>
                <input name="correct" className="input" placeholder="MCQ: option number · Multi: 1,3 · Fill: accepted|answers · Matching: leave blank" />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="label">Points</label>
                  <input name="points" type="number" min={1} max={50} defaultValue={1} className="input" />
                </div>
                <div>
                  <label className="label">Difficulty</label>
                  <select name="difficulty" className="select" defaultValue="medium">
                    <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="label">Assessment</label>
                  <select name="assessmentId" className="select" defaultValue={assessmentFilter || ""}>
                    <option value="">Bank only</option>
                    {assessments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Explanation (shown after marking)</label>
                <textarea name="explanation" className="textarea min-h-[60px]" placeholder="Why the answer is correct" />
              </div>
              <button type="submit" className="btn btn-primary w-full"><Plus size={14} /> Add to bank</button>
            </form>

            <details className="mt-4 rounded-lg border border-line bg-panel-2 px-3 py-2 text-[10.5px] leading-relaxed text-muted">
              <summary className="cursor-pointer font-semibold text-ink-soft">Answer format reference</summary>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li><strong>Multiple choice:</strong> options one per line; correct = option number (1-based).</li>
                <li><strong>Multi-select:</strong> correct = option numbers separated by commas, e.g. 1,3.</li>
                <li><strong>True/False:</strong> correct = true or false.</li>
                <li><strong>Fill in the gap:</strong> correct = accepted answers separated by | (bar).</li>
                <li><strong>Matching:</strong> options lines “Left = Right”; no correct answer field needed.</li>
                <li><strong>Short answer / scenario / essay:</strong> marked manually by an instructor with per-question feedback.</li>
              </ul>
            </details>
          </section>
        </div>
      )}
    </div>
  );
}
