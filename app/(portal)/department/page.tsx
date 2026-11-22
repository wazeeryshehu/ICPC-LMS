import Link from "next/link";
import { BarChart3, Building2, GraduationCap, Send, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, percent } from "@/lib/format";
import { isAdministrator } from "@/lib/rbac";
import { PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { assignCourseAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function DepartmentPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; saved?: string; error?: string }>;
}) {
  const user = await requireUser(["coordinator", "super_admin", "training_admin"]);
  const { department: departmentParam, saved, error } = await searchParams;
  const db = getDb();
  let departmentId = user.department_id;
  if (isAdministrator(user.role as "super_admin") || user.role === "super_admin") {
    departmentId = Number(departmentParam) || departmentId;
  }
  const departments = db.prepare("SELECT id, name FROM departments ORDER BY name").all() as Array<{ id: number; name: string }>;
  const department = departmentId
    ? (db.prepare("SELECT id, name, code, description FROM departments WHERE id = ?").get(departmentId) as
        | { id: number; name: string; code: string; description: string | null }
        | undefined)
    : undefined;

  if (!department) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Department" title="Department overview" description="No department has been assigned to your profile." />
        <div className="card p-6 text-[13px] text-muted">Contact the Training / HR Administrator to be assigned as departmental training coordinator.</div>
      </div>
    );
  }

  const staff = db
    .prepare(
      `SELECT u.id, u.staff_id, u.first_name, u.last_name, u.role, u.designation, u.status, u.last_login_at,
              (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) AS enrolled,
              (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id AND e.status = 'completed') AS completed,
              (SELECT ROUND(AVG(e.progress_percent)) FROM enrollments e WHERE e.user_id = u.id) AS avg_progress,
              (SELECT COUNT(*) FROM certificates ct WHERE ct.user_id = u.id AND ct.revoked = 0) AS certificates
       FROM users u WHERE u.department_id = ? ORDER BY u.last_name, u.first_name`
    )
    .all(department.id) as Array<{
    id: number;
    staff_id: string;
    first_name: string;
    last_name: string;
    role: string;
    designation: string | null;
    status: string;
    last_login_at: string | null;
    enrolled: number;
    completed: number;
    avg_progress: number | null;
    certificates: number;
  }>;

  const totals = staff.reduce(
    (acc, s) => ({
      enrolled: acc.enrolled + s.enrolled,
      completed: acc.completed + s.completed,
      certificates: acc.certificates + s.certificates,
    }),
    { enrolled: 0, completed: 0, certificates: 0 }
  );
  const mandatory = db
    .prepare(
      `SELECT COUNT(*) AS assigned, SUM(CASE WHEN e.status='completed' THEN 1 ELSE 0 END) AS completed
       FROM enrollments e JOIN users u ON u.id = e.user_id JOIN courses c ON c.id = e.course_id
       WHERE u.department_id = ? AND c.is_mandatory = 1`
    )
    .get(department.id) as { assigned: number; completed: number | null };
  const avgProgress = staff.length ? Math.round(staff.reduce((s, r) => s + (r.avg_progress ?? 0), 0) / staff.length) : 0;

  const courseRows = db
    .prepare(
      `SELECT c.id, c.title, c.is_mandatory, cc.name AS category_name,
              COUNT(e.id) AS enrolled,
              SUM(CASE WHEN e.status='completed' THEN 1 ELSE 0 END) AS completed,
              ROUND(AVG(e.progress_percent)) AS avg_progress
       FROM courses c
       JOIN enrollments e ON e.course_id = c.id
       JOIN users u ON u.id = e.user_id
       LEFT JOIN course_categories cc ON cc.id = c.category_id
       WHERE u.department_id = ? AND c.status = 'published'
       GROUP BY c.id ORDER BY enrolled DESC`
    )
    .all(department.id) as Array<{ id: number; title: string; is_mandatory: number; category_name: string | null; enrolled: number; completed: number | null; avg_progress: number | null }>;
  const publishedCourses = db
    .prepare("SELECT id, title FROM courses WHERE status='published' ORDER BY title")
    .all() as Array<{ id: number; title: string }>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${department.code} · Departmental coordination`}
        title={department.name}
        description={department.description ?? "Monitor staff training participation, completion and mandatory compliance for your department."}
        actions={
          <>
            <Link href="/department/reports" className="btn btn-outline btn-sm"><BarChart3 size={14} /> Department reports</Link>
            <Link href="/courses" className="btn btn-primary btn-sm"><GraduationCap size={14} /> Browse courses</Link>
          </>
        }
      />

      {saved === "assignment" && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          Course assigned to {department.name}. All active staff were enrolled and notified.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error === "scope" ? "Coordinators may only assign training within their own department." : error === "course" ? "Select a published course." : "Could not create the assignment. Check the course and department."}
        </div>
      )}

      {isAdministrator(user.role as "super_admin") && departments.length > 1 && (
        <form method="get" className="card flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[280px] flex-1">
            <label className="label" htmlFor="department">Department view</label>
            <select id="department" name="department" className="select" defaultValue={department.id}>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-outline btn-sm">Switch department</button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Staff" value={staff.length} sub={`${staff.filter((s) => s.status === "active").length} active`} icon={<Users size={18} />} />
        <StatCard label="Enrolments" value={totals.enrolled} sub={`${totals.completed} completed`} icon={<GraduationCap size={18} />} tone="green" />
        <StatCard label="Mandatory compliance" value={`${percent(mandatory.completed ?? 0, mandatory.assigned)}%`} sub={`${mandatory.completed ?? 0}/${mandatory.assigned} mandatory enrolments`} tone="gold" />
        <StatCard label="Average progress" value={`${avgProgress}%`} sub={`${totals.certificates} certificates issued`} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="card">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-[16px] font-bold text-ink">Staff training record</h2>
              <p className="mt-0.5 text-[11.5px] text-muted">Participation of staff currently posted to {department.name}.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Staff</th><th>Courses</th><th>Completed</th><th>Average progress</th><th>Certificates</th><th>Last sign-in</th></tr></thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="text-[12px] font-semibold text-ink">{s.first_name} {s.last_name}</div>
                        <div className="text-[10px] text-muted">{s.staff_id}{s.designation ? ` · ${s.designation}` : ""}</div>
                      </td>
                      <td className="text-[11.5px]">{s.enrolled}</td>
                      <td className="text-[11.5px]">{s.completed}</td>
                      <td className="w-32">
                        <div className="text-[10.5px] font-semibold">{s.avg_progress ?? 0}%</div>
                        <ProgressBar value={s.avg_progress ?? 0} className="mt-1" />
                      </td>
                      <td className="text-[11.5px]">{s.certificates}</td>
                      <td className="text-[10.5px] text-muted">{s.last_login_at ? formatDate(s.last_login_at) : "Never"}</td>
                    </tr>
                  ))}
                  {staff.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[12.5px] text-muted">No staff currently posted to this department.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-line px-5 py-4"><h2 className="font-display text-[16px] font-bold text-ink">Departmental course performance</h2></div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead><tr><th>Course</th><th>Enrolled</th><th>Completed</th><th>Average progress</th></tr></thead>
                <tbody>
                  {courseRows.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="text-[12px] font-semibold text-ink">{c.title}</div>
                        <div className="text-[10px] text-muted">{c.category_name}{c.is_mandatory ? " · Mandatory" : ""}</div>
                      </td>
                      <td className="text-[11.5px]">{c.enrolled}</td>
                      <td className="text-[11.5px]">{c.completed ?? 0}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-700 dark:bg-brand-400" style={{ width: `${c.avg_progress ?? 0}%` }} /></div>
                          <span className="text-[10.5px]">{c.avg_progress ?? 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {courseRows.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-[12px] text-muted">No departmental enrolments yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <div className="flex items-center gap-2"><Send size={15} className="text-brand-700 dark:text-brand-300" /><h2 className="font-display text-[16px] font-bold text-ink">Assign training</h2></div>
            <p className="mt-1 text-[11px] text-muted">Assign a published course to everyone in {department.name}. Staff are enrolled and notified automatically.</p>
            <form action={assignCourseAction} className="mt-4 space-y-3">
              <input type="hidden" name="departmentId" value={department.id} />
              <select name="courseId" className="select" required defaultValue="">
                <option value="">Select published course</option>
                {publishedCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <div>
                <label className="label">Due date (optional)</label>
                <input name="dueDate" type="date" className="input" />
              </div>
              <label className="flex items-center gap-2 text-[12px] text-ink-soft">
                <input type="checkbox" name="mandatory" defaultChecked className="accent-[#16437f]" /> Mandatory training
              </label>
              <button type="submit" className="btn btn-gold btn-sm w-full"><Send size={13} /> Assign to department</button>
            </form>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2"><Building2 size={15} className="text-brand-700 dark:text-brand-300" /><h2 className="font-display text-[16px] font-bold text-ink">Coordination notes</h2></div>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-muted">
              <li>• Mandatory compliance counts only enrolments in courses flagged mandatory.</li>
              <li>• Staff without certificates may still be in progress; check average progress.</li>
              <li>• Departmental reports can be exported to CSV, Excel or PDF for management meetings.</li>
            </ul>
            <Link href="/department/reports" className="btn btn-outline btn-sm mt-4 w-full"><BarChart3 size={13} /> Open departmental reports</Link>
          </section>

          <div className="rounded-xl border border-line bg-panel-2 p-4 text-[10.5px] leading-relaxed text-muted">
            Coordinator access is restricted to the assigned department. Attempting to view or assign training for another department is rejected and audited.
          </div>
        </div>
      </div>
    </div>
  );
}
