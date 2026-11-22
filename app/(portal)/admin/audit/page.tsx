import Link from "next/link";
import { Search, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime, humanStatus } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string; from?: string; to?: string; page?: string }>;
}) {
  await requireUser(["super_admin", "training_admin"]);
  const p = await searchParams;
  const db = getDb();
  const q = (p.q ?? "").trim();
  const action = p.action ?? "";
  const from = p.from ?? "";
  const to = p.to ?? "";
  const page = Math.max(1, Number(p.page) || 1);

  const where: string[] = ["1=1"];
  const args: Array<string | number> = [];
  if (q) {
    where.push("(actor_name LIKE ? OR details LIKE ? OR entity_id LIKE ? OR ip LIKE ?)");
    const like = `%${q}%`;
    args.push(like, like, like, like);
  }
  if (action) {
    where.push("action = ?");
    args.push(action);
  }
  if (from) {
    where.push("created_at >= ?");
    args.push(`${from}T00:00:00.000Z`);
  }
  if (to) {
    where.push("created_at <= ?");
    args.push(`${to}T23:59:59.999Z`);
  }
  const clause = `WHERE ${where.join(" AND ")}`;

  const total = (db.prepare(`SELECT COUNT(*) AS n FROM audit_logs ${clause}`).get(...args) as { n: number }).n;
  const rows = db
    .prepare(`SELECT * FROM audit_logs ${clause} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(...args, PAGE_SIZE, (page - 1) * PAGE_SIZE) as Array<{
    id: number;
    actor_id: number | null;
    actor_name: string | null;
    action: string;
    entity: string | null;
    entity_id: string | null;
    details: string | null;
    ip: string | null;
    created_at: string;
  }>;
  const actions = db.prepare("SELECT DISTINCT action FROM audit_logs ORDER BY action").all() as Array<{ action: string }>;
  const today = (db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE created_at >= ?").get(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`) as { n: number }).n;
  const signIns = (db.prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'auth.login'").get() as { n: number }).n;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (action) params.set("action", action);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(nextPage));
    return `/admin/audit?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Assurance"
        title="Audit logs"
        description="Immutable record of authentication, administrative, course, assessment and certificate events. Retained per the Commission's records policy."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Audit events" value={total.toLocaleString("en-NG")} sub="Matching filters" icon={<ShieldCheck size={18} />} />
        <StatCard label="Events today" value={today} tone="green" />
        <StatCard label="Recorded sign-ins" value={signIns} tone="blue" />
      </div>

      <form method="get" className="card grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="xl:col-span-2">
          <label className="label" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={q} className="input" placeholder="Actor, details, entity or IP" />
        </div>
        <div className="xl:col-span-2">
          <label className="label" htmlFor="action">Action</label>
          <select id="action" name="action" className="select" defaultValue={action}>
            <option value="">All actions</option>
            {actions.map((a) => <option key={a.action} value={a.action}>{humanStatus(a.action)}</option>)}
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
        <div className="flex items-end gap-2 xl:col-span-6">
          <button type="submit" className="btn btn-primary btn-sm"><Search size={14} /> Apply filters</button>
          <Link href="/admin/audit" className="btn btn-ghost btn-sm">Reset</Link>
        </div>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr><th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th><th>IP</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap text-[10.5px] text-muted">{formatDateTime(r.created_at)}</td>
                  <td className="text-[11.5px]">{r.actor_name ?? <span className="text-muted">System</span>}{r.actor_id ? <div className="text-[9.5px] text-muted">User #{r.actor_id}</div> : null}</td>
                  <td><span className="chip chip-gray">{humanStatus(r.action)}</span></td>
                  <td className="text-[10.5px] text-muted">{r.entity ?? "—"}{r.entity_id ? ` #${r.entity_id}` : ""}</td>
                  <td className="max-w-[380px] text-[11px] text-ink-soft">{r.details ?? "—"}</td>
                  <td className="text-[10px] text-muted">{r.ip ?? "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[12.5px] text-muted">No audit events match the filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-[11px] text-muted">
          <span>Page {page} of {pages} · {total.toLocaleString("en-NG")} events</span>
          <div className="flex gap-2">
            {page > 1 ? <Link href={qs(page - 1)} className="btn btn-outline btn-sm">Previous</Link> : <span className="btn btn-outline btn-sm pointer-events-none opacity-40">Previous</span>}
            {page < pages ? <Link href={qs(page + 1)} className="btn btn-outline btn-sm">Next</Link> : <span className="btn btn-outline btn-sm pointer-events-none opacity-40">Next</span>}
          </div>
        </div>
      </div>

      <p className="text-[10.5px] leading-relaxed text-muted">
        Audit logs are append-only and never include password content. Demonstration environment: IP addresses and staff records are fictitious.
      </p>
    </div>
  );
}
