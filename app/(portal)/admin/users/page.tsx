import Link from "next/link";
import { Lock, Plus, Search, ShieldCheck, Unlock, UserCheck, UserX } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime, humanStatus } from "@/lib/format";
import { ROLE_LABELS, roleBadgeClass, type Role } from "@/lib/rbac";
import { PageHeader, StatCard } from "@/components/ui";
import { setUserStatusAction, unlockUserAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string; department?: string; created?: string; unlocked?: string; error?: string }>;
}) {
  await requireUser(["super_admin", "training_admin"]);
  const params = await searchParams;
  const db = getDb();
  const q = (params.q ?? "").trim();
  const role = params.role ?? "";
  const status = params.status ?? "";
  const departmentId = Number(params.department) || 0;

  const where: string[] = [];
  const args: Array<string | number> = [];
  if (q) {
    where.push("(u.first_name LIKE ? OR u.last_name LIKE ? OR u.staff_id LIKE ? OR u.email LIKE ?)");
    const like = `%${q}%`;
    args.push(like, like, like, like);
  }
  if (role) {
    where.push("u.role = ?");
    args.push(role);
  }
  if (status) {
    where.push("u.status = ?");
    args.push(status);
  }
  if (departmentId) {
    where.push("u.department_id = ?");
    args.push(departmentId);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const users = db
    .prepare(
      `SELECT u.id, u.staff_id, u.email, u.first_name, u.last_name, u.role, u.designation, u.status,
              u.last_login_at, u.failed_attempts, u.locked_until, u.must_change_password,
              d.name AS department_name, un.name AS unit_name
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN units un ON un.id = u.unit_id
       ${clause}
       ORDER BY CASE u.status WHEN 'active' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END, u.last_name, u.first_name`
    )
    .all(...args) as Array<{
    id: number;
    staff_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    designation: string | null;
    status: string;
    last_login_at: string | null;
    failed_attempts: number;
    locked_until: string | null;
    must_change_password: number;
    department_name: string | null;
    unit_name: string | null;
  }>;

  const departments = db.prepare("SELECT id, name FROM departments ORDER BY name").all() as Array<{ id: number; name: string }>;
  const totals = db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS active,
              SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
              SUM(CASE WHEN status='suspended' THEN 1 ELSE 0 END) AS suspended
       FROM users`
    )
    .get() as { total: number; active: number | null; pending: number | null; suspended: number | null };
  const now = new Date().toISOString();
  const created = params.created ? params.created.split("|") : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staff register"
        title="Staff management"
        description="Create staff accounts with automatically generated Staff IDs (P####) and official ICPC email addresses. Suspend, unlock and reset credentials."
        actions={<Link href="/admin/users/new" className="btn btn-primary btn-sm"><Plus size={14} /> Add staff</Link>}
      />

      {created?.length === 2 && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12px] text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          Staff account created. Staff ID <strong>{created[0]}</strong> · Official email <strong>{created[1]}</strong>. Share the temporary password securely; the staff member must change it at first sign-in.
        </div>
      )}
      {params.unlocked && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          Account lock cleared. The staff member can sign in again.
        </div>
      )}
      {params.error === "self" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          You cannot suspend or change the role of your own account.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total staff" value={totals.total} />
        <StatCard label="Active" value={totals.active ?? 0} tone="green" />
        <StatCard label="Pending activation" value={totals.pending ?? 0} tone="gold" />
        <StatCard label="Suspended" value={totals.suspended ?? 0} tone="red" />
      </div>

      <form method="get" className="card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[240px] flex-1">
          <label className="label" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={q} className="input" placeholder="Name, staff ID or email" />
        </div>
        <div className="min-w-[160px]">
          <label className="label" htmlFor="role">Role</label>
          <select id="role" name="role" className="select" defaultValue={role}>
            <option value="">All roles</option>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        <div className="min-w-[150px]">
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" className="select" defaultValue={status}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div className="min-w-[190px]">
          <label className="label" htmlFor="department">Department</label>
          <select id="department" name="department" className="select" defaultValue={departmentId || ""}>
            <option value="">All departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-outline btn-sm"><Search size={14} /> Filter</button>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Staff member</th><th>Role</th><th>Department</th><th>Status</th><th>Last sign-in</th><th>Security</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const locked = u.locked_until && u.locked_until > now;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="font-semibold text-ink">{u.first_name} {u.last_name}</div>
                      <div className="text-[10.5px] text-muted">{u.staff_id} · {u.email}</div>
                      {u.designation && <div className="text-[10px] text-muted">{u.designation}</div>}
                    </td>
                    <td><span className={`chip ${roleBadgeClass(u.role)}`}>{ROLE_LABELS[u.role]}</span></td>
                    <td className="text-[11.5px] text-muted">{u.department_name ?? "Unassigned"}{u.unit_name ? <div className="text-[10px]">{u.unit_name}</div> : null}</td>
                    <td><span className={`chip ${u.status === "active" ? "chip-green" : u.status === "pending" ? "chip-gold" : "chip-red"}`}>{humanStatus(u.status)}</span></td>
                    <td className="text-[11px] text-muted">{u.last_login_at ? formatDateTime(u.last_login_at) : "Never"}</td>
                    <td>
                      <div className="flex flex-col gap-1 text-[10.5px]">
                        {locked && <span className="flex items-center gap-1 text-red-600 dark:text-red-300"><Lock size={11} /> Locked</span>}
                        {!locked && u.failed_attempts > 0 && <span className="text-gold-700 dark:text-gold-300">{u.failed_attempts} failed attempts</span>}
                        {u.must_change_password ? <span className="text-muted">Password change required</span> : null}
                        {!locked && u.failed_attempts === 0 && !u.must_change_password && <span className="text-muted">Clear</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {locked && (
                          <form action={unlockUserAction}>
                            <input type="hidden" name="userId" value={u.id} />
                            <button type="submit" className="btn btn-outline btn-sm" title="Unlock account"><Unlock size={13} /></button>
                          </form>
                        )}
                        {u.status === "active" ? (
                          <form action={setUserStatusAction}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="status" value="suspended" />
                            <button type="submit" className="btn btn-ghost btn-sm text-red-600 dark:text-red-300" title="Suspend"><UserX size={13} /></button>
                          </form>
                        ) : (
                          <form action={setUserStatusAction}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="status" value="active" />
                            <button type="submit" className="btn btn-ghost btn-sm text-green-700 dark:text-green-300" title="Activate"><UserCheck size={13} /></button>
                          </form>
                        )}
                        <Link href={`/admin/users/${u.id}`} className="btn btn-outline btn-sm"><ShieldCheck size={13} /> Manage</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-[12.5px] text-muted">No staff match the filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
