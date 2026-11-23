import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  UserRound,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, fullName } from "@/lib/format";
import { getCourseCard, getCourseCards } from "@/lib/queries";
import { CourseCard, ProgressBar } from "@/components/ui";
import { enrollAction, startAttemptAction, submitFeedbackAction } from "@/lib/actions/learning";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  knowledge_check: "Knowledge check",
  final_exam: "Final examination",
  assignment: "Assignment",
  quiz: "Quiz",
};

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ completed?: string; locked?: string; feedback?: string; cert?: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const sp = await searchParams;
  const db = getDb();
  const rangeCard = getCourseCard(user.id, slug);
  if (!rangeCard) notFound();

  const course = db
    .prepare(
      `SELECT c.*, cat.name AS category_name, cat.slug AS category_slug,
              TRIM(COALESCE(i.first_name, '') || ' ' || COALESCE(i.middle_name || ' ', '') || COALESCE(i.last_name, '')) AS instructor_name,
              i.designation AS instructor_designation, i.email AS instructor_email, i.id AS instructor_id,
              d.name AS department_name
       FROM courses c
       LEFT JOIN course_categories cat ON cat.id = c.category_id
       LEFT JOIN users i ON i.id = c.instructor_id
       LEFT JOIN departments d ON d.id = c.department_id
       WHERE c.slug = ? AND c.status = 'published'`
    )
    .get(slug) as Record<string, unknown> | undefined;
  if (!course) notFound();

  const courseId = Number(course.id);
  const enrollment = db
    .prepare("SELECT id, status, progress_percent, completed_at, last_lesson_id, enrolled_at FROM enrollments WHERE user_id = ? AND course_id = ?")
    .get(user.id, courseId) as
    | { id: number; status: string; progress_percent: number; completed_at: string | null; last_lesson_id: number | null; enrolled_at: string }
    | undefined;

  const modules = db
    .prepare(
      `SELECT m.id AS module_id, m.title AS module_title, m.description AS module_description, m.position,
              l.id AS lesson_id, l.title AS lesson_title, l.type AS lesson_type, l.duration_minutes, l.position AS lesson_position,
              lp.completed_at
       FROM modules m
       LEFT JOIN lessons l ON l.module_id = m.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = ?
       WHERE m.course_id = ? ORDER BY m.position ASC, l.position ASC`
    )
    .all(enrollment?.id ?? -1, courseId) as Array<{
    module_id: number;
    module_title: string;
    module_description: string | null;
    position: number;
    lesson_id: number | null;
    lesson_title: string | null;
    lesson_type: string | null;
    duration_minutes: number | null;
    lesson_position: number | null;
    completed_at: string | null;
  }>;

  const moduleMap = new Map<number, { id: number; title: string; description: string | null; lessons: typeof modules }>();
  for (const row of modules) {
    if (!moduleMap.has(row.module_id)) {
      moduleMap.set(row.module_id, { id: row.module_id, title: row.module_title, description: row.module_description, lessons: [] });
    }
    if (row.lesson_id) moduleMap.get(row.module_id)!.lessons.push(row);
  }

  const assessments = db
    .prepare(
      `SELECT a.id, a.title, a.type, a.pass_mark, a.duration_minutes, a.max_attempts, a.instructions,
              (SELECT COUNT(*) FROM assessment_questions aq WHERE aq.assessment_id = a.id) AS question_count,
              (SELECT MAX(percent) FROM assessment_attempts at WHERE at.assessment_id = a.id AND at.user_id = ? AND at.status != 'in_progress') AS best_percent,
              (SELECT MAX(passed) FROM assessment_attempts at WHERE at.assessment_id = a.id AND at.user_id = ? AND at.status != 'in_progress') AS best_passed,
              (SELECT COUNT(*) FROM assessment_attempts at WHERE at.assessment_id = a.id AND at.user_id = ? AND at.status != 'in_progress') AS used_attempts,
              (SELECT id FROM assessment_attempts at WHERE at.assessment_id = a.id AND at.user_id = ? AND at.status = 'in_progress' LIMIT 1) AS open_attempt,
              (SELECT status FROM assessment_attempts at WHERE at.assessment_id = a.id AND at.user_id = ? ORDER BY at.id DESC LIMIT 1) AS last_status
       FROM assessments a WHERE a.course_id = ? AND a.is_published = 1
       ORDER BY CASE a.type WHEN 'knowledge_check' THEN 1 WHEN 'final_exam' THEN 2 ELSE 3 END, a.id ASC`
    )
    .all(user.id, user.id, user.id, user.id, user.id, courseId) as Array<{
    id: number;
    title: string;
    type: string;
    pass_mark: number;
    duration_minutes: number;
    max_attempts: number;
    instructions: string | null;
    question_count: number;
    best_percent: number | null;
    best_passed: number | null;
    used_attempts: number;
    open_attempt: number | null;
    last_status: string | null;
  }>;

  const lessonTotal = modules.filter((m) => m.lesson_id).length;
  const lessonDone = modules.filter((m) => m.lesson_id && m.completed_at).length;
  const allLessonsDone = lessonTotal > 0 && lessonDone === lessonTotal;
  const nextLesson = modules.find((m) => m.lesson_id && !m.completed_at);

  const materials = db
    .prepare("SELECT id, title, filename, mime, size FROM materials WHERE course_id = ? ORDER BY id")
    .all(courseId) as Array<{ id: number; title: string; filename: string; mime: string; size: number }>;

  const feedbackSummary = db
    .prepare("SELECT COUNT(*) AS n, ROUND(AVG(rating), 1) AS avg FROM course_feedback WHERE course_id = ?")
    .get(courseId) as { n: number; avg: number | null };
  const feedback = db
    .prepare(
      `SELECT f.rating, f.comments, f.created_at, u.first_name, u.middle_name, u.last_name FROM course_feedback f
       JOIN users u ON u.id = f.user_id WHERE f.course_id = ? AND f.comments IS NOT NULL AND f.comments != ''
       ORDER BY f.created_at DESC LIMIT 3`
    )
    .all(courseId) as Array<{ rating: number; comments: string; created_at: string; first_name: string; middle_name: string | null; last_name: string }>;
  const myFeedback = enrollment
    ? (db
        .prepare("SELECT rating, comments FROM course_feedback WHERE course_id = ? AND user_id = ?")
        .get(courseId, user.id) as { rating: number; comments: string | null } | undefined)
    : undefined;

  let objectives: string[] = [];
  try {
    objectives = JSON.parse(String(course.objectives_json ?? "[]")) as string[];
  } catch {
    objectives = [];
  }

  const related = getCourseCards(user.id, { category: String(course.category_slug ?? ""), limit: 6 })
    .filter((c) => c.id !== courseId)
    .slice(0, 3);

  const enrolledCount = rangeCard.enrolledCount;
  const rating = rangeCard.rating;

  return (
    <div className="space-y-6">
      <Link href="/courses" className="inline-flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink">
        <ChevronLeft size={14} /> Back to catalogue
      </Link>

      {sp.completed === "1" && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-900 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-100">
          <strong>All lessons completed.</strong> {sp.cert === "1" ? "Your certificate has been issued — view it in My Certificates." : "Sit the final examination to complete the course and earn your certificate."}{" "}
          <Link href="/certificates" className="underline">My certificates</Link>
        </div>
      )}
      {sp.locked === "1" && (
        <div className="rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-[12.5px] text-gold-900 dark:border-gold-900/40 dark:bg-gold-900/20 dark:text-gold-100">
          <strong>Final examination locked.</strong> Complete all {lessonTotal} lessons before attempting the final examination.
        </div>
      )}
      {sp.feedback === "1" && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-900 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-100">
          Thank you — your course feedback has been recorded.
        </div>
      )}

      <section className="relative overflow-hidden rounded-2xl bg-[#0b2550] p-6 text-white md:p-8">
        <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#2f7cd6]/15 blur-2xl" />
        <div className="relative max-w-4xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="chip border border-white/15 bg-white/10 text-white">{String(course.category_name ?? "General")}</span>
            <span className="chip border border-white/15 bg-white/10 text-white">{String(course.level)}</span>
            {Number(course.is_mandatory) ? <span className="chip chip-gold">Mandatory</span> : null}
            {String(course.legal_review_status) === "demo_pending" && <span className="chip border border-[#8fc0f5]/40 bg-[#8fc0f5]/15 text-[#cfe2fb]">Legal review pending</span>}
          </div>
          <h1 className="mt-3 font-display text-[26px] font-bold leading-tight md:text-[34px]">{String(course.title)}</h1>
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-white/70">{String(course.summary)}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-white/70">
            <span className="flex items-center gap-1.5"><Layers size={13} /> {moduleMap.size} modules</span>
            <span className="flex items-center gap-1.5"><BookOpen size={13} /> {lessonTotal} lessons</span>
            <span className="flex items-center gap-1.5"><Clock size={13} /> {Math.round(Number(course.duration_minutes) / 60)}h estimated</span>
            {Number(course.cpd_points) > 0 && <span className="flex items-center gap-1.5"><Sparkles size={13} /> {String(course.cpd_points)} CPD points</span>}
            <span className="flex items-center gap-1.5"><GraduationCap size={13} /> {enrolledCount} enrolled</span>
            <span className="flex items-center gap-1.5"><Star size={13} className="text-[#8fc0f5]" /> {rating > 0 ? `${rating.toFixed(1)} rating` : "New course"}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {enrollment ? (
              <>
                <Link
                  href={allLessonsDone ? "#assessments" : `/learn/${slug}${nextLesson?.lesson_id ? `?lesson=${nextLesson.lesson_id}` : ""}`}
                  className="btn btn-gold btn-sm"
                >
                  <Play size={14} /> {allLessonsDone ? "Take final assessment" : "Continue learning"}
                </Link>
                {enrollment.completed_at && <span className="chip chip-gold">Completed {formatDate(enrollment.completed_at)}</span>}
              </>
            ) : (
              <form action={enrollAction}>
                <input type="hidden" name="courseId" value={courseId} />
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className="btn btn-gold btn-sm"><Play size={14} /> Enrol in this course</button>
              </form>
            )}
            <Link href="/verify" className="btn btn-sm border border-white/20 bg-white/10 text-white hover:bg-white/15">
              <ShieldCheck size={14} /> Verify a certificate
            </Link>
          </div>
        </div>
      </section>

      {String(course.legal_review_status) === "demo_pending" && (
        <div className="flex items-start gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-[11.5px] leading-relaxed text-gold-900 dark:border-gold-900/40 dark:bg-gold-900/20 dark:text-gold-100">
          <ShieldCheck size={15} className="mt-0.5 shrink-0" />
          <span>
            <strong>Demonstration legal content.</strong> This course contains sample content that is pending formal review and approval by the Legal Department. It is provided for demonstration of the system only and does not constitute legal advice.
          </span>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section className="card p-5">
            <h2 className="font-display text-[17px] font-bold text-ink">About this course</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{String(course.description)}</p>
            {objectives.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-muted">Learning outcomes</div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {objectives.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-soft">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-300" /> {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[17px] font-bold text-ink">Course curriculum</h2>
              <span className="text-[11px] text-muted">{lessonDone}/{lessonTotal} lessons complete</span>
            </div>
            <ProgressBar value={lessonTotal ? (lessonDone / lessonTotal) * 100 : 0} className="mb-4" />
            <div className="space-y-2">
              {Array.from(moduleMap.values()).map((m, idx) => (
                <details key={m.id} className="group rounded-xl border border-line bg-panel-2" open={idx === 0}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-ink">{m.title}</div>
                      {m.description && <div className="truncate text-[11px] text-muted">{m.description}</div>}
                    </div>
                    <span className="text-[10.5px] text-muted">{m.lessons.length} lessons</span>
                  </summary>
                  <ul className="border-t border-line px-2 py-2">
                    {m.lessons.map((lesson) => (
                      <li key={lesson.lesson_id}>
                        {enrollment ? (
                          <Link
                            href={`/learn/${slug}?lesson=${lesson.lesson_id}`}
                            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12px] hover:bg-surface-2"
                          >
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${lesson.completed_at ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "border border-line text-muted"}`}>
                              {lesson.completed_at ? <CheckCircle2 size={12} /> : <Play size={9} className="ml-0.5" />}
                            </span>
                            <span className={`flex-1 ${lesson.completed_at ? "text-ink-soft" : "text-ink"}`}>{lesson.lesson_title}</span>
                            <span className="flex items-center gap-1 text-[10px] text-muted"><Clock size={10} /> {lesson.duration_minutes} min</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12px] text-ink-soft">
                            <Lock size={11} className="text-muted" />
                            <span className="flex-1">{lesson.lesson_title}</span>
                            <span className="text-[10px] text-muted">{lesson.duration_minutes} min</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>

          <section id="assessments" className="card p-5">
            <h2 className="font-display text-[17px] font-bold text-ink">Assessments</h2>
            <p className="mt-1 text-[11.5px] text-muted">
              Knowledge checks reinforce each module. The final examination must be passed to earn a certificate.
            </p>
            <div className="mt-4 space-y-3">
              {assessments.map((a) => {
                const typeLabel = TYPE_LABEL[a.type] ?? a.type;
                const isFinal = a.type === "final_exam";
                const locked = isFinal && !allLessonsDone;
                const exhausted = a.used_attempts >= a.max_attempts && !a.open_attempt;
                const passed = a.best_passed === 1;
                return (
                  <div key={a.id} className="rounded-xl border border-line bg-panel-2 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`chip ${isFinal ? "chip-gold" : a.type === "assignment" ? "chip-blue" : "chip-green"}`}>{typeLabel}</span>
                          {passed && <span className="chip chip-green">Passed {a.best_percent}%</span>}
                          {a.last_status === "submitted" && <span className="chip chip-gold">Awaiting grading</span>}
                          {locked && <span className="chip chip-gray"><Lock size={10} /> Locked</span>}
                          {exhausted && !passed && <span className="chip chip-red">Attempts exhausted</span>}
                        </div>
                        <h3 className="mt-1.5 font-display text-[14.5px] font-bold text-ink">{a.title}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted">
                          <span className="flex items-center gap-1"><ClipboardList size={11} /> {a.question_count} question{a.question_count === 1 ? "" : "s"}</span>
                          <span className="flex items-center gap-1"><Timer size={11} /> {a.duration_minutes > 0 ? `${a.duration_minutes} minutes` : "Untimed"}</span>
                          <span className="flex items-center gap-1"><Award size={11} /> Pass mark {a.pass_mark}%</span>
                          <span>{a.used_attempts}/{a.max_attempts} attempts used</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {a.open_attempt ? (
                          <Link href={`/learn/${slug}/exam/${a.id}?attempt=${a.open_attempt}`} className="btn btn-gold btn-sm">Resume</Link>
                        ) : !enrollment ? (
                          <form action={enrollAction}>
                            <input type="hidden" name="courseId" value={courseId} />
                            <input type="hidden" name="slug" value={slug} />
                            <button className="btn btn-outline btn-sm">Enrol to start</button>
                          </form>
                        ) : locked ? (
                          <span className="text-[10.5px] text-muted">Complete lessons first</span>
                        ) : exhausted ? (
                          <span className="text-[10.5px] text-muted">No attempts left</span>
                        ) : (
                          <form action={startAttemptAction}>
                            <input type="hidden" name="assessmentId" value={a.id} />
                            <button className="btn btn-primary btn-sm">
                              {a.used_attempts > 0 ? "Retake" : "Start"} <Play size={12} />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {materials.length > 0 && (
            <section className="card p-5">
              <h2 className="font-display text-[17px] font-bold text-ink">Course materials</h2>
              <ul className="mt-3 divide-y divide-line">
                {materials.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-2.5">
                    <FileText size={16} className="text-brand-700 dark:text-brand-300" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-semibold text-ink">{m.title}</div>
                      <div className="text-[10.5px] text-muted">{m.filename} · {(m.size / 1024).toFixed(0)} KB</div>
                    </div>
                    <span className="chip chip-gray">{m.mime.split("/").pop()?.toUpperCase()}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[17px] font-bold text-ink">Learner feedback</h2>
              <div className="flex items-center gap-1 text-[12px] font-semibold text-ink">
                <Star size={14} className="text-[#2f7cd6]" /> {feedbackSummary.avg ? feedbackSummary.avg.toFixed(1) : "—"}
                <span className="font-normal text-muted">({feedbackSummary.n})</span>
              </div>
            </div>
            {feedback.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {feedback.map((f) => (
                  <li key={`${f.created_at}-${f.first_name}`} className="rounded-lg bg-panel-2 p-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-ink">{fullName(f.first_name, f.last_name, f.middle_name)}</span>
                      <span className="text-[#2f7cd6]">{"★".repeat(f.rating)}</span>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">{f.comments}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[12px] text-muted">No feedback submitted yet.</p>
            )}
            {enrollment && (
              <form action={submitFeedbackAction} className="mt-4 border-t border-line pt-4">
                <input type="hidden" name="courseId" value={courseId} />
                <input type="hidden" name="slug" value={slug} />
                <div className="grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end">
                  <div>
                    <label htmlFor="rating" className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted">Your rating</label>
                    <select id="rating" name="rating" defaultValue={myFeedback?.rating ?? 5} className="input">
                      <option value="5">5 — Excellent</option>
                      <option value="4">4 — Very good</option>
                      <option value="3">3 — Good</option>
                      <option value="2">2 — Fair</option>
                      <option value="1">1 — Poor</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="comments" className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted">Comments</label>
                    <input id="comments" name="comments" defaultValue={myFeedback?.comments ?? ""} maxLength={1000} placeholder="Share your experience…" className="input" />
                  </div>
                  <button className="btn btn-primary btn-sm h-[38px]">Submit</button>
                </div>
              </form>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <div className="card sticky top-20 p-5">
            <h3 className="font-display text-[15px] font-bold text-ink">Your enrolment</h3>
            {enrollment ? (
              <>
                <div className="mt-3 flex items-center justify-between text-[11.5px] text-muted">
                  <span>Progress</span><span className="font-semibold text-ink">{enrollment.progress_percent}%</span>
                </div>
                <ProgressBar value={enrollment.progress_percent} className="mt-1.5" />
                <div className="mt-3 space-y-1.5 text-[11.5px] text-muted">
                  <div className="flex justify-between"><span>Status</span><span className="font-semibold capitalize text-ink">{enrollment.status}</span></div>
                  <div className="flex justify-between"><span>Enrolled</span><span className="font-semibold text-ink">{formatDate(enrollment.enrolled_at as string)}</span></div>
                  {enrollment.completed_at && <div className="flex justify-between"><span>Completed</span><span className="font-semibold text-ink">{formatDate(enrollment.completed_at)}</span></div>}
                </div>
                <Link
                  href={allLessonsDone ? "#assessments" : `/learn/${slug}${nextLesson?.lesson_id ? `?lesson=${nextLesson.lesson_id}` : ""}`}
                  className="btn btn-primary btn-sm mt-4 w-full justify-center"
                >
                  {allLessonsDone ? "Go to assessments" : "Continue course"}
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  Enrol to access all lessons, knowledge checks and the final examination. Completion is recorded against your staff record.
                </p>
                <form action={enrollAction} className="mt-3">
                  <input type="hidden" name="courseId" value={courseId} />
                  <input type="hidden" name="slug" value={slug} />
                  <button className="btn btn-primary w-full justify-center">Enrol now</button>
                </form>
              </>
            )}

            <div className="mt-5 border-t border-line pt-4">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Certification</div>
              <ul className="mt-2 space-y-2 text-[11.5px] text-ink-soft">
                <li className="flex items-start gap-2"><CheckCircle2 size={13} className="mt-0.5 text-brand-600" /> Complete all lessons</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={13} className="mt-0.5 text-brand-600" /> Pass final exam at {String(course.pass_mark)}%</li>
                <li className="flex items-start gap-2"><Award size={13} className="mt-0.5 text-brand-600" /> Certificate with QR verification</li>
                <li className="flex items-start gap-2"><Sparkles size={13} className="mt-0.5 text-brand-600" /> {String(course.cpd_points)} CPD points and automatic badges</li>
              </ul>
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Instructor</div>
              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-[11px] font-bold text-white">
                  {String(course.instructor_name || "ICPC").split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold text-ink">{String(course.instructor_name || "ICPC Training")}</div>
                  <div className="truncate text-[10px] text-muted">{String(course.instructor_designation || "Instructor")}</div>
                </div>
              </div>
              <Link href={`mailto:${String(course.instructor_email ?? "")}`} className="mt-2 flex items-center gap-1.5 text-[10.5px] text-brand-700 hover:underline dark:text-brand-300">
                <UserRound size={11} /> Contact instructor
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-[17px] font-bold text-ink">More in {String(course.category_name)}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((c) => <CourseCard key={c.id} course={c} href={`/courses/${c.slug}`} />)}
          </div>
        </section>
      )}
    </div>
  );
}
