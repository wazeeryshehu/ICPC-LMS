import { AlertTriangle, CheckCircle2, KeyRound, Lock, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime, fullName, initials } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/rbac";
import { PageHeader } from "@/components/ui";
import { changePasswordAction, updateProfileAction } from "@/lib/actions/account";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string; msg?: string; change?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const db = getDb();

  const activity = db
    .prepare(
      `SELECT action, entity, details, ip, created_at FROM audit_logs WHERE actor_id = ?
       ORDER BY created_at DESC LIMIT 8`
    )
    .all(user.id) as Array<{ action: string; entity: string | null; details: string | null; ip: string | null; created_at: string }>;

  const sessions = db
    .prepare("SELECT COUNT(*) AS n FROM app_sessions WHERE user_id = ? AND expires_at > ?")
    .get(user.id, new Date().toISOString()) as { n: number };

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="My Profile & Security"
        description="Your official staff record, contact details and account security. Role, department and staff ID are maintained by the Training and HR administration."
        actions={<Link href="/notifications" className="btn btn-outline btn-sm">Notifications</Link>}
      />

      {user.must_change_password === 1 && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-gold-300 bg-gold-50 px-4 py-3 text-[12px] text-gold-900 dark:border-gold-900/40 dark:bg-gold-900/20 dark:text-gold-100">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span>
            <strong>Password change required.</strong> You are signed in with a temporary password. Set a new password below to unlock the rest of the portal.
          </span>
        </div>
      )}

      {(sp.saved || sp.error) && (
        <div className={`mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-[12px] ${
          sp.error
            ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100"
            : "border-green-200 bg-green-50 text-green-900 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-100"
        }`}>
          {sp.error ? <AlertTriangle size={15} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}
          <span>
            {sp.error === "current" && "Your current password is incorrect."}
            {sp.error === "policy" && (sp.msg || "Your new password does not meet the password policy.")}
            {sp.error === "match" && "The new password and confirmation do not match."}
            {sp.saved === "1" && "Your contact details have been updated."}
            {sp.saved === "password" && "Your password has been changed. Use the new password at your next sign-in."}
          </span>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16437f] to-[#3b72c8] font-display text-[22px] font-bold text-[#8fc0f5]">
                {initials(user.first_name, user.last_name)}
              </div>
              <div>
                <h2 className="font-display text-[20px] font-bold text-ink">{fullName(user.first_name, user.last_name, user.middle_name)}</h2>
                <div className="text-[12px] text-muted">{user.designation ?? "Staff"}</div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span className="chip chip-gold">{ROLE_LABELS[user.role]}</span>
                  <span className="chip chip-green">{user.department_name ?? "ICPC"}</span>
                  <span className="chip chip-gray">Staff ID {user.staff_id}</span>
                </div>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted"><UserRound size={11} /> Full name</dt>
                <dd className="mt-0.5 text-[13px] font-medium text-ink">{fullName(user.first_name, user.last_name, user.middle_name)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted"><Mail size={11} /> Official email</dt>
                <dd className="mt-0.5 truncate text-[13px] font-medium text-ink">{user.email}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted"><MapPin size={11} /> Department</dt>
                <dd className="mt-0.5 text-[13px] font-medium text-ink">{user.department_name ?? "—"}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted"><MapPin size={11} /> Unit</dt>
                <dd className="mt-0.5 text-[13px] font-medium text-ink">{user.unit_name ?? "Not assigned"}</dd>
              </div>
            </dl>

            <form action={updateProfileAction} className="mt-5 border-t border-line pt-4">
              <label htmlFor="phone" className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted">Contact telephone</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Phone size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input id="phone" name="phone" defaultValue={user.phone ?? ""} placeholder="+234 800 000 0000" className="input pl-9" />
                </div>
                <button className="btn btn-primary btn-sm h-[38px]">Save contact details</button>
              </div>
              <p className="mt-1.5 text-[10px] text-muted">Staff ID, official email, role, department and unit can only be changed by administrators.</p>
            </form>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-brand-700 dark:text-brand-300" />
              <h2 className="font-display text-[16px] font-bold text-ink">Change password</h2>
            </div>
            <form action={changePasswordAction} className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="currentPassword" className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted">Current password</label>
                <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className="input" />
              </div>
              <div>
                <label htmlFor="newPassword" className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted">New password</label>
                <input id="newPassword" name="newPassword" type="password" required minLength={10} autoComplete="new-password" className="input" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted">Confirm new password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required minLength={10} autoComplete="new-password" className="input" />
              </div>
              <div className="sm:col-span-3">
                <button className="btn btn-primary btn-sm">Update password</button>
              </div>
            </form>
            <div className="mt-4 rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[10.5px] leading-relaxed text-muted">
              <strong className="text-ink-soft">Password policy:</strong> at least 10 characters, including uppercase and lowercase letters, a number and a symbol. Passwords are stored using scrypt hashing and are never displayed.
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-[16px] font-bold text-ink">Recent account activity</h2>
              <p className="text-[11px] text-muted">Audit trail entries for your account.</p>
            </div>
            {activity.length === 0 ? (
              <p className="px-5 py-6 text-[12px] text-muted">No account activity recorded yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-ink">{a.action.replace(/\./g, " · ")}</div>
                      <div className="truncate text-[10.5px] text-muted">{a.details ?? a.entity ?? "—"}</div>
                    </div>
                    <div className="shrink-0 text-right text-[10px] text-muted">
                      <div>{formatDateTime(a.created_at)}</div>
                      <div>{a.ip ?? ""}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-700 dark:text-brand-300" />
              <h3 className="font-display text-[15px] font-bold text-ink">Account status</h3>
            </div>
            <div className="mt-3 space-y-2 text-[11.5px]">
              <div className="flex items-center justify-between"><span className="text-muted">Status</span><span className="chip chip-green">Active</span></div>
              <div className="flex items-center justify-between"><span className="text-muted">Last sign-in</span><span className="font-medium text-ink">{formatDateTime(user.last_login_at)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted">Active sessions</span><span className="font-medium text-ink">{sessions.n}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted">Account created</span><span className="font-medium text-ink">{formatDateTime((db.prepare("SELECT created_at FROM users WHERE id = ?").get(user.id) as { created_at: string }).created_at)}</span></div>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-brand-700 dark:text-brand-300" />
              <h3 className="font-display text-[15px] font-bold text-ink">Security protections</h3>
            </div>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-muted">
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0 text-green-600" /> Account locks after repeated failed sign-in attempts.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0 text-green-600" /> Sessions expire automatically after 8 hours.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0 text-green-600" /> All sign-ins and changes are written to the audit trail.</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0 text-green-600" /> Personal data processed in line with the NDPA 2023.</li>
            </ul>
          </section>

          <section className="rounded-xl border border-gold-200 bg-gold-50 p-4 text-[10.5px] leading-relaxed text-gold-900 dark:border-gold-900/40 dark:bg-gold-900/20 dark:text-gold-100">
            <strong>Demonstration account.</strong> This portal contains fictitious staff records for demonstration. Use the seeded credentials shown on the sign-in page.
          </section>
        </aside>
      </div>
    </div>
  );
}
