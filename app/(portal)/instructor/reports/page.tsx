import Link from "next/link";
import { BarChart3, Download, FileSpreadsheet, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { humanStatus, percent } from "@/lib/format";
import { isAdministrator } from "@/lib/rbac";
import { EmptyState, PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function InstructorReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const user = await requireUser(["instructor", "super_admin", "training_admin"]);
  const { course: courseParam } = await searchParams;
  const db = getDb();
  const admin = isAdministrator(user.role as "super_admin");
  const courses = db
    .prepare(`SELECT id, title FROM courses WHERE ${admin ? "1=1" : "instructor_id = ?"} ORDER BY title`)
    .all(...(admin ? [] : [user.id])) as Array<{ id: number; title: string }>;
  const courseId = Number(courseParam) || 0;

  const where = admin ? "" : "AND c.instructor_id = ?";
  const args: Array<number> = admin ? [] : [user.id];
  if (courseId) {
    // Filter applied below through course id.
  }

  const courseRows = db
    .prepare(
      `SELECT c.id, c.title, c.level, c.status, cc.name AS category_name,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrolled,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'completed') AS completed,
              (SELECT ROUND(AVG(e.progress_percent)) FROM enrollments e WHERE e.course_id = c.id) AS avg_progress,
              (SELECT COUNT(*) FROM certificates ct WHERE ct.course_id = c.id AND ct.revoked = 0) AS certificates,
              (SELECT ROUND(AVG(r.rating), 1) FROM course_feedback r WHERE r.course_id = c.id) AS rating,
              (SELECT ROUND(AVG(at.percent), 1) FROM assessment_attempts at JOIN assessments a ON a.id = at.assessment_id
                WHERE a.course_id = c.id AND at.status = 'graded') AS avg_score
       FROM courses c LEFT JOIN course_categories cc ON cc.id = c.category_id
       WHERE 1=1 ${where} ${courseId ? "AND c.id = ?" : ""}
       ORDER BY c.title`
    )
    .all(...args, ...(courseId ? [courseId] : [])) as Array<{
    id: number;
    title: string;
    level: string;
    status: string;
    category_name: string | null;
    enrolled: number;
    completed: number;
    avg_progress: number | null;
    certificates: number;
    rating: number | null;
    avg_score: number | null;
  }>;

  const assessmentRows = db
    .prepare(
      `SELECT a.id, a.title, a.type, a.pass_mark, c.title AS course_title, c.id AS course_id,
              COUNT(at.id) AS attempts,
              SUM(CASE WHEN at.status = 'graded' THEN 1 ELSE 0 END) AS graded,
              SUM(CASE WHEN at.passed = 1 THEN 1 ELSE 0 END) AS passed,
              ROUND(AVG(CASE WHEN at.status = 'graded' THEN at.percent END), 1) AS avg_percent
       FROM assessments a
       JOIN courses c ON c.id = a.course_id
       LEFT JOIN assessment_attempts at ON at.assessment_id = a.id
       WHERE 1=1 ${where} ${courseId ? "AND c.id = ?" : ""}
       GROUP BY a.id ORDER BY attempts DESC, a.id`
    )
    .all(...args, ...(courseId ? [courseId] : [])) as Array<{
    id: number;
    title: string;
    type: string;
    pass_mark: number;
    course_title: string;
    course_id: number;
    attempts: number;
    graded: number;
    passed: number;
    avg_percent: number | null;
  }>;

  const distribution = [
    { label: "Distinction (85–100%)", min: 85, max: 101, color: "bg-brand-700 dark:bg-brand-400" },
    { label: "Merit (70–84%)", min: 70, max: 85, color: "bg-gold-500" },
    { label: "Pass (50–69%)", min: 50, max: 70, color: "bg-blue-500" },
    { label: "Below 50%", min: 0, max: 50, color: "bg-red-500" },
  ].map((bucket) => {
    const row = db
      .prepare(
        `SELECT COUNT(*) AS n FROM assessment_attempts at JOIN assessments a ON a.id = at.assessment_id
         JOIN courses c ON c.id = a.course_id
         WHERE at.status = 'graded' AND at.percent >= ? AND at.percent < ? ${where} ${courseId ? "AND c.id = ?" : ""}`
      )
      .get(bucket.min, bucket.max, ...args, ...(courseId ? [courseId] : [])) as { n: number };
    return { ...bucket, count: row.n };
  });
  const distTotal = distribution.reduce((s, b) => s + b.count, 0);

  const totalEnrolled = courseRows.reduce((s, c) => s + c.enrolled, 0);
  const totalCompleted = courseRows.reduce((s, c) => s + c.completed, 0);
  const totalCertificates = courseRows.reduce((s, c) => s + c.certificates, 0);
  const overallScore = (() => {
    const graded = assessmentRows.reduce((s, a) => s + a.graded, 0);
    if (!graded) return 0;
    const weighted = assessmentRows.reduce((s, a) => s + (a.avg_percent ?? 0) * a.graded, 0);
    return Math.round((weighted / graded) * 10) / 10;
  })();
  const exportQuery = `scope=instructor&course=${courseId}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Course analytics"
        title="Reports & performance"
        description="Enrolment, completion and assessment performance for the courses you manage. Export for departmental reporting."
        actions={
          <>
            <a href={`/api/reports/export?${exportQuery}&format=csv`} className="btn btn-outline btn-sm"><Download size={14} /> CSV</a>
            <a href={`/api/reports/export?${exportQuery}&format=xlsx`} className="btn btn-outline btn-sm"><FileSpreadsheet size={14} /> Excel</a>
            <a href={`/api/reports/export?${exportQuery}&format=pdf`} className="btn btn-outline btn-sm"><FileText size={14} /> PDF</a>
          </>
        }
      />

      <form method="get" className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[280px] flex-1">
          <label className="label" htmlFor="course">Course</label>
          <select id="course" name="course" className="select" defaultValue={courseId || ""}>
            <option value="">All assigned courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-sm">Apply filter</button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolments" value={totalEnrolled} sub={`${courseRows.length} courses`} icon={<BarChart3 size={18} />} />
        <StatCard label="Completion rate" value={`${percent(totalCompleted, totalEnrolled)}%`} sub={`${totalCompleted} completed`} tone="green" />
        <StatCard label="Average score" value={`${overallScore}%`} sub="Graded attempts" tone="gold" />
        <StatCard label="Certificates" value={totalCertificates} sub="Issued and valid" tone="blue" />
      </div>

      {courseRows.length === 0 ? (
        <EmptyState icon={<BarChart3 size={24} />} title="No course data" description="Create and publish a course to see analytics." />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-[16px] font-bold text-ink">Course performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course</th><th>Status</th><th>Enrolled</th><th>Completed</th><th>Completion</th><th>Avg progress</th><th>Avg score</th><th>Rating</th><th>Certificates</th>
                  </tr>
                </thead>
                <tbody>
                  {courseRows.map((c) => (
                    <tr key={c.id}>
                      <td><div className="font-semibold text-ink">{c.title}</div><div className="text-[10px] text-muted">{c.category_name} · {c.level}</div></td>
                      <td><span className={`chip ${c.status === "published" ? "chip-green" : "chip-gray"}`}>{humanStatus(c.status)}</span></td>
                      <td>{c.enrolled}</td>
                      <td>{c.completed}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-700 dark:bg-brand-400" style={{ width: `${percent(c.completed, c.enrolled)}%` }} /></div>
                          <span className="text-[11px]">{percent(c.completed, c.enrolled)}%</span>
                        </div>
                      </td>
                      <td>{c.avg_progress ?? 0}%</td>
                      <td>{c.avg_score ?? "—"}{c.avg_score != null ? "%" : ""}</td>
                      <td>{c.rating ?? "—"}</td>
                      <td>{c.certificates}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="card overflow-hidden">
              <div className="border-b border-line px-5 py-4"><h2 className="font-display text-[16px] font-bold text-ink">Assessment performance</h2></div>
              {assessmentRows.length === 0 ? (
                <p className="px-5 py-8 text-center text-[12px] text-muted">No assessments in scope.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead><tr><th>Assessment</th><th>Attempts</th><th>Passed</th><th>Pass rate</th><th>Avg score</th></tr></thead>
                    <tbody>
                      {assessmentRows.map((a) => (
                        <tr key={a.id}>
                          <td><div className="text-[12px] font-semibold text-ink">{a.title}</div><div className="text-[10px] text-muted">{a.course_title} · {humanStatus(a.type)} · pass {a.pass_mark}%</div></td>
                          <td>{a.attempts}</td>
                          <td>{a.passed}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-700 dark:bg-brand-400" style={{ width: `${percent(a.passed, a.graded)}%` }} /></div>
                              <span className="text-[11px]">{percent(a.passed, a.graded)}%</span>
                            </div>
                          </td>
                          <td>{a.avg_percent ?? "—"}{a.avg_percent != null ? "%" : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="font-display text-[16px] font-bold text-ink">Score distribution</h2>
              <p className="mt-1 text-[11.5px] text-muted">Graded attempts in scope ({distTotal}).</p>
              <div className="mt-4 space-y-3.5">
                {distribution.map((b) => (
                  <div key={b.label}>
                    <div className="mb-1 flex justify-between text-[11px]"><span className="text-ink-soft">{b.label}</span><span className="font-semibold text-ink">{b.count}</span></div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
                      <div className={`h-full rounded-full ${b.color}`} style={{ width: `${distTotal ? Math.max(2, Math.round((b.count / distTotal) * 100)) : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10.5px] leading-relaxed text-muted">Score bands use the institutional grading scheme: Distinction ≥ 85%, Merit ≥ 70%, Pass ≥ 50%.</p>
            </div>
          </div>
        </>
      )}

      <p className="text-[10.5px] text-muted">Exports include learner-level records for the selected scope and are labelled as demonstration data.</p>
    </div>
  );
}
