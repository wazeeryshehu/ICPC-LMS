import Link from "next/link";
import { BarChart3, Download, FileSpreadsheet, FileText, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, humanStatus, percent } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DepartmentReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; status?: string; staff?: string }>;
}) {
  const user = await requireUser(["coordinator", "super_admin", "training_admin"]);
  const { course: courseParam, status = "", staff: staffParam = "" } = await searchParams;
  const db = getDb();
  const departmentId = user.department_id;
  if (!departmentId) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Department" title="Departmental reports" description="No department is assigned to your profile." />
        <div className="card p-6 text-[13px] text-muted">Contact the Training / HR Administrator to be assigned as departmental training coordinator.</div>
      </div>
    );
  }
  const department = db.prepare("SELECT name, code FROM departments WHERE id = ?").get(departmentId) as { name: string; code: string };
  const courseId = Number(courseParam) || 0;
  const staffQ = staffParam.trim();

  const where = ["u.department_id = ?"];
  const args: Array<string | number> = [departmentId];
  if (courseId) {
    where.push("c.id = ?");
    args.push(courseId);
  }
  if (status === "active" || status === "completed") {
    where.push("e.status = ?");
    args.push(status);
  }
  if (staffQ) {
    where.push("(u.first_name LIKE ? OR u.last_name LIKE ? OR u.staff_id LIKE ?)");
    const like = `%${staffQ}%`;
    args.push(like, like, like);
  }
  const clause = `WHERE ${where.join(" AND ")}`;

  const rows = db
    .prepare(
      `SELECT e.id, e.status AS enrollment_status, e.progress_percent, e.enrolled_at, e.completed_at,
              u.staff_id, u.first_name, u.last_name, c.title AS course_title, c.is_mandatory, cc.name AS category_name,
              (SELECT ROUND(AVG(at.percent), 1) FROM assessment_attempts at JOIN assessments a ON a.id = at.assessment_id
                WHERE at.user_id = u.id AND a.course_id = c.id AND at.status = 'graded') AS avg_score,
              (SELECT ct.cert_no FROM certificates ct WHERE ct.user_id = u.id AND ct.course_id = c.id AND ct.revoked = 0 LIMIT 1) AS cert_no
       FROM enrollments e JOIN users u ON u.id = e.user_id JOIN courses c ON c.id = e.course_id
       LEFT JOIN course_categories cc ON cc.id = c.category_id
       ${clause}
       ORDER BY u.last_name, u.first_name, c.title`
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
    course_title: string;
    is_mandatory: number;
    category_name: string | null;
    avg_score: number | null;
    cert_no: string | null;
  }>;

  const courses = db
    .prepare(
      `SELECT DISTINCT c.id, c.title FROM enrollments e JOIN users u ON u.id = e.user_id JOIN courses c ON c.id = e.course_id
       WHERE u.department_id = ? ORDER BY c.title`
    )
    .all(departmentId) as Array<{ id: number; title: string }>;

  const total = rows.length;
  const completed = rows.filter((r) => r.enrollment_status === "completed").length;
  const certs = rows.filter((r) => r.cert_no).length;
  const mandatoryRows = rows.filter((r) => r.is_mandatory);
  const mandatoryCompleted = mandatoryRows.filter((r) => r.enrollment_status === "completed").length;
  const scored = rows.filter((r) => r.avg_score !== null);
  const avgScore = scored.length ? Math.round((scored.reduce((s, r) => s + (r.avg_score ?? 0), 0) / scored.length) * 10) / 10 : 0;

  const qs = new URLSearchParams({ scope: "department" });
  if (courseId) qs.set("course", String(courseId));
  if (status) qs.set("status", status);
  if (staffQ) qs.set("q", staffQ);
  const exportBase = `/api/reports/export?${qs.toString()}`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${department.code} · Reporting`}
        title="Departmental reports"
        description={`Training participation and compliance evidence for ${department.name}. Exports are scoped to your department only.`}
        actions={
          <>
            <a href={`${exportBase}&format=csv`} className="btn btn-outline btn-sm"><Download size={14} /> CSV</a>
            <a href={`${exportBase}&format=xlsx`} className="btn btn-outline btn-sm"><FileSpreadsheet size={14} /> Excel</a>
            <a href={`${exportBase}&format=pdf`} className="btn btn-outline btn-sm"><FileText size={14} /> PDF</a>
          </>
        }
      />

      <form method="get" className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[220px] flex-1">
          <label className="label" htmlFor="staff">Staff search</label>
          <input id="staff" name="staff" defaultValue={staffQ} className="input" placeholder="Name or staff ID" />
        </div>
        <div className="min-w-[220px] flex-1">
          <label className="label" htmlFor="course">Course</label>
          <select id="course" name="course" className="select" defaultValue={courseId || ""}>
            <option value="">All courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="min-w-[160px]">
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" className="select" defaultValue={status}>
            <option value="">All</option>
            <option value="active">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-sm"><Search size={14} /> Apply</button>
        <Link href="/department/reports" className="btn btn-ghost btn-sm">Reset</Link>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Enrolments" value={total} icon={<BarChart3 size={18} />} />
        <StatCard label="Completed" value={completed} sub={`${percent(completed, total)}% completion`} tone="green" />
        <StatCard label="Mandatory compliance" value={`${percent(mandatoryCompleted, mandatoryRows.length)}%`} sub={`${mandatoryCompleted}/${mandatoryRows.length}`} tone="gold" />
        <StatCard label="Average score" value={`${avgScore}%`} tone="blue" />
        <StatCard label="Certificates" value={certs} tone="gold" />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="font-display text-[16px] font-bold text-ink">Training records</h2></div>
        <div className="max-h-[560px] overflow-auto scroll-thin">
          <table className="table">
            <thead><tr><th>Staff</th><th>Course</th><th>Type</th><th>Status</th><th>Progress</th><th>Score</th><th>Certificate</th><th>Enrolled</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><div className="font-semibold text-ink">{r.first_name} {r.last_name}</div><div className="text-[10px] text-muted">{r.staff_id}</div></td>
                  <td className="max-w-[280px]"><div className="truncate text-[11.5px] text-ink-soft">{r.course_title}</div><div className="text-[10px] text-muted">{r.category_name}</div></td>
                  <td>{r.is_mandatory ? <span className="chip chip-gold">Mandatory</span> : <span className="chip chip-gray">Elective</span>}</td>
                  <td><span className={`chip ${r.enrollment_status === "completed" ? "chip-green" : "chip-gold"}`}>{humanStatus(r.enrollment_status)}</span></td>
                  <td className="text-[11px]">{r.progress_percent}%</td>
                  <td className="text-[11px]">{r.avg_score != null ? `${r.avg_score}%` : "—"}</td>
                  <td className="text-[10px]">{r.cert_no ? <span className="chip chip-green">{r.cert_no}</span> : "—"}</td>
                  <td className="text-[10px] text-muted">{formatDate(r.enrolled_at)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-[12.5px] text-muted">No records match the filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10.5px] text-muted">Demonstration data. Records are fictitious and exports are watermarked as demonstration reports.</p>
    </div>
  );
}
