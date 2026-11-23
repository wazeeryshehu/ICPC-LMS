import Link from "next/link";
import { ArrowLeft, BadgeCheck, KeyRound, Mail, UserPlus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isSuperAdmin, ROLE_LABELS, type Role } from "@/lib/rbac";
import { PageHeader } from "@/components/ui";
import { createUserAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function NewUserPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const actor = await requireUser(["super_admin", "training_admin"]);
  const { error } = await searchParams;
  const db = getDb();
  const departments = db.prepare("SELECT id, name FROM departments ORDER BY name").all() as Array<{ id: number; name: string }>;
  const units = db
    .prepare(
      `SELECT un.id, un.name, d.name AS department_name FROM units un JOIN departments d ON d.id = un.department_id ORDER BY d.name, un.name`
    )
    .all() as Array<{ id: number; name: string; department_name: string }>;
  const roles = (Object.keys(ROLE_LABELS) as Role[]).filter((r) => r !== "super_admin" || isSuperAdmin(actor.role));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Staff register"
        title="Add a staff member"
        description="Register a staff member with their full name, Staff ID and official email address. Leave the Staff ID blank to continue the existing numbering sequence; the email address is always entered manually."
        actions={<Link href="/admin/users" className="btn btn-outline btn-sm"><ArrowLeft size={14} /> Back to staff</Link>}
      />

      {error === "policy" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Password does not meet the policy: at least 10 characters with uppercase, lowercase, number and symbol.
        </div>
      )}
      {error === "privilege" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Only a Super Administrator may create another Super Administrator.
        </div>
      )}
      {error === "invalid" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Please complete the required fields and choose a valid department / unit combination.
        </div>
      )}
      {error === "staffid" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          That Staff ID is already in use, or its format is invalid. Staff IDs are not case-sensitive — P0001 and p0001 refer to the same officer. Use 2-20 letters, numbers, hyphens or slashes, for example P0027 or ICPC/HR/0231.
        </div>
      )}
      {error === "email" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Enter the officer&apos;s official @icpc.gov.ng email address. It must be valid and not already in use.
        </div>
      )}

      <form action={createUserAction} className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="card space-y-4 p-5">
          <h2 className="font-display text-[16px] font-bold text-ink">Personal and posting details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="firstName">First name *</label>
              <input id="firstName" name="firstName" className="input" required placeholder="Amina" maxLength={60} />
            </div>
            <div>
              <label className="label" htmlFor="otherName">Other name <span className="font-normal text-muted">(optional)</span></label>
              <input id="otherName" name="otherName" className="input" placeholder="Chidinma" maxLength={60} />
              <p className="mt-1 text-[10px] text-muted">Middle or other name for officers with three or more names.</p>
            </div>
            <div>
              <label className="label" htmlFor="lastName">Surname *</label>
              <input id="lastName" name="lastName" className="input" required placeholder="Bello" maxLength={60} />
            </div>
            <div>
              <label className="label" htmlFor="staffId">Staff ID</label>
              <input
                id="staffId"
                name="staffId"
                className="input font-mono"
                placeholder="Leave blank to continue the sequence"
                maxLength={20}
                spellCheck={false}
              />
              <p className="mt-1 text-[10px] text-muted">Enter the officer&apos;s existing Staff ID if they already have one (e.g. ICPC/HR/0231). Case is kept as entered, P0001 and p0001 are the same ID, and generated IDs follow the numbering case in use (P#### or p####).</p>
            </div>
            <div>
              <label className="label" htmlFor="email">Official email *</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                required
                placeholder="amina.bello@icpc.gov.ng"
                maxLength={80}
                autoCapitalize="none"
                spellCheck={false}
              />
              <p className="mt-1 text-[10px] text-muted">Enter the officer&apos;s actual @icpc.gov.ng address. It is not generated from the name.</p>
            </div>
            <div>
              <label className="label" htmlFor="designation">Designation</label>
              <input id="designation" name="designation" className="input" placeholder="Senior Compliance Officer" />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone</label>
              <input id="phone" name="phone" className="input" placeholder="+234 800 000 0000" />
            </div>
          </div>

          <h2 className="pt-2 font-display text-[16px] font-bold text-ink">Department and role</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="departmentId">Department</label>
              <select id="departmentId" name="departmentId" className="select" defaultValue="">
                <option value="">Unassigned</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="unitId">Unit</label>
              <select id="unitId" name="unitId" className="select" defaultValue="">
                <option value="">No specific unit</option>
                {units.map((u) => <option key={u.id} value={u.id}>{u.department_name} — {u.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="role">System role *</label>
              <select id="role" name="role" className="select" defaultValue="learner" required>
                {roles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
                Learners and coordinators access the staff portal; instructors manage course content; management roles are read-only executive views.
              </p>
            </div>
          </div>

          <h2 className="pt-2 font-display text-[16px] font-bold text-ink">Access credentials</h2>
          <div>
            <label className="label" htmlFor="password">Temporary password *</label>
            <input id="password" name="password" type="text" className="input" defaultValue="Icpc@2026!" required minLength={10} />
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
              Must contain at least 10 characters, uppercase, lowercase, a number and a symbol. The staff member is required to change it at first sign-in.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="card p-5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink"><BadgeCheck size={16} /> Sign-in identifiers</div>
            <div className="mt-3 space-y-3 text-[11.5px] leading-relaxed text-muted">
              <div className="flex items-start gap-2"><KeyRound size={14} className="mt-0.5 shrink-0" /><span><strong className="text-ink-soft">Staff ID</strong> — entered manually when one already exists. If left blank, the next sequential number is assigned using the same case as the latest Staff ID (P0028 or p0028).</span></div>
              <div className="flex items-start gap-2"><Mail size={14} className="mt-0.5 shrink-0" /><span><strong className="text-ink-soft">Official email</strong> — always entered manually; the portal does not derive addresses from names. Only @icpc.gov.ng addresses are accepted.</span></div>
            </div>
          </section>
          <section className="rounded-xl border border-line bg-panel-2 p-4 text-[11px] leading-relaxed text-muted">
            Both the Staff ID and official email are required to sign in, together with the password. Shared or personal mailboxes that do not match the staff record are rejected.
          </section>
          <button type="submit" className="btn btn-primary w-full"><UserPlus size={15} /> Create staff account</button>
        </aside>
      </form>
    </div>
  );
}
