import Link from "next/link";
import { BarChart3, Download, FileSpreadsheet, FileText, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, humanStatus, percent } from "@/lib/format";
import { isAdministrator } from "@/lib/rbac";
import { PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; category?: string; course?: string; status?: string; from?: string; to?: string }>;
}) {
  const user = await requireUser(["super_admin", "training_admin", "management"]);
  const writable = isAdministrator(user.role as "super_admin");
  const p = await searchParams;
  const db = getDb();
  const departmentId = Number(p.department) || 0;
  const categoryId = Number(p.category) || 0;
  const courseId = Number(p.course) || 0;
  const status = p.status ?? "";
  const from = p.from ?? "";
  const to = p.to ?? "";

  const where: string[] = ["1=1"];
  const args: Array<string | number> = [];
  if (departmentId) {
    where.push("u.department_id = ?");
    args.push(departmentId);
  }
  if (categoryId) {
    where.push("c.category_id = ?");
    args.push(categoryId);
  }
  if (courseId) {
    where.push("c.id = ?");
    args.push(courseId);
  }
  if (status === "completed" || status === "active") {
    where.push("e.status = ?");
    args.push(status);
  }
  if (from) {
    where.push("e.enrolled_at >= ?");
    args.push(`${from}T00:00:00.000Z`);
  }
  if (to) {
    where.push("e.enrolled_at <= ?");
    args.push(`${to}T23:59:59.999Z`);
  }
  const clause = `WHERE ${where.join(" AND ")}`;

  const rows = db
    .prepare(
      `SELECT e.id, e.status AS enrollment_status, e.progress_percent, e.enrolled_at, e.completed_at,
              u.staff_id, u.first_name, u.last_name, u.email,
              d.name AS department_name, c.title AS course_title, c.level, cc.name AS category_name,
              (SELECT ROUND(AVG(at.percent), 1) FROM assessment_attempts at JOIN assessments a ON a.id = at.assessment_id
                WHERE at.user_id = u.id AND a.course_id = c.id AND at.status = 'graded') AS avg_score,
              (SELECT ct.cert_no FROM certificates ct WHERE ct.user_id = u.id AND ct.course_id = c.id AND ct.revoked = 0 LIMIT 1) AS cert_no
       FROM enrollments e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN departments d ON d.id = u.department_id
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN course_categories cc ON cc.id = c.category_id
       ${clause}
       ORDER BY e.enrolled_at DESC LIMIT 500`
    )
    .all(...args) as Array<{
    id: number;
    enrollment_status: string;
    progress_percent: number;
    enrolled_at: string;
    completed_at: string | null;
    staff_id: string;
    first_name: string;
    last_name: string;
    email: string;
    department_name: string | null;
    course_title: string;
    level: string;
    category_name: string | null;
    avg_score: number | null;
    cert_no: string | null;
  }>;

  const departments = db.prepare("SELECT id, name FROM departments ORDER BY name").all() as Array<{ id: number; name: string }>;
  const categories = db.prepare("SELECT id, name FROM course_categories ORDER BY name").all() as Array<{ id: number; name: string }>;
  const courses = db.prepare("SELECT id, title FROM courses WHERE status='published' ORDER BY title").all() as Array<{ id: number; title: string }>;

  const total = rows.length;
  const completed = rows.filter((r) => r.enrollment_status === "completed").length;
  const certificates = rows.filter((r) => r.cert_no).length;
  const scored = rows.filter((r) => r.avg_score !== null);
  const avgScore = scored.length ? Math.round((scored.reduce((s, r) => s + (r.avg_score ?? 0), 0) / scored.length) * 10) / 10 : 0;
  const avgProgress = total ? Math.round(rows.reduce((s, r) => s + r.progress_percent, 0) / total) : 0;

  const deptSummary = db
    .prepare(
      `SELECT d.name, COUNT(DISTINCT u.id) AS staff,
              COUNT(e.id) AS enrolled,
              SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM departments d
       LEFT JOIN users u ON u.department_id = d.id AND u.status = 'active'
       LEFT JOIN enrollments e ON e.user_id = u.id
       GROUP BY d.id ORDER BY enrolled DESC`
    )
    .all() as Array<{ name: string; staff: number; enrolled: number; completed: number | null }>;

  const qs = new URLSearchParams();
  if (departmentId) qs.set("department", String(departmentId));
  if (categoryId) qs.set("category", String(categoryId));
  if (courseId) qs.set("course", String(courseId));
  if (status) qs.set("status", status);
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const exportBase = `/api/reports/export?scope=admin&${qs.toString()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={writable ? "Reports" : "Executive reporting"}
        title="Reports & analytics"
        description="Filter organisation-wide training records, review compliance by department and export evidence for governance reporting."
        actions={
          <>
            <a href={`${exportBase}&format=csv`} className="btn btn-outline btn-sm"><Download size={14} /> CSV</a>
            <a href={`${exportBase}&format=xlsx`} className="btn btn-outline btn-sm"><FileSpreadsheet size={14} /> Excel</a>
            <a href={`${exportBase}&format=pdf`} className="btn btn-outline btn-sm"><FileText size={14} /> PDF</a>
          </>
        }
      />

      <form method="get" className="card grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-7">
        <div>
          <label className="label" htmlFor="department">Department</label>
          <select id="department" name="department" className="select" defaultValue={departmentId || ""}>
            <option value="">All</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" className="select" defaultValue={categoryId || ""}>
            <option value="">All</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="course">Course</label>
          <select id="course" name="course" className="select" defaultValue={courseId || ""}>
            <option value="">All</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" className="select" defaultValue={status}>
            <option value="">All</option>
            <option value="active">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="from">From</label>
          <input id="from" name="from" type="date" defaultValue={from} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="to">To</label>
          <input id="to" name="to" type="date" defaultValue={to} className="input" />
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn btn-primary btn-sm flex-1"><Search size={14} /> Apply</button>
          <Link href="/admin/reports" className="btn btn-ghost btn-sm">Reset</Link>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Records" value={total} sub="Filtered enrolments" icon={<BarChart3 size={18} />} />
        <StatCard label="Completed" value={completed} sub={`${percent(completed, total)}% completion`} tone="green" />
        <StatCard label="Average progress" value={`${avgProgress}%`} tone="blue" />
        <StatCard label="Average score" value={`${avgScore}%`} tone="gold" />
        <StatCard label="Certificates" value={certificates} tone="gold" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-[16px] font-bold text-ink">Learner training record</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">Up to 500 records for the selected filters.</p>
          </div>
          <span className="text-[10.5px] text-muted">{total} rows</span>
        </div>
        <div className="max-h-[520px] overflow-auto scroll-thin">
          <table className="table">
            <thead>
              <tr>
                <th>Staff</th><th>Department</th><th>Course</th><th>Status</th><th>Progress</th><th>Score</th><th>Certificate</th><th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><div className="font-semibold text-ink">{r.first_name} {r.last_name}</div><div className="text-[10px] text-muted">{r.staff_id}</div></td>
                  <td className="text-[11px] text-muted">{r.department_name ?? "—"}</td>
                  <td className="max-w-[260px]"><div className="truncate text-[11.5px] text-ink-soft">{r.course_title}</div><div className="text-[10px] text-muted">{r.category_name} · {r.level}</div></td>
                  <td><span className={`chip ${r.enrollment_status === "completed" ? "chip-green" : "chip-gold"}`}>{humanStatus(r.enrollment_status)}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-700 dark:bg-brand-400" style={{ width: `${r.progress_percent}%` }} /></div>
                      <span className="text-[10.5px]">{r.progress_percent}%</span>
                    </div>
                  </td>
                  <td className="text-[11.5px]">{r.avg_score != null ? `${r.avg_score}%` : "—"}</td>
                  <td className="text-[10.5px]">{r.cert_no ? <span className="chip chip-green">{r.cert_no}</span> : <span className="text-muted">—</span>}</td>
                  <td className="text-[10.5px] text-muted">{formatDate(r.enrolled_at)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-[12.5px] text-muted">No records match the filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-display text-[16px] font-bold text-ink">Compliance by department</h2>
          <p className="mt-0.5 text-[11.5px] text-muted">Active staff, enrolments and completion across all departments.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Department</th><th>Active staff</th><th>Enrolments</th><th>Completed</th><th>Completion rate</th></tr></thead>
            <tbody>
              {deptSummary.map((d) => (
                <tr key={d.name}>
                  <td className="font-semibold text-ink">{d.name}</td>
                  <td className="text-[11.5px]">{d.staff}</td>
                  <td className="text-[11.5px]">{d.enrolled}</td>
                  <td className="text-[11.5px]">{d.completed ?? 0}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-700 dark:bg-brand-400" style={{ width: `${percent(d.completed ?? 0, d.enrolled)}%` }} /></div>
                      <span className="text-[11px]">{percent(d.completed ?? 0, d.enrolled)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!writable && (
        <p className="text-[10.5px] text-muted">Read-only executive view. Exports are available for governance reporting; records are demonstration data.</p>
      )}
    </div>
  );
}
