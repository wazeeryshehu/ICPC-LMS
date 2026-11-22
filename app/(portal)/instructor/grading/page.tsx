import Link from "next/link";
import { ClipboardCheck, Clock, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime, humanStatus, timeAgo } from "@/lib/format";
import { isAdministrator } from "@/lib/rbac";
import { EmptyState, PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GradingQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; course?: string; saved?: string }>;
}) {
  const user = await requireUser(["instructor", "super_admin", "training_admin"]);
  const { status = "submitted", course = "", saved } = await searchParams;
  const db = getDb();
  const admin = isAdministrator(user.role as "super_admin");

  const courses = db
    .prepare(`SELECT id, title FROM courses WHERE ${admin ? "1=1" : "instructor_id = ?"} ORDER BY title`)
    .all(...(admin ? [] : [user.id])) as Array<{ id: number; title: string }>;
  const courseId = Number(course) || 0;

  const where: string[] = [];
  const args: Array<string | number> = [];
  if (!admin) {
    where.push("c.instructor_id = ?");
    args.push(user.id);
  }
  if (courseId) {
    where.push("c.id = ?");
    args.push(courseId);
  }
  if (status === "submitted" || status === "graded") {
    where.push("at.status = ?");
    args.push(status);
  } else if (status === "all") {
    where.push("at.status IN ('submitted','graded')");
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const attempts = db
    .prepare(
      `SELECT at.id, at.status, at.score, at.max_score, at.percent, at.passed, at.submitted_at,
              a.title AS assessment_title, a.type AS assessment_type, a.pass_mark,
              c.title AS course_title, c.id AS course_id,
              u.first_name, u.last_name, u.staff_id,
              d.name AS department_name
       FROM assessment_attempts at
       JOIN assessments a ON a.id = at.assessment_id
       JOIN courses c ON c.id = a.course_id
       JOIN users u ON u.id = at.user_id
       LEFT JOIN departments d ON d.id = u.department_id
       ${clause}
       ORDER BY CASE at.status WHEN 'submitted' THEN 0 ELSE 1 END, at.submitted_at DESC`
    )
    .all(...args) as Array<{
    id: number;
    status: string;
    score: number | null;
    max_score: number | null;
    percent: number | null;
    passed: number | null;
    submitted_at: string | null;
    assessment_title: string;
    assessment_type: string;
    pass_mark: number;
    course_title: string;
    course_id: number;
    first_name: string;
    last_name: string;
    staff_id: string;
    department_name: string | null;
  }>;

  const pending = attempts.filter((a) => a.status === "submitted").length;
  const graded = attempts.filter((a) => a.status === "graded").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assessment workflow"
        title="Grading queue"
        description="Auto-graded objective questions are scored instantly. Short answers, scenarios and essays wait here for instructor marking."
      />

      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          Attempt #{saved} graded. The learner has been notified and, for a passed final exam, a certificate was issued automatically.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting marking" value={pending} sub="Submitted with manual items" icon={<Clock size={18} />} tone="gold" />
        <StatCard label="Graded (filtered)" value={graded} icon={<ClipboardCheck size={18} />} tone="green" />
        <StatCard label="Filter" value={humanStatus(status)} sub={`${attempts.length} attempt${attempts.length === 1 ? "" : "s"}`} />
      </div>

      <form method="get" className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[220px] flex-1">
          <label className="label" htmlFor="course">Course</label>
          <select id="course" name="course" className="select" defaultValue={courseId || ""}>
            <option value="">All courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="min-w-[180px]">
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" className="select" defaultValue={status}>
            <option value="submitted">Awaiting marking</option>
            <option value="graded">Graded</option>
            <option value="all">All submissions</option>
          </select>
        </div>
        <button type="submit" className="btn btn-outline btn-sm"><Search size={14} /> Apply filters</button>
      </form>

      {attempts.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck size={24} />}
          title={status === "submitted" ? "Nothing to mark" : "No matching attempts"}
          description={status === "submitted" ? "Objective assessments are graded automatically. Manual items will appear here when learners submit them." : "Try changing the filters."}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Assessment</th>
                  <th>Course</th>
                  <th>Submitted</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-semibold text-ink">{a.first_name} {a.last_name}</div>
                      <div className="text-[10.5px] text-muted">{a.staff_id}{a.department_name ? ` · ${a.department_name}` : ""}</div>
                    </td>
                    <td>
                      <div className="text-[12px] text-ink-soft">{a.assessment_title}</div>
                      <div className="text-[10px] text-muted">{humanStatus(a.assessment_type)} · pass {a.pass_mark}%</div>
                    </td>
                    <td className="max-w-[220px] truncate text-[11.5px] text-muted">{a.course_title}</td>
                    <td className="text-[11px] text-muted">{a.submitted_at ? timeAgo(a.submitted_at) : "—"}<div className="text-[10px]">{a.submitted_at ? formatDateTime(a.submitted_at) : ""}</div></td>
                    <td className="text-[11.5px] text-ink-soft">
                      {a.status === "graded" ? (
                        <><span className="font-semibold text-ink">{a.percent}%</span><div className="text-[10px] text-muted">{a.score}/{a.max_score} points</div></>
                      ) : (
                        <span className="text-muted">“{a.percent}% provisional”</span>
                      )}
                    </td>
                    <td>
                      <span className={`chip ${a.status === "graded" ? (a.passed ? "chip-green" : "chip-red") : "chip-gold"}`}>
                        {a.status === "graded" ? (a.passed ? "Passed" : "Failed") : "Submitted"}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <Link href={`/instructor/grading/${a.id}`} className="btn btn-outline btn-sm">
                          {a.status === "submitted" ? "Mark now" : "Review"}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
