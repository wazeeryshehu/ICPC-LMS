import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, BookOpen, KeyRound, Lock, LogOut, Mail, Shield, Unlock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime, fullName, humanStatus, percent } from "@/lib/format";
import { isSuperAdmin, ROLE_LABELS, roleBadgeClass, type Role } from "@/lib/rbac";
import { PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { resetPasswordAction, unlockUserAction, updateUserAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; temp?: string; error?: string }>;
}) {
  const actor = await requireUser(["super_admin", "training_admin"]);
  const { id } = await params;
  const { saved, temp, error } = await searchParams;
  const db = getDb();
  const userId = Number(id);
  const staff = db
    .prepare(
      `SELECT u.*, d.name AS department_name, un.name AS unit_name
       FROM users u LEFT JOIN departments d ON d.id = u.department_id LEFT JOIN units un ON un.id = u.unit_id
       WHERE u.id = ?`
    )
    .get(userId) as
    | {
        id: number;
        staff_id: string;
        email: string;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        role: Role;
        designation: string | null;
        department_id: number | null;
        unit_id: number | null;
        phone: string | null;
        status: string;
        must_change_password: number;
        failed_attempts: number;
        locked_until: string | null;
        last_login_at: string | null;
        created_at: string;
        updated_at: string;
        department_name: string | null;
        unit_name: string | null;
      }
    | undefined;
  if (!staff) notFound();

  const departments = db.prepare("SELECT id, name FROM departments ORDER BY name").all() as Array<{ id: number; name: string }>;
  const units = db
    .prepare("SELECT un.id, un.name, un.department_id, d.name AS department_name FROM units un JOIN departments d ON d.id = un.department_id ORDER BY d.name, un.name")
    .all() as Array<{ id: number; name: string; department_id: number; department_name: string }>;
  const roles = (Object.keys(ROLE_LABELS) as Role[]).filter((r) => r !== "super_admin" || isSuperAdmin(actor.role));

  const enrollmentStats = db
    .prepare(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed, ROUND(AVG(progress_percent)) AS avg
       FROM enrollments WHERE user_id = ?`
    )
    .get(userId) as { total: number; completed: number | null; avg: number | null };
  const certs = db.prepare("SELECT COUNT(*) AS n FROM certificates WHERE user_id = ? AND revoked = 0").get(userId) as { n: number };
  const attempts = db
    .prepare(
      `SELECT at.id, at.percent, at.passed, at.status, at.submitted_at, a.title, c.title AS course_title
       FROM assessment_attempts at JOIN assessments a ON a.id = at.assessment_id JOIN courses c ON c.id = a.course_id
       WHERE at.user_id = ? ORDER BY at.id DESC LIMIT 5`
    )
    .all(userId) as Array<{ id: number; percent: number | null; passed: number | null; status: string; submitted_at: string | null; title: string; course_title: string }>;
  const certificates = db
    .prepare(
      `SELECT ct.cert_no, ct.final_score, ct.grade, ct.issued_at, c.title FROM certificates ct JOIN courses c ON c.id = ct.course_id
       WHERE ct.user_id = ? AND ct.revoked = 0 ORDER BY ct.issued_at DESC LIMIT 5`
    )
    .all(userId) as Array<{ cert_no: string; final_score: number; grade: string; issued_at: string; title: string }>;
  const sessions = db.prepare("SELECT COUNT(*) AS n FROM app_sessions WHERE user_id = ? AND expires_at > ?").get(userId, new Date().toISOString()) as { n: number };
  const activity = db
    .prepare("SELECT action, details, created_at FROM audit_logs WHERE actor_id = ? ORDER BY id DESC LIMIT 6")
    .all(userId) as Array<{ action: string; details: string | null; created_at: string }>;
  const now = new Date().toISOString();
  const locked = staff.locked_until && staff.locked_until > now;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${staff.staff_id} · ${staff.department_name ?? "Unassigned"}`}
        title={fullName(staff.first_name, staff.last_name, staff.middle_name)}
        description={`${ROLE_LABELS[staff.role]}${staff.designation ? ` · ${staff.designation}` : ""} · joined ${formatDateTime(staff.created_at)}`}
        actions={
          <>
            <Link href="/admin/users" className="btn btn-outline btn-sm"><ArrowLeft size={14} /> Staff register</Link>
            <form action={resetPasswordAction}>
              <input type="hidden" name="userId" value={staff.id} />
              <button type="submit" className="btn btn-gold btn-sm"><KeyRound size={14} /> Reset password</button>
            </form>
          </>
        }
      />

      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          Staff record updated and audit trail recorded.
        </div>
      )}
      {temp && (
        <div className="rounded-xl border border-gold-300 bg-gold-50 px-4 py-3 text-[12.5px] text-gold-900 dark:border-gold-900/50 dark:bg-gold-900/20 dark:text-gold-100">
          Temporary password issued: <strong className="font-mono">{temp}</strong>. Share it securely. All active sessions were signed out and the staff member must change it at next sign-in.
        </div>
      )}
      {error === "privilege" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Only a Super Administrator may modify Super Administrator accounts.
        </div>
      )}
      {error === "self" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          You cannot suspend your own account or change your own system role.
        </div>
      )}
      {error === "invalid" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          The selected department and unit do not match. Choose a unit within the department.
        </div>
      )}
      {error === "staffid" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          That Staff ID is invalid or already belongs to another staff member. Use 2-20 letters, numbers, hyphens or slashes (e.g. P0027 or ICPC/HR/0231).
        </div>
      )}
      {error === "email" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          That official email is invalid or already belongs to another staff member. It must end with @icpc.gov.ng.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolments" value={enrollmentStats.total} sub={`${enrollmentStats.completed ?? 0} completed`} icon={<BookOpen size={18} />} />
        <StatCard label="Average progress" value={`${enrollmentStats.avg ?? 0}%`} tone="green" />
        <StatCard label="Certificates" value={certs.n} tone="gold" icon={<Award size={18} />} />
        <StatCard label="Active sessions" value={sessions.n} sub={locked ? "Account locked" : humanStatus(staff.status)} tone="blue" icon={<Shield size={18} />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="font-display text-[16px] font-bold text-ink">Staff record</h2>
            <div className="mt-3 grid gap-2 rounded-lg bg-panel-2 px-4 py-3 text-[12px] text-ink-soft sm:grid-cols-2">
              <div><span className="text-muted">Staff ID:</span> <strong>{staff.staff_id}</strong></div>
              <div className="flex items-center gap-1.5"><Mail size={12} className="text-muted" /> {staff.email}</div>
              <div><span className="text-muted">Last sign-in:</span> {staff.last_login_at ? formatDateTime(staff.last_login_at) : "Never"}</div>
              <div><span className="text-muted">Failed attempts:</span> {staff.failed_attempts}{locked ? " · locked" : ""}</div>
              <div><span className="text-muted">Password change required:</span> {staff.must_change_password ? "Yes" : "No"}</div>
              <div><span className="text-muted">Unit:</span> {staff.unit_name ?? "—"}</div>
            </div>

            <form action={updateUserAction} className="mt-5 space-y-4">
              <input type="hidden" name="userId" value={staff.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="otherName">Other name</label>
                  <input id="otherName" name="otherName" defaultValue={staff.middle_name ?? ""} className="input" maxLength={60} />
                </div>
                <div>
                  <label className="label">Designation</label>
                  <input name="designation" defaultValue={staff.designation ?? ""} className="input" />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input name="phone" defaultValue={staff.phone ?? ""} className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="staffId">Staff ID</label>
                  <input
                    id="staffId"
                    name="staffId"
                    defaultValue={staff.staff_id}
                    className="input font-mono uppercase"
                    maxLength={20}
                    autoCapitalize="characters"
                    spellCheck={false}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="email">Official email</label>
                  <input id="email" name="email" type="email" defaultValue={staff.email} className="input" maxLength={80} required />
                  <p className="mt-1 text-[10px] text-muted">
                    The Staff ID and official email are the officer&apos;s sign-in identifiers. Changes are checked for format and uniqueness, and recorded in the audit trail.
                  </p>
                </div>
                <div>
                  <label className="label">Department</label>
                  <select name="departmentId" className="select" defaultValue={staff.department_id ?? ""}>
                    <option value="">Unassigned</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select name="unitId" className="select" defaultValue={staff.unit_id ?? ""}>
                    <option value="">No specific unit</option>
                    {units.map((u) => <option key={u.id} value={u.id}>{u.department_name} — {u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Role</label>
                  <select name="role" className="select" defaultValue={staff.role}>
                    {roles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Account status</label>
                  <select name="status" className="select" defaultValue={staff.status}>
                    <option value="active">Active</option>
                    <option value="pending">Pending activation</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="btn btn-primary btn-sm">Save changes</button>
                {locked && (
                  <button type="submit" formAction={unlockUserAction} className="btn btn-outline btn-sm"><Unlock size={13} /> Unlock account</button>
                )}
              </div>
              {locked && <p className="text-[10.5px] text-muted">Account locked until {formatDateTime(staff.locked_until)} after repeated failed sign-ins.</p>}
            </form>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-line px-5 py-4"><h2 className="font-display text-[16px] font-bold text-ink">Learning record</h2></div>
            <div className="grid gap-5 p-5 md:grid-cols-2">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted">Recent assessments</h3>
                <div className="mt-2 space-y-2">
                  {attempts.length === 0 && <p className="text-[11.5px] text-muted">No assessment attempts.</p>}
                  {attempts.map((a) => (
                    <div key={a.id} className="rounded-lg border border-line px-3 py-2">
                      <div className="flex justify-between gap-2">
                        <span className="truncate text-[11.5px] text-ink-soft">{a.title}</span>
                        <span className={`chip !py-0 ${a.status === "graded" ? (a.passed ? "chip-green" : "chip-red") : "chip-gold"}`}>{a.percent != null ? `${a.percent}%` : humanStatus(a.status)}</span>
                      </div>
                      <div className="mt-0.5 truncate text-[10px] text-muted">{a.course_title}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted">Certificates</h3>
                <div className="mt-2 space-y-2">
                  {certificates.length === 0 && <p className="text-[11.5px] text-muted">No certificates issued.</p>}
                  {certificates.map((c) => (
                    <div key={c.cert_no} className="rounded-lg border border-line px-3 py-2">
                      <div className="truncate text-[11.5px] text-ink-soft">{c.title}</div>
                      <div className="mt-0.5 flex justify-between text-[10px] text-muted"><span>{c.cert_no}</span><span>{c.grade} · {c.final_score}%</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-line px-5 py-3">
              <div className="mb-1 flex justify-between text-[10.5px] text-muted"><span>Overall learning progress</span><span>{percent(enrollmentStats.completed ?? 0, enrollmentStats.total)}%</span></div>
              <ProgressBar value={percent(enrollmentStats.completed ?? 0, enrollmentStats.total)} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <div className="flex items-center gap-2"><Lock size={15} className="text-muted" /><h2 className="font-display text-[16px] font-bold text-ink">Security actions</h2></div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
              Password resets invalidate active sessions and force a change at next sign-in. Locked accounts unlock automatically after the configured lockout window.
            </p>
            <form action={resetPasswordAction} className="mt-3">
              <input type="hidden" name="userId" value={staff.id} />
              <button type="submit" className="btn btn-outline btn-sm w-full"><KeyRound size={13} /> Issue temporary password</button>
            </form>
            <div className="mt-3 flex items-center justify-between rounded-lg bg-panel-2 px-3 py-2 text-[11px] text-muted">
              <span className="flex items-center gap-1.5"><LogOut size={12} /> {sessions.n} active session{sessions.n === 1 ? "" : "s"}</span>
              <span className={`chip ${staff.status === "active" ? "chip-green" : staff.status === "pending" ? "chip-gold" : "chip-red"}`}>{humanStatus(staff.status)}</span>
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-line px-5 py-4"><h2 className="font-display text-[16px] font-bold text-ink">Account activity</h2></div>
            <div className="divide-y divide-line">
              {activity.length === 0 && <p className="px-5 py-6 text-[11.5px] text-muted">No recorded administrative activity for this account.</p>}
              {activity.map((a, i) => (
                <div key={i} className="px-5 py-2.5">
                  <div className="text-[11.5px] font-semibold text-ink">{humanStatus(a.action)}</div>
                  <div className="truncate text-[10.5px] text-muted">{a.details}</div>
                  <div className="text-[9.5px] text-muted">{formatDateTime(a.created_at)}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-xl border border-line bg-panel-2 p-4 text-[11px] leading-relaxed text-muted">
            <span className={`chip ${roleBadgeClass(staff.role)}`}>{ROLE_LABELS[staff.role]}</span>
            <p className="mt-2">Role changes take effect on the next request. Sessions belonging to suspended accounts are revoked immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
