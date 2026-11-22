import Link from "next/link";
import { Award, BookOpen, CheckCircle2, ClipboardList, Download, GraduationCap, History as HistoryIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, fullName, statusChip } from "@/lib/format";
import { EmptyState, PageHeader, ProgressBar, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUser();
  const db = getDb();

  const enrollments = db
    .prepare(
      `SELECT e.id, e.status, e.progress_percent, e.enrolled_at, e.completed_at, c.slug, c.title, c.level,
              cat.name AS category_name, c.duration_minutes,
              (SELECT COUNT(*) FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = c.id) AS lesson_count,
              (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.enrollment_id = e.id) AS lessons_done
       FROM enrollments e JOIN courses c ON c.id = e.course_id
       LEFT JOIN course_categories cat ON cat.id = c.category_id
       WHERE e.user_id = ? ORDER BY e.enrolled_at DESC`
    )
    .all(user.id) as Array<{
    id: number;
    status: string;
    progress_percent: number;
    enrolled_at: string;
    completed_at: string | null;
    slug: string;
    title: string;
    level: string;
    category_name: string | null;
    duration_minutes: number;
    lesson_count: number;
    lessons_done: number;
  }>;

  const attempts = db
    .prepare(
      `SELECT at.id, at.attempt_number, at.percent, at.passed, at.status, at.submitted_at, at.time_spent_seconds,
              a.title, a.type, c.slug, c.title AS course_title
       FROM assessment_attempts at JOIN assessments a ON a.id = at.assessment_id JOIN courses c ON c.id = a.course_id
       WHERE at.user_id = ? AND at.status != 'in_progress' ORDER BY at.submitted_at DESC LIMIT 50`
    )
    .all(user.id) as Array<{
    id: number;
    attempt_number: number;
    percent: number | null;
    passed: number | null;
    status: string;
    submitted_at: string;
    time_spent_seconds: number | null;
    title: string;
    type: string;
    slug: string;
    course_title: string;
  }>;

  const completed = enrollments.filter((e) => e.status === "completed").length;
  const totalMinutes = enrollments.filter((e) => e.status === "completed").reduce((sum, e) => sum + e.duration_minutes, 0);
  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + (a.percent ?? 0), 0) / attempts.length) : 0;
  const certCount = (
    db.prepare("SELECT COUNT(*) AS n FROM certificates WHERE user_id = ? AND revoked = 0").get(user.id) as { n: number }
  ).n;

  return (
    <div>
      <PageHeader
        eyebrow="Learning record"
        title="My Learning History"
        description={`Official training record for ${fullName(user.first_name, user.last_name)} (${user.staff_id}). Includes enrolments, progress and assessment attempts.`}
        actions={
          <>
            <Link href="/transcript" className="btn btn-outline btn-sm"><Download size={13} /> Transcript (print)</Link>
            <Link href="/courses" className="btn btn-primary btn-sm"><BookOpen size={13} /> Find a course</Link>
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total enrolments" value={enrollments.length} sub={`${completed} completed`} icon={<BookOpen size={18} />} />
        <StatCard label="Completed courses" value={completed} sub={`${Math.round(totalMinutes / 60)} learning hours`} icon={<GraduationCap size={18} />} tone="gold" />
        <StatCard label="Assessments taken" value={attempts.length} sub={`${avg}% average score`} icon={<ClipboardList size={18} />} tone="blue" />
        <StatCard label="Certificates" value={certCount} sub="Issued credentials" icon={<Award size={18} />} tone="red" />
      </div>

      <section className="card mb-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-[16px] font-bold text-ink">Course enrolments</h2>
            <p className="text-[11px] text-muted">All courses enrolled on this demonstration portal.</p>
          </div>
          <span className="chip chip-gray">{enrollments.length} records</span>
        </div>
        {enrollments.length === 0 ? (
          <EmptyState icon={<BookOpen size={22} />} title="No enrolments yet" description="Enrol in a course to start building your training record." action={<Link href="/courses" className="btn btn-primary btn-sm">Browse courses</Link>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table min-w-[760px]">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Enrolled</th>
                  <th>Completed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link href={`/courses/${e.slug}`} className="font-semibold text-ink hover:text-brand-700 dark:hover:text-brand-300">{e.title}</Link>
                      <div className="text-[10px] text-muted">{e.lessons_done}/{e.lesson_count} lessons</div>
                    </td>
                    <td className="text-muted">{e.category_name ?? "General"}</td>
                    <td><span className="chip chip-gray">{e.level}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={e.progress_percent} className="w-20" />
                        <span className="text-[10.5px] font-semibold text-ink">{e.progress_percent}%</span>
                      </div>
                    </td>
                    <td><span className={`chip ${statusChip(e.status)}`}>{e.status}</span></td>
                    <td className="text-[11px] text-muted">{formatDate(e.enrolled_at)}</td>
                    <td className="text-[11px] text-muted">{formatDate(e.completed_at)}</td>
                    <td>
                      <Link href={`/courses/${e.slug}`} className="text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-300">
                        {e.status === "completed" ? "Review" : "Continue"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-[16px] font-bold text-ink">Assessment history</h2>
            <p className="text-[11px] text-muted">Attempts, scores and outcomes (latest 50).</p>
          </div>
          <HistoryIcon size={16} className="text-muted" />
        </div>
        {attempts.length === 0 ? (
          <EmptyState icon={<ClipboardList size={22} />} title="No assessments attempted" description="Attempt a knowledge check or final examination to see results here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table min-w-[720px]">
              <thead>
                <tr>
                  <th>Assessment</th>
                  <th>Course</th>
                  <th>Attempt</th>
                  <th>Score</th>
                  <th>Outcome</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-semibold text-ink">{a.title}</div>
                      <div className="text-[10px] capitalize text-muted">{a.type.replace(/_/g, " ")}</div>
                    </td>
                    <td className="text-[11.5px] text-muted">{a.course_title}</td>
                    <td className="text-[11px] text-muted">#{a.attempt_number}</td>
                    <td className="font-display font-bold text-ink">{a.percent !== null ? `${a.percent}%` : "—"}</td>
                    <td>
                      <span className={`chip ${a.status === "submitted" ? "chip-gold" : a.passed === 1 ? "chip-green" : "chip-red"}`}>
                        {a.status === "submitted" ? "Pending grading" : a.passed === 1 ? "Passed" : "Not passed"}
                      </span>
                    </td>
                    <td className="text-[11px] text-muted">{formatDate(a.submitted_at, true)}</td>
                    <td>
                      <Link href={`/results/${a.id}`} className="text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-300">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-panel-2 px-4 py-3 text-[11px] text-muted">
        <CheckCircle2 size={14} className="shrink-0" />
        Records are generated from the live demonstration database and reflect activity on this portal only.
      </div>
    </div>
  );
}
