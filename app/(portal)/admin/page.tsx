import Link from "next/link";
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatNumber, humanStatus, percent, timeAgo } from "@/lib/format";
import { isAdministrator } from "@/lib/rbac";
import { PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await requireUser(["super_admin", "training_admin", "management"]);
  const db = getDb();
  const writable = isAdministrator(user.role as "super_admin");

  const staff = db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
              SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
              SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended,
              SUM(CASE WHEN locked_until IS NOT NULL AND locked_until > ? THEN 1 ELSE 0 END) AS locked
       FROM users`
    )
    .get(new Date().toISOString()) as { total: number; active: number | null; pending: number | null; suspended: number | null; locked: number | null };

  const courseStats = db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
              SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS drafts,
              SUM(CASE WHEN legal_review_status IN ('pending','demo_pending') THEN 1 ELSE 0 END) AS legal_pending
       FROM courses`
    )
    .get() as { total: number; published: number | null; drafts: number | null; legal_pending: number | null };

  const enrollmentStats = db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
              ROUND(AVG(progress_percent)) AS avg_progress
       FROM enrollments`
    )
    .get() as { total: number; completed: number | null; avg_progress: number | null };

  const certificates = (db.prepare("SELECT COUNT(*) AS n FROM certificates WHERE revoked = 0").get() as { n: number }).n;
  const pendingGrading = (
    db.prepare("SELECT COUNT(*) AS n FROM assessment_attempts WHERE status = 'submitted'").get() as { n: number }
  ).n;
  const avgScore = (
    db.prepare("SELECT ROUND(AVG(percent), 1) AS n FROM assessment_attempts WHERE status = 'graded'").get() as { n: number | null }
  ).n;

  const departments = db
    .prepare(
      `SELECT d.id, d.name, d.code,
              (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id AND u.status = 'active') AS staff,
              (SELECT COUNT(DISTINCT e.user_id) FROM enrollments e JOIN users u ON u.id = e.user_id WHERE u.department_id = d.id) AS learners,
              (SELECT COUNT(*) FROM enrollments e JOIN users u ON u.id = e.user_id WHERE u.department_id = d.id) AS enrolled,
              (SELECT COUNT(*) FROM enrollments e JOIN users u ON u.id = e.user_id WHERE u.department_id = d.id AND e.status = 'completed') AS completed
       FROM departments d ORDER BY staff DESC, d.name`
    )
    .all() as Array<{ id: number; name: string; code: string; staff: number; learners: number; enrolled: number; completed: number }>;
  const maxDeptEnrolled = Math.max(1, ...departments.map((d) => d.enrolled));

  const categories = db
    .prepare(
      `SELECT cc.name,
              COUNT(e.id) AS enrolled,
              SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM course_categories cc
       LEFT JOIN courses c ON c.category_id = cc.id
       LEFT JOIN enrollments e ON e.course_id = c.id
       GROUP BY cc.id ORDER BY enrolled DESC LIMIT 8`
    )
    .all() as Array<{ name: string; enrolled: number; completed: number | null }>;

  const months = db
    .prepare(
      `SELECT strftime('%Y-%m', enrolled_at) AS month, COUNT(*) AS n
       FROM enrollments
       WHERE enrolled_at >= date('now', '-6 months')
       GROUP BY month ORDER BY month`
    )
    .all() as Array<{ month: string; n: number }>;
  const maxMonth = Math.max(1, ...months.map((m) => m.n));

  const recentAudit = db
    .prepare("SELECT id, actor_name, action, details, created_at FROM audit_logs ORDER BY id DESC LIMIT 8")
    .all() as Array<{ id: number; actor_name: string | null; action: string; details: string | null; created_at: string }>;

  const legalQueue = db
    .prepare(
      `SELECT c.id, c.title, c.updated_at, u.first_name, u.middle_name, u.last_name
       FROM courses c LEFT JOIN users u ON u.id = c.instructor_id
       WHERE c.legal_review_status IN ('pending','demo_pending') ORDER BY c.updated_at LIMIT 5`
    )
    .all() as Array<{ id: number; title: string; updated_at: string; first_name: string | null; middle_name: string | null; last_name: string | null }>;

  const mandatory = db
    .prepare(
      `SELECT COUNT(*) AS assigned,
              SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) AS completed
       FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE c.is_mandatory = 1`
    )
    .get() as { assigned: number; completed: number | null };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={writable ? "Administration" : "Executive oversight"}
        title={writable ? "Administrative dashboard" : "Executive dashboard"}
        description={
          writable
            ? "Organisation-wide view of staff, courses, assessment throughput and compliance."
            : "Read-only executive oversight of training activity, completion and certification across the Commission."
        }
        actions={
          writable ? (
            <>
              <Link href="/admin/reports" className="btn btn-outline btn-sm"><BarChart3 size={14} /> Reports</Link>
              <Link href="/admin/users/new" className="btn btn-primary btn-sm"><Users size={14} /> Add staff</Link>
            </>
          ) : (
            <Link href="/admin/reports" className="btn btn-outline btn-sm"><BarChart3 size={14} /> View reports</Link>
          )
        }
      />

      {!writable && (
        <div className="rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-[12px] text-gold-800 dark:border-gold-900/40 dark:bg-gold-900/20 dark:text-gold-200">
          Management / Executive access is read-only. Administrative actions are disabled for this role.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Staff on register" value={formatNumber(staff.total)} sub={`${staff.active ?? 0} active · ${staff.pending ?? 0} pending`} icon={<Users size={18} />} />
        <StatCard label="Published courses" value={courseStats.published ?? 0} sub={`${courseStats.total} total · ${courseStats.drafts ?? 0} drafts`} icon={<BookOpen size={18} />} tone="blue" />
        <StatCard label="Enrolments" value={formatNumber(enrollmentStats.total)} sub={`${percent(enrollmentStats.completed ?? 0, enrollmentStats.total)}% completion`} icon={<GraduationCap size={18} />} tone="green" />
        <StatCard label="Certificates" value={formatNumber(certificates)} sub={`Avg score ${avgScore ?? 0}%`} icon={<Award size={18} />} tone="gold" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card flex items-center gap-3 p-4">
          <div className="rounded-xl bg-gold-50 p-2.5 text-gold-700 dark:bg-gold-900/30 dark:text-gold-200"><ClipboardCheck size={18} /></div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted">Awaiting grading</div>
            <div className="font-display text-[20px] font-bold text-ink">{pendingGrading}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="rounded-xl bg-red-50 p-2.5 text-red-700 dark:bg-red-950/40 dark:text-red-200"><ShieldCheck size={18} /></div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted">Legal reviews pending</div>
            <div className="font-display text-[20px] font-bold text-ink">{courseStats.legal_pending ?? 0}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"><Building2 size={18} /></div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted">Departments</div>
            <div className="font-display text-[20px] font-bold text-ink">{departments.length}</div>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200"><Activity size={18} /></div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wide text-muted">Locked accounts</div>
            <div className="font-display text-[20px] font-bold text-ink">{staff.locked ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-[16px] font-bold text-ink">Departmental training activity</h2>
              <p className="mt-0.5 text-[11.5px] text-muted">Active staff, enrolments and completion by department.</p>
            </div>
            <Link href="/admin/reports" className="btn btn-ghost btn-sm">Details</Link>
          </div>
          <div className="max-h-[360px] overflow-y-auto scroll-thin">
            <table className="table">
              <thead><tr><th>Department</th><th>Staff</th><th>Enrolments</th><th>Completion</th></tr></thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="text-[12px] font-semibold text-ink">{d.name}</div>
                      <div className="text-[10px] text-muted">{d.code}</div>
                    </td>
                    <td className="text-[11.5px]">{d.staff}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-700 dark:bg-brand-400" style={{ width: `${Math.max(3, Math.round((d.enrolled / maxDeptEnrolled) * 100))}%` }} /></div>
                        <span className="text-[11px]">{d.enrolled}</span>
                      </div>
                    </td>
                    <td><span className={`chip ${percent(d.completed, d.enrolled) >= 60 ? "chip-green" : "chip-gold"}`}>{percent(d.completed, d.enrolled)}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-[16px] font-bold text-ink">Enrolment trend</h2>
          <p className="mt-0.5 text-[11.5px] text-muted">Last six months.</p>
          <div className="mt-5 flex h-40 items-end gap-2.5">
            {months.length === 0 && <p className="text-[12px] text-muted">No enrolments recorded in this period.</p>}
            {months.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-ink-soft">{m.n}</span>
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-gradient-to-t from-brand-800 to-brand-500 dark:from-brand-500 dark:to-brand-300" style={{ height: `${Math.max(6, Math.round((m.n / maxMonth) * 100))}%` }} />
                </div>
                <span className="text-[9.5px] text-muted">{new Date(`${m.month}-01T00:00:00`).toLocaleDateString("en-NG", { month: "short" })}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-line pt-4">
            <div className="flex justify-between text-[11.5px]"><span className="text-muted">Mandatory course compliance</span><span className="font-semibold text-ink">{percent(mandatory.completed ?? 0, mandatory.assigned)}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-gold-500" style={{ width: `${percent(mandatory.completed ?? 0, mandatory.assigned)}%` }} /></div>
            <p className="mt-2 text-[10.5px] text-muted">{mandatory.completed ?? 0} of {mandatory.assigned} mandatory enrolments completed.</p>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card overflow-hidden xl:col-span-2">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-[16px] font-bold text-ink">Curriculum coverage by category</h2>
            <p className="mt-0.5 text-[11.5px] text-muted">Enrolments and completion across the 12 departmental training categories.</p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {categories.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-[11px]"><span className="truncate text-ink-soft">{c.name}</span><span className="shrink-0 font-semibold text-ink">{c.enrolled}</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-700 dark:bg-brand-400" style={{ width: `${percent(c.completed ?? 0, c.enrolled)}%` }} /></div>
                <div className="mt-0.5 text-[9.5px] text-muted">{percent(c.completed ?? 0, c.enrolled)}% completed</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-[16px] font-bold text-ink">Recent audit activity</h2>
            {writable && <Link href="/admin/audit" className="btn btn-ghost btn-sm">All logs</Link>}
          </div>
          <div className="divide-y divide-line">
            {recentAudit.map((a) => (
              <div key={a.id} className="px-5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-semibold text-ink">{humanStatus(a.action)}</span>
                  <span className="shrink-0 text-[9.5px] text-muted">{timeAgo(a.created_at)}</span>
                </div>
                <div className="truncate text-[10.5px] text-muted">{a.details ?? ""} {a.actor_name ? `· ${a.actor_name}` : ""}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {writable && legalQueue.length > 0 && (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-[16px] font-bold text-ink">Legal Department review queue</h2>
              <p className="mt-0.5 text-[11.5px] text-muted">Courses with legal content must be approved before publication.</p>
            </div>
            <Link href="/admin/settings#legal" className="btn btn-gold btn-sm"><ShieldCheck size={14} /> Review</Link>
          </div>
          <div className="divide-y divide-line">
            {legalQueue.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div>
                  <div className="text-[12.5px] font-semibold text-ink">{c.title}</div>
                  <div className="text-[10.5px] text-muted">Submitted by {c.first_name ? [c.first_name, c.middle_name, c.last_name].filter(Boolean).join(" ") : "system"} · {timeAgo(c.updated_at)}</div>
                </div>
                <span className="chip chip-gold">Pending review</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="text-[10.5px] leading-relaxed text-muted">
        Demonstration data · The ICPC Digital Learning Portal presents fictitious staff and training records for evaluation. No real personnel or Commission performance data is shown.
      </p>
    </div>
  );
}
