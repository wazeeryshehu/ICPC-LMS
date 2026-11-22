import Link from "next/link";
import { Megaphone, Pin, Send, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime, humanStatus } from "@/lib/format";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import { EmptyState, PageHeader } from "@/components/ui";
import { createAnnouncementAction, deleteAnnouncementAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

const AUDIENCE_LABELS: Record<string, string> = {
  all: "All staff",
  instructor: "Course instructors",
  coordinator: "Departmental coordinators",
  learner: "Staff learners",
  management: "Management / executives",
  training_admin: "Training administrators",
};

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  await requireUser(["super_admin", "training_admin"]);
  const { saved, deleted, error } = await searchParams;
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT a.id, a.title, a.body, a.audience, a.pinned, a.published_at, u.first_name, u.last_name
       FROM announcements a LEFT JOIN users u ON u.id = a.created_by
       ORDER BY a.pinned DESC, a.published_at DESC LIMIT 30`
    )
    .all() as Array<{
    id: number;
    title: string;
    body: string;
    audience: string;
    pinned: number;
    published_at: string;
    first_name: string | null;
    last_name: string | null;
  }>;
  const recipients = (audience: string) =>
    (
      db
        .prepare(`SELECT COUNT(*) AS n FROM users WHERE status = 'active' ${audience === "all" ? "" : "AND role = ?"}`)
        .get(...(audience === "all" ? [] : [audience])) as { n: number }
    ).n;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communications"
        title="Announcements"
        description="Publish institution-wide or role-targeted announcements. Each recipient receives an in-platform notification and a simulated email."
        actions={<Link href="/notifications" className="btn btn-outline btn-sm"><Megaphone size={14} /> My notifications</Link>}
      />

      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          Announcement published and delivered to the selected audience.
        </div>
      )}
      {deleted && (
        <div className="rounded-xl border border-line bg-panel-2 px-4 py-3 text-[12.5px] text-muted">Announcement deleted.</div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Provide a title and a message of at least 10 characters.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="space-y-3">
          {rows.length === 0 && <EmptyState icon={<Megaphone size={24} />} title="No announcements yet" description="Publish the first announcement using the form." />}
          {rows.map((a) => (
            <article key={a.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {a.pinned ? <span className="chip chip-gold"><Pin size={10} /> Pinned</span> : null}
                  <span className="chip chip-blue">{AUDIENCE_LABELS[a.audience] ?? humanStatus(a.audience)}</span>
                  <span className="text-[10.5px] text-muted">{formatDateTime(a.published_at)}</span>
                </div>
                <form action={deleteAnnouncementAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="btn btn-ghost btn-sm text-red-600 dark:text-red-300"><Trash2 size={13} /></button>
                </form>
              </div>
              <h2 className="mt-2 font-display text-[16px] font-bold text-ink">{a.title}</h2>
              <p className="mt-1.5 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-soft">{a.body}</p>
              <div className="mt-2.5 border-t border-line pt-2 text-[10.5px] text-muted">
                Published by {a.first_name ? `${a.first_name} ${a.last_name}` : "System"} · {recipients(a.audience)} recipients
              </div>
            </article>
          ))}
        </section>

        <section className="card h-fit p-5">
          <div className="flex items-center gap-2"><Send size={15} className="text-brand-700 dark:text-brand-300" /><h2 className="font-display text-[16px] font-bold text-ink">New announcement</h2></div>
          <form action={createAnnouncementAction} className="mt-4 space-y-3">
            <div>
              <label className="label">Title</label>
              <input name="title" className="input" required placeholder="e.g. Q4 mandatory training window" />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea name="body" className="textarea min-h-[150px]" required placeholder="Announcement details…" />
            </div>
            <div>
              <label className="label">Audience</label>
              <select name="audience" className="select" defaultValue="all">
                <option value="all">All staff</option>
                <option value="instructor">Course instructors</option>
                <option value="coordinator">Departmental coordinators</option>
                <option value="learner">Staff learners</option>
                <option value="management">Management / executives</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-ink-soft">
              <input type="checkbox" name="pinned" className="accent-[#16437f]" /> Pin to the top
            </label>
            <button type="submit" className="btn btn-primary w-full"><Send size={14} /> Publish announcement</button>
            <p className="text-[10px] leading-relaxed text-muted">
              Email delivery is simulated in this demonstration. In production, announcements are queued through the Commission SMTP gateway.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
