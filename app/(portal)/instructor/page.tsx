import Link from "next/link";
import { BarChart3, BookOpen, ClipboardCheck, FileQuestion, GraduationCap, Plus, Star, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime, fullName, humanStatus, timeAgo } from "@/lib/format";
import { isAdministrator } from "@/lib/rbac";
import { EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function InstructorDashboard() {
  const user = await requireUser(["instructor", "super_admin", "training_admin"]);
  const db = getDb();
  const admin = isAdministrator(user.role as "super_admin");

  const courses = db
    .prepare(
      `SELECT c.id, c.title, c.status, c.level, c.updated_at, cat.name AS category_name,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrolled,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'completed') AS completed,
              (SELECT ROUND(AVG(e.progress_percent)) FROM enrollments e WHERE e.course_id = c.id) AS avg_progress,
              (SELECT ROUND(AVG(r.rating), 1) FROM course_feedback r WHERE r.course_id = c.id) AS rating,
              (SELECT COUNT(*) FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = c.id) AS lessons
       FROM courses c LEFT JOIN course_categories cat ON cat.id = c.category_id
       WHERE ${admin ? "1=1" : "c.instructor_id = ?"}
       ORDER BY c.updated_at DESC`
    )
    .all(...(admin ? [] : [user.id])) as Array<{
    id: number;
    title: string;
    status: string;
    level: string;
    updated_at: string;
    category_name: string | null;
    enrolled: number;
    completed: number;
    avg_progress: number | null;
    rating: number | null;
    lessons: number;
  }>;

  const courseIds = courses.map((c) => c.id);
  const placeholders = courseIds.length ? courseIds.map(() => "?").join(",") : "0";

  const pendingGrading = db
    .prepare(
      `SELECT at.id, at.submitted_at, u.first_name, u.middle_name, u.last_name, u.staff_id, a.title AS assessment_title,
              c.title AS course_title
       FROM assessment_attempts at
       JOIN assessments a ON a.id = at.assessment_id
       JOIN courses c ON c.id = a.course_id
       JOIN users u ON u.id = at.user_id
       WHERE at.status = 'submitted' AND a.course_id IN (${placeholders})
       ORDER BY at.submitted_at ASC`
    )
    .all(...courseIds) as Array<{
    id: number;
    submitted_at: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    staff_id: string;
    assessment_title: string;
    course_title: string;
  }>;

  const learners = (
    db
      .prepare(`SELECT COUNT(DISTINCT user_id) AS n FROM enrollments WHERE course_id IN (${placeholders})`)
      .get(...courseIds) as { n: number }
  ).n;
  const certs = (
    db
      .prepare(`SELECT COUNT(*) AS n FROM certificates WHERE revoked = 0 AND course_id IN (${placeholders})`)
      .get(...courseIds) as { n: number }
  ).n;
  const questionCount = (
    db
      .prepare(`SELECT COUNT(*) AS n FROM questions WHERE course_id IN (${placeholders})`)
      .get(...courseIds) as { n: number }
  ).n;
  const avgRating = courses.filter((c) => c.rating).length
    ? (courses.reduce((s, c) => s + (c.rating ?? 0), 0) / courses.filter((c) => c.rating).length).toFixed(1)
    : "—";
  const totalEnrolled = courses.reduce((s, c) => s + c.enrolled, 0);
  const maxEnrolled = Math.max(1, ...courses.map((c) => c.enrolled));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Instructor workspace"
        title={`Welcome, ${user.first_name}`}
        description={
          admin
            ? "Organisation-wide instructor view. Manage course content, the question bank, grading and course analytics."
            : "Manage your assigned courses, build assessments, mark submitted work and monitor learner performance."
        }
        actions={
          <>
            <Link href="/instructor/questions/new" className="btn btn-outline btn-sm">
              <FileQuestion size={14} /> New question
            </Link>
            <Link href="/instructor/courses/new" className="btn btn-primary btn-sm">
              <Plus size={14} /> Create course
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Courses" value={courses.length} sub={`${courses.filter((c) => c.status === "published").length} published`} icon={<BookOpen size={18} />} />
        <StatCard label="Learners enrolled" value={learners} sub={`${totalEnrolled} enrolments`} icon={<GraduationCap size={18} />} tone="blue" />
        <StatCard label="Awaiting grading" value={pendingGrading.length} sub="Manual items to mark" icon={<ClipboardCheck size={18} />} tone="gold" />
        <StatCard label="Certificates issued" value={certs} sub={`Average rating ${avgRating}`} icon={<Star size={18} />} tone="green" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-[16px] font-bold text-ink">Course performance</h2>
              <p className="mt-0.5 text-[11.5px] text-muted">Enrolments, average progress and completion per course.</p>
            </div>
            <Link href="/instructor/reports" className="btn btn-ghost btn-sm">
              <BarChart3 size={14} /> Reports
            </Link>
          </div>
          {courses.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={24} />}
              title="No courses yet"
              description="Create your first course, add modules and lessons, then publish it to the catalogue."
              action={<Link href="/instructor/courses/new" className="btn btn-primary btn-sm">Create course</Link>}
            />
          ) : (
            <div className="space-y-4 p-5">
              {courses.map((c) => {
                const completion = c.enrolled ? Math.round((c.completed / c.enrolled) * 100) : 0;
                return (
                  <div key={c.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/instructor/courses/${c.id}/edit`} className="truncate text-[13px] font-semibold text-ink hover:text-brand-700 dark:hover:text-brand-300">
                          {c.title}
                        </Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted">
                          <span className={`chip ${c.status === "published" ? "chip-green" : "chip-gray"} !py-0`}>{humanStatus(c.status)}</span>
                          <span>{c.category_name ?? "Uncategorised"}</span>
                          <span>· {c.lessons} lessons</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="text-muted">{c.enrolled} enrolled</span>
                        <span className="font-semibold text-ink">{c.avg_progress ?? 0}% avg</span>
                        <span className="text-muted">{completion}% completed</span>
                      </div>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-brand-700 dark:bg-brand-400" style={{ width: `${Math.max(3, Math.round((c.enrolled / maxEnrolled) * 100))}%` }} />
                      </div>
                      {c.rating ? (
                        <span className="flex items-center gap-0.5 text-[10.5px] text-muted"><Star size={11} className="text-gold-500" />{c.rating}</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-[16px] font-bold text-ink">Grading queue</h2>
              <p className="mt-0.5 text-[11.5px] text-muted">Submitted work requiring manual marks.</p>
            </div>
            <Link href="/instructor/grading" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {pendingGrading.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <ClipboardCheck className="mx-auto text-muted" size={22} />
              <p className="mt-2 text-[12.5px] font-semibold text-ink">Nothing awaiting grading</p>
              <p className="mt-1 text-[11.5px] text-muted">Auto-graded assessments are scored instantly.</p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              {pendingGrading.slice(0, 6).map((p) => (
                <Link key={p.id} href={`/instructor/grading/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-2">
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-semibold text-ink">{fullName(p.first_name, p.last_name, p.middle_name)} <span className="font-normal text-muted">({p.staff_id})</span></div>
                    <div className="truncate text-[10.5px] text-muted">{p.assessment_title} · {p.course_title}</div>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted">{p.submitted_at ? timeAgo(p.submitted_at) : ""}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/instructor/courses" className="card card-hover p-5">
          <BookOpen className="text-brand-700 dark:text-brand-300" size={20} />
          <h3 className="mt-3 font-display text-[15px] font-bold text-ink">My courses</h3>
          <p className="mt-1 text-[12px] text-muted">Edit modules, lessons, assessments and materials.</p>
        </Link>
        <Link href="/instructor/question-bank" className="card card-hover p-5">
          <FileQuestion className="text-brand-700 dark:text-brand-300" size={20} />
          <h3 className="mt-3 font-display text-[15px] font-bold text-ink">Question bank</h3>
          <p className="mt-1 text-[12px] text-muted">{questionCount} reusable questions across your courses.</p>
        </Link>
        <Link href="/instructor/reports" className="card card-hover p-5">
          <TrendingUp className="text-brand-700 dark:text-brand-300" size={20} />
          <h3 className="mt-3 font-display text-[15px] font-bold text-ink">Course analytics</h3>
          <p className="mt-1 text-[12px] text-muted">Pass rates, score distribution and exportable reports.</p>
        </Link>
      </div>

      <div className="rounded-xl border border-line bg-panel-2 px-4 py-3 text-[11px] text-muted">
        Demonstration environment · Last refreshed {formatDateTime(new Date())}. Staff and learner records are fictitious.
      </div>
    </div>
  );
}
