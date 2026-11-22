import Link from "next/link";
import { Award, Bell, Building2, Lock, Save, Scale, Settings2, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime, humanStatus } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";
import { reviewLegalContentAction, saveSettingsAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireUser(["super_admin", "training_admin"]);
  const { saved } = await searchParams;
  const db = getDb();
  const settings = Object.fromEntries(
    (db.prepare("SELECT key, value FROM settings").all() as Array<{ key: string; value: string }>).map((r) => [r.key, r.value])
  ) as Record<string, string>;
  const legalCourses = db
    .prepare(
      `SELECT c.id, c.title, c.updated_at, c.legal_review_status, cc.name AS category_name,
              u.first_name, u.last_name
       FROM courses c LEFT JOIN course_categories cc ON cc.id = c.category_id LEFT JOIN users u ON u.id = c.instructor_id
       WHERE c.legal_review_status IN ('pending','demo_pending','rejected')
       ORDER BY c.updated_at DESC`
    )
    .all() as Array<{
    id: number;
    title: string;
    updated_at: string;
    legal_review_status: string;
    category_name: string | null;
    first_name: string | null;
    last_name: string | null;
  }>;
  const reviews = db
    .prepare(
      `SELECT cr.id, cr.status, cr.comments, cr.created_at, c.title AS course_title, u.first_name, u.last_name
       FROM course_reviews cr JOIN courses c ON c.id = cr.course_id LEFT JOIN users u ON u.id = cr.reviewer_id
       WHERE cr.status IN ('approved','rejected') ORDER BY cr.id DESC LIMIT 8`
    )
    .all() as Array<{ id: number; status: string; comments: string | null; created_at: string; course_title: string; first_name: string | null; last_name: string | null }>;
  const emailStats = db
    .prepare("SELECT status, COUNT(*) AS n FROM email_queue GROUP BY status")
    .all() as Array<{ status: string; n: number }>;
  const auditCount = (db.prepare("SELECT COUNT(*) AS n FROM audit_logs").get() as { n: number }).n;
  const activeSessions = (
    db.prepare("SELECT COUNT(*) AS n FROM app_sessions WHERE expires_at > ?").get(new Date().toISOString()) as { n: number }
  ).n;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="System settings"
        description="Institutional details, certificate signatory, threshold rules, notification behaviour and the Legal Department review workflow."
        actions={<button type="submit" form="settings-form" className="btn btn-primary btn-sm"><Save size={14} /> Save settings</button>}
      />

      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          {saved === "legal" ? "Legal review decision recorded and the instructor notified." : "System settings saved and audit trail updated."}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Audit records" value={auditCount} icon={<ShieldCheck size={18} />} />
        <StatCard label="Active sessions" value={activeSessions} tone="blue" icon={<Lock size={18} />} />
        <StatCard label="Legal items in queue" value={legalCourses.length} tone="gold" icon={<Scale size={18} />} />
        <StatCard label="Simulated emails" value={emailStats.reduce((s, r) => s + r.n, 0)} tone="green" icon={<Bell size={18} />} />
      </div>

      <form id="settings-form" action={saveSettingsAction} className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center gap-2"><Building2 size={16} className="text-brand-700 dark:text-brand-300" /><h2 className="font-display text-[16px] font-bold text-ink">Institution</h2></div>
          <div className="mt-4 space-y-3.5">
            <div>
              <label className="label" htmlFor="institution_name">Institution name</label>
              <input id="institution_name" name="institution_name" defaultValue={settings.institution_name ?? ""} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="institution_short">Short name</label>
              <input id="institution_short" name="institution_short" defaultValue={settings.institution_short ?? "ICPC"} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="support_email">Support email</label>
              <input id="support_email" name="support_email" type="email" defaultValue={settings.support_email ?? ""} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="portal_notice">Portal notice (public)</label>
              <textarea id="portal_notice" name="portal_notice" defaultValue={settings.portal_notice ?? ""} className="textarea min-h-[70px]" />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2"><Award size={16} className="text-brand-700 dark:text-brand-300" /><h2 className="font-display text-[16px] font-bold text-ink">Certificates & CPD</h2></div>
          <div className="mt-4 space-y-3.5">
            <div>
              <label className="label" htmlFor="signatory_name">Certificate signatory</label>
              <input id="signatory_name" name="signatory_name" defaultValue={settings.signatory_name ?? ""} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="signatory_title">Signatory title</label>
              <input id="signatory_title" name="signatory_title" defaultValue={settings.signatory_title ?? ""} className="input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="certificate_prefix">Certificate prefix</label>
                <input id="certificate_prefix" name="certificate_prefix" defaultValue={settings.certificate_prefix ?? "ICPC"} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="annual_cpd_target">Annual CPD target</label>
                <input id="annual_cpd_target" name="annual_cpd_target" type="number" min={0} max={365} defaultValue={settings.annual_cpd_target ?? "40"} className="input" />
              </div>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2"><Settings2 size={16} className="text-brand-700 dark:text-brand-300" /><h2 className="font-display text-[16px] font-bold text-ink">Assessment & security policy</h2></div>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="default_pass_mark">Default pass mark (%)</label>
              <input id="default_pass_mark" name="default_pass_mark" type="number" min={1} max={100} defaultValue={settings.default_pass_mark ?? "60"} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="max_login_attempts">Login attempt limit</label>
              <input id="max_login_attempts" name="max_login_attempts" type="number" min={3} max={10} defaultValue={settings.max_login_attempts ?? "5"} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="lockout_minutes">Lockout duration (minutes)</label>
              <input id="lockout_minutes" name="lockout_minutes" type="number" min={5} max={120} defaultValue={settings.lockout_minutes ?? "15"} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="session_hours">Session lifetime (hours)</label>
              <input id="session_hours" name="session_hours" type="number" min={1} max={72} defaultValue={settings.session_hours ?? "8"} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="retention_years">Record retention (years)</label>
              <input id="retention_years" name="retention_years" type="number" min={1} max={30} defaultValue={settings.retention_years ?? "7"} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="email_mode">Email delivery</label>
              <select id="email_mode" name="email_mode" className="select" defaultValue={settings.email_mode ?? "simulation"}>
                <option value="simulation">Simulation (queued only)</option>
                <option value="smtp">SMTP gateway</option>
              </select>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-2"><Bell size={16} className="text-brand-700 dark:text-brand-300" /><h2 className="font-display text-[16px] font-bold text-ink">Notifications</h2></div>
          <div className="mt-4 space-y-3">
            <label className="flex items-start gap-2.5 rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[12px] text-ink-soft">
              <input type="checkbox" name="email_notifications" value="1" defaultChecked={settings.email_notifications !== "0"} className="mt-0.5 accent-[#16437f]" />
              <span>Send email copies of in-platform notifications (NDPA-conscious delivery)</span>
            </label>
            <div className="rounded-lg border border-line px-3.5 py-3 text-[11px] leading-relaxed text-muted">
              <strong className="text-ink-soft">Email outbox</strong>
              <div className="mt-1 flex flex-wrap gap-2">
                {emailStats.map((e) => <span key={e.status} className="chip chip-gray">{humanStatus(e.status)}: {e.n}</span>)}
                {emailStats.length === 0 && <span>No messages queued.</span>}
              </div>
              <p className="mt-2">Demonstration messages are retained in the outbox for audit; no external mail is sent.</p>
            </div>
            <div className="rounded-lg border border-line px-3.5 py-3 text-[11px] leading-relaxed text-muted">
              <strong className="text-ink-soft">Data protection</strong>
              <p className="mt-1">The portal operates under the Nigeria Data Protection Act 2023. Passwords use scrypt; session cookies are HTTP-only; uploads are type- and size-validated; administrative actions are logged.</p>
            </div>
          </div>
        </section>
      </form>

      <section id="legal" className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 font-display text-[16px] font-bold text-ink"><Scale size={16} className="text-[#2f5da8]" /> Legal Department review</h2>
              <p className="mt-0.5 text-[11.5px] text-muted">Mandatory review for legal, regulatory and ethics content before publication.</p>
            </div>
            <Link href="/instructor/courses" className="btn btn-ghost btn-sm">View courses</Link>
          </div>
        </div>
        {legalCourses.length === 0 ? (
          <p className="px-5 py-8 text-center text-[12.5px] text-muted">No legal content is awaiting review.</p>
        ) : (
          <div className="divide-y divide-line">
            {legalCourses.map((c) => (
              <div key={c.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{c.title}</div>
                    <div className="text-[10.5px] text-muted">
                      {c.category_name} · submitted by {c.first_name ? `${c.first_name} ${c.last_name}` : "system"} · updated {formatDateTime(c.updated_at)}
                    </div>
                  </div>
                  <span className={`chip ${c.legal_review_status === "pending" || c.legal_review_status === "demo_pending" ? "chip-gold" : "chip-red"}`}>{humanStatus(c.legal_review_status)}</span>
                </div>
                <form action={reviewLegalContentAction} className="mt-3 grid gap-2.5 md:grid-cols-[1fr_180px_auto]">
                  <input type="hidden" name="courseId" value={c.id} />
                  <input name="comments" className="input" placeholder="Reviewer comments (recorded on the course review log)" />
                  <select name="decision" className="select" defaultValue="approved">
                    <option value="approved">Approve content</option>
                    <option value="rejected">Reject / request changes</option>
                  </select>
                  <button type="submit" className="btn btn-primary btn-sm">Record decision</button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-5 py-4"><h2 className="font-display text-[16px] font-bold text-ink">Review history</h2></div>
        <div className="divide-y divide-line">
          {reviews.length === 0 && <p className="px-5 py-6 text-[11.5px] text-muted">No completed reviews.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
              <div>
                <div className="text-[12px] font-semibold text-ink">{r.course_title}</div>
                <div className="text-[10.5px] text-muted">{r.comments} · {r.first_name ? `${r.first_name} ${r.last_name}` : "System"}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`chip ${r.status === "approved" ? "chip-green" : "chip-red"}`}>{humanStatus(r.status)}</span>
                <span className="text-[10px] text-muted">{formatDateTime(r.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
