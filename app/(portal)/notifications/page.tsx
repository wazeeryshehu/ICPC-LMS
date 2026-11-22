import Link from "next/link";
import { AlertTriangle, Bell, BellRing, CheckCheck, CheckCircle2, Info, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDateTime, timeAgo } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/lib/actions/account";

export const dynamic = "force-dynamic";

const TONE: Record<string, { icon: React.ReactNode; box: string }> = {
  success: { icon: <CheckCircle2 size={16} />, box: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" },
  warning: { icon: <AlertTriangle size={16} />, box: "bg-gold-50 text-gold-700 dark:bg-gold-900/30 dark:text-gold-200" },
  error: { icon: <AlertTriangle size={16} />, box: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
  info: { icon: <Info size={16} />, box: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200" },
};

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const filter = sp.filter === "unread" ? "unread" : "all";
  const db = getDb();

  const notifications = db
    .prepare(
      `SELECT id, title, body, type, link, is_read, created_at FROM notifications
       WHERE user_id = ? ${filter === "unread" ? "AND is_read = 0" : ""}
       ORDER BY created_at DESC LIMIT 100`
    )
    .all(user.id) as Array<{ id: number; title: string; body: string | null; type: string; link: string | null; is_read: number; created_at: string }>;

  const unread = (
    db.prepare("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0").get(user.id) as { n: number }
  ).n;

  return (
    <div>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="In-platform notifications for course updates, assessment results, certificates, badges and Commission announcements. Email copies are recorded in the demonstration email queue."
        actions={
          unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <button className="btn btn-outline btn-sm"><CheckCheck size={13} /> Mark all read</button>
            </form>
          ) : undefined
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Link href="/notifications" className={`chip ${filter === "all" ? "chip-gold" : "chip-gray"}`}>All</Link>
        <Link href="/notifications?filter=unread" className={`chip ${filter === "unread" ? "chip-gold" : "chip-gray"}`}>
          Unread {unread > 0 ? `(${unread})` : ""}
        </Link>
        <span className="ml-auto flex items-center gap-1.5 text-[10.5px] text-muted"><Mail size={12} /> Email notifications simulated in demo</span>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={filter === "unread" ? <BellRing size={24} /> : <Bell size={24} />}
          title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
          description="Course completions, assessment results and Commission announcements will appear here."
          action={<Link href="/courses" className="btn btn-primary btn-sm">Browse courses</Link>}
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const tone = TONE[n.type] ?? TONE.info;
            return (
              <div key={n.id} className={`card flex items-start gap-3 p-4 ${n.is_read ? "" : "border-l-[3px] border-l-[#2f7cd6]"}`}>
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.box}`}>{tone.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-[13px] ${n.is_read ? "font-medium text-ink-soft" : "font-bold text-ink"}`}>{n.title}</h3>
                    {!n.is_read && <span className="chip chip-gold">New</span>}
                    <span className="ml-auto text-[10px] text-muted" title={formatDateTime(n.created_at)}>{timeAgo(n.created_at)}</span>
                  </div>
                  {n.body && <p className="mt-1 text-[12px] leading-relaxed text-muted">{n.body}</p>}
                  <div className="mt-2 flex items-center gap-3">
                    {n.link && (
                      <form action={markNotificationReadAction}>
                        <input type="hidden" name="id" value={n.id} />
                        <input type="hidden" name="link" value={n.link} />
                        <button type="submit" className="text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-300">
                          Open
                        </button>
                      </form>
                    )}
                    {!n.is_read && (
                      <form action={markNotificationReadAction}>
                        <input type="hidden" name="id" value={n.id} />
                        <input type="hidden" name="link" value="" />
                        <button type="submit" className="text-[11px] font-medium text-muted hover:text-ink">Mark as read</button>
                      </form>
                    )}
                    <span className="text-[10px] text-muted">{formatDateTime(n.created_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
