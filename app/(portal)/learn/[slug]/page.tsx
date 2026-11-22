import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FileText,
  Lock,
  PlayCircle,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getCourseCard } from "@/lib/queries";
import { ProgressBar } from "@/components/ui";
import { completeLessonAction, startAttemptAction } from "@/lib/actions/learning";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string; cert?: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const sp = await searchParams;
  const db = getDb();
  const card = getCourseCard(user.id, slug);
  if (!card) notFound();

  const courseId = card.id;
  const enrollment = db
    .prepare("SELECT id, status, progress_percent FROM enrollments WHERE user_id = ? AND course_id = ?")
    .get(user.id, courseId) as { id: number; status: string; progress_percent: number } | undefined;
  if (!enrollment) redirect(`/courses/${slug}`);

  const rows = db
    .prepare(
      `SELECT m.id AS module_id, m.title AS module_title, m.position AS module_position,
              l.id, l.title, l.type, l.content, l.video_url, l.resource_url, l.duration_minutes, l.position,
              lp.completed_at
       FROM modules m JOIN lessons l ON l.module_id = m.id
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = ?
       WHERE m.course_id = ? ORDER BY m.position ASC, l.position ASC`
    )
    .all(enrollment.id, courseId) as Array<{
    module_id: number;
    module_title: string;
    module_position: number;
    id: number;
    title: string;
    type: string;
    content: string | null;
    video_url: string | null;
    resource_url: string | null;
    duration_minutes: number;
    position: number;
    completed_at: string | null;
  }>;

  if (rows.length === 0) notFound();

  const requestedId = Number(sp.lesson);
  const current = rows.find((r) => r.id === requestedId) ?? rows.find((r) => !r.completed_at) ?? rows[0];
  const currentIndex = rows.findIndex((r) => r.id === current.id);
  const prev = currentIndex > 0 ? rows[currentIndex - 1] : null;
  const next = currentIndex < rows.length - 1 ? rows[currentIndex + 1] : null;
  const completed = rows.filter((r) => r.completed_at).length;

  const grouped = new Map<number, { title: string; lessons: typeof rows }>();
  for (const r of rows) {
    if (!grouped.has(r.module_id)) grouped.set(r.module_id, { title: r.module_title, lessons: [] });
    grouped.get(r.module_id)!.lessons.push(r);
  }

  const moduleAssessments = db
    .prepare(
      `SELECT a.id, a.title, a.duration_minutes, a.pass_mark, a.max_attempts,
              (SELECT COUNT(*) FROM assessment_attempts at WHERE at.assessment_id = a.id AND at.user_id = ? AND at.status != 'in_progress') AS used,
              (SELECT MAX(percent) FROM assessment_attempts at WHERE at.assessment_id = a.id AND at.user_id = ? AND at.status != 'in_progress') AS best,
              (SELECT id FROM assessment_attempts at WHERE at.assessment_id = a.id AND at.user_id = ? AND at.status = 'in_progress' LIMIT 1) AS open_attempt
       FROM assessments a WHERE a.course_id = ? AND a.module_id = ? AND a.is_published = 1 AND a.type = 'knowledge_check'`
    )
    .all(user.id, user.id, user.id, courseId, current.module_id) as Array<{
    id: number;
    title: string;
    duration_minutes: number;
    pass_mark: number;
    max_attempts: number;
    used: number;
    best: number | null;
    open_attempt: number | null;
  }>;

  const finalExam = db
    .prepare("SELECT id FROM assessments WHERE course_id = ? AND type = 'final_exam' AND is_published = 1 LIMIT 1")
    .get(courseId) as { id: number } | undefined;
  const allDone = completed === rows.length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Link href={`/courses/${slug}`} className="inline-flex items-center gap-1 text-[12px] font-medium text-muted hover:text-ink">
          <ChevronLeft size={14} /> {card.title}
        </Link>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span>{completed}/{rows.length} lessons</span>
          <div className="w-28"><ProgressBar value={(completed / rows.length) * 100} /></div>
          <span className="font-semibold text-ink">{Math.round((completed / rows.length) * 100)}%</span>
        </div>
      </div>

      {sp.cert === "1" && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-900 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-100">
          Congratulations — your certificate has been issued. <Link href="/certificates" className="underline">View certificate</Link>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="order-2 lg:order-1">
          <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scroll-thin p-4">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen size={15} className="text-brand-700 dark:text-brand-300" />
              <h2 className="font-display text-[14px] font-bold text-ink">Course contents</h2>
            </div>
            <div className="space-y-4">
              {Array.from(grouped.entries()).map(([moduleId, group], idx) => (
                <div key={moduleId}>
                  <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-surface-2 text-[9px]">{idx + 1}</span>
                    {group.title}
                  </div>
                  <ul className="space-y-0.5">
                    {group.lessons.map((lesson) => {
                      const active = lesson.id === current.id;
                      return (
                        <li key={lesson.id}>
                          <Link
                            href={`/learn/${slug}?lesson=${lesson.id}`}
                            className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-[11.5px] ${
                              active
                                ? "bg-brand-800 text-white"
                                : "text-ink-soft hover:bg-surface-2"
                            }`}
                          >
                            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                              lesson.completed_at
                                ? active ? "bg-white/20 text-white" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                : active ? "border border-white/40 text-white" : "border border-line text-muted"
                            }`}>
                              {lesson.completed_at ? <CheckCircle2 size={10} /> : <PlayCircle size={9} />}
                            </span>
                            <span className="flex-1 leading-snug">{lesson.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-line pt-3">
              {allDone && finalExam ? (
                <Link href={`/courses/${slug}#assessments`} className="btn btn-gold btn-sm w-full justify-center">
                  <ClipboardCheck size={13} /> Final examination
                </Link>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-[10.5px] text-muted">
                  <Lock size={12} /> Final exam unlocks after all lessons
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="order-1 min-w-0 lg:order-2">
          <article className="card overflow-hidden">
            <div className="border-b border-line bg-panel-2 px-5 py-4 md:px-7">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="chip chip-gray">{current.module_title}</span>
                <span className="chip chip-green capitalize">{current.type.replace("_", " ")}</span>
                {current.completed_at && <span className="chip chip-green"><CheckCircle2 size={10} /> Completed</span>}
              </div>
              <h1 className="mt-2 font-display text-[22px] font-bold leading-tight text-ink md:text-[26px]">{current.title}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10.5px] text-muted">
                <span className="flex items-center gap-1"><Clock size={11} /> {current.duration_minutes} minutes</span>
                <span>Lesson {currentIndex + 1} of {rows.length}</span>
              </div>
            </div>

            <div className="px-5 py-6 md:px-7">
              {current.video_url && (
                <div className="mb-5 overflow-hidden rounded-xl border border-line bg-[#071a3a]">
                  <div className="flex items-center justify-center gap-2 px-4 py-10 text-white/70">
                    <PlayCircle size={26} className="text-[#8fc0f5]" />
                    <span className="text-[12px]">Video lesson — {current.video_url}</span>
                  </div>
                </div>
              )}

              {current.content ? (
                <div className="lesson-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(current.content) }} />
              ) : (
                <p className="text-[13px] text-muted">No lesson content has been provided for this item.</p>
              )}

              {current.resource_url && (
                <a href={current.resource_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm mt-5">
                  <FileText size={13} /> Download resource <ExternalLink size={11} />
                </a>
              )}

              {!current.completed_at ? (
                <form action={completeLessonAction} className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                  <input type="hidden" name="lessonId" value={current.id} />
                  <input type="hidden" name="slug" value={slug} />
                  <button className="btn btn-primary">
                    <CheckCircle2 size={15} /> Mark lesson complete
                  </button>
                  <span className="text-[11px] text-muted">Progress is saved to your staff learning record.</span>
                </form>
              ) : (
                <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-green-700 dark:text-green-300">
                    <CheckCircle2 size={15} /> Lesson completed
                  </span>
                  {next && (
                    <Link href={`/learn/${slug}?lesson=${next.id}`} className="btn btn-outline btn-sm">
                      Next lesson <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line bg-panel-2 px-5 py-3">
              {prev ? (
                <Link href={`/learn/${slug}?lesson=${prev.id}`} className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft hover:text-ink">
                  <ArrowLeft size={13} /> Previous
                </Link>
              ) : <span />}
              {next ? (
                <Link href={`/learn/${slug}?lesson=${next.id}`} className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft hover:text-ink">
                  Next <ArrowRight size={13} />
                </Link>
              ) : (
                <span className="text-[11px] text-muted">Last lesson</span>
              )}
            </div>
          </article>

          {moduleAssessments.length > 0 && (
            <div className="card mt-4 p-5">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={16} className="text-brand-700 dark:text-brand-300" />
                <h2 className="font-display text-[15px] font-bold text-ink">Knowledge check — {current.module_title}</h2>
              </div>
              {moduleAssessments.map((a) => (
                <div key={a.id} className="mt-3 flex flex-col gap-3 rounded-xl border border-line bg-panel-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{a.title}</div>
                    <div className="mt-0.5 text-[10.5px] text-muted">
                      {a.duration_minutes} minutes · Pass mark {a.pass_mark}% · {a.used}/{a.max_attempts} attempts used
                      {a.best !== null ? ` · Best ${a.best}%` : ""}
                    </div>
                  </div>
                  {a.open_attempt ? (
                    <Link href={`/learn/${slug}/exam/${a.id}?attempt=${a.open_attempt}`} className="btn btn-gold btn-sm">Resume check</Link>
                  ) : a.used >= a.max_attempts ? (
                    <span className="text-[11px] text-muted">No attempts remaining</span>
                  ) : (
                    <form action={startAttemptAction}>
                      <input type="hidden" name="assessmentId" value={a.id} />
                      <button className="btn btn-outline btn-sm">{a.used > 0 ? "Retake check" : "Start knowledge check"}</button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
