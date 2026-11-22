import Link from "next/link";
import { Building2, Plus, Send, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { percent } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";
import { assignCourseAction, createDepartmentAction, createUnitAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireUser(["super_admin", "training_admin"]);
  const { saved, error } = await searchParams;
  const db = getDb();

  const departments = db
    .prepare(
      `SELECT d.id, d.name, d.code, d.description,
              (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id AND u.status = 'active') AS staff,
              (SELECT COUNT(*) FROM units un WHERE un.department_id = d.id) AS units,
              (SELECT COUNT(*) FROM enrollments e JOIN users u ON u.id = e.user_id WHERE u.department_id = d.id) AS enrolled,
              (SELECT COUNT(*) FROM enrollments e JOIN users u ON u.id = e.user_id WHERE u.department_id = d.id AND e.status = 'completed') AS completed,
              (SELECT COUNT(*) FROM course_assignments ca WHERE ca.department_id = d.id) AS assignments
       FROM departments d ORDER BY d.name`
    )
    .all() as Array<{
    id: number;
    name: string;
    code: string;
    description: string | null;
    staff: number;
    units: number;
    enrolled: number;
    completed: number;
    assignments: number;
  }>;

  const units = db
    .prepare("SELECT id, department_id, name FROM units ORDER BY name")
    .all() as Array<{ id: number; department_id: number; name: string }>;
  const courses = db
    .prepare("SELECT id, title FROM courses WHERE status = 'published' ORDER BY title")
    .all() as Array<{ id: number; title: string }>;
  const allStaff = (db.prepare("SELECT COUNT(*) AS n FROM users WHERE status = 'active'").get() as { n: number }).n;
  const totalEnrolled = departments.reduce((s, d) => s + d.enrolled, 0);
  const totalCompleted = departments.reduce((s, d) => s + d.completed, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organisation structure"
        title="Departments & units"
        description="Maintain the Commission's departmental structure and assign mandatory training to whole departments."
      />

      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          {saved === "assignment" ? "Course assigned. Staff were enrolled and notified in-platform and by email." : "Department structure updated."}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error === "duplicate" ? "A department with that name or code already exists." : error === "course" ? "Only published courses can be assigned." : "Please complete the required fields."}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Departments" value={departments.length} icon={<Building2 size={18} />} />
        <StatCard label="Active staff" value={allStaff} icon={<Users size={18} />} tone="blue" />
        <StatCard label="Enrolments" value={totalEnrolled} tone="green" />
        <StatCard label="Completion" value={`${percent(totalCompleted, totalEnrolled)}%`} tone="gold" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <section className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-[16px] font-bold text-ink">Departments</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">Active staff, training enrolments and completion by department.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Department</th><th>Staff</th><th>Units</th><th>Enrolments</th><th>Completion</th><th>Assignments</th></tr></thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="font-semibold text-ink">{d.name}</div>
                      <div className="text-[10px] text-muted">{d.code}</div>
                      {units.filter((u) => u.department_id === d.id).length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {units.filter((u) => u.department_id === d.id).map((u) => (
                            <span key={u.id} className="chip chip-gray !py-0">{u.name}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-[11.5px]">{d.staff}</td>
                    <td className="text-[11.5px]">{d.units}</td>
                    <td className="text-[11.5px]">{d.enrolled}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-700 dark:bg-brand-400" style={{ width: `${percent(d.completed, d.enrolled)}%` }} /></div>
                        <span className="text-[11px]">{percent(d.completed, d.enrolled)}%</span>
                      </div>
                    </td>
                    <td className="text-[11.5px]">{d.assignments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <div className="flex items-center gap-2"><Plus size={15} className="text-brand-700 dark:text-brand-300" /><h2 className="font-display text-[16px] font-bold text-ink">Add department</h2></div>
            <form action={createDepartmentAction} className="mt-3 space-y-3">
              <input name="name" className="input" placeholder="Department name" required />
              <input name="code" className="input" placeholder="Code (e.g. LEGAL)" required maxLength={12} />
              <input name="description" className="input" placeholder="Description (optional)" />
              <button type="submit" className="btn btn-primary btn-sm w-full">Create department</button>
            </form>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2"><Plus size={15} className="text-brand-700 dark:text-brand-300" /><h2 className="font-display text-[16px] font-bold text-ink">Add unit</h2></div>
            <form action={createUnitAction} className="mt-3 space-y-3">
              <select name="departmentId" className="select" required defaultValue="">
                <option value="">Select department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <input name="name" className="input" placeholder="Unit name" required />
              <button type="submit" className="btn btn-outline btn-sm w-full">Add unit</button>
            </form>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2"><Send size={15} className="text-brand-700 dark:text-brand-300" /><h2 className="font-display text-[16px] font-bold text-ink">Assign training</h2></div>
            <p className="mt-1 text-[11px] text-muted">Enrols every active staff member in the department and sends a notification.</p>
            <form action={assignCourseAction} className="mt-3 space-y-3">
              <select name="courseId" className="select" required defaultValue="">
                <option value="">Select published course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <select name="departmentId" className="select" required defaultValue="">
                <option value="">Select department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div>
                <label className="label">Due date (optional)</label>
                <input name="dueDate" type="date" className="input" />
              </div>
              <label className="flex items-center gap-2 text-[12px] text-ink-soft">
                <input type="checkbox" name="mandatory" defaultChecked className="accent-[#16437f]" /> Mark as mandatory
              </label>
              <button type="submit" className="btn btn-gold btn-sm w-full"><Send size={13} /> Assign to department</button>
            </form>
            <Link href="/admin/reports" className="mt-3 block text-center text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-300">Open departmental reports →</Link>
          </section>
        </div>
      </div>
    </div>
  );
}
