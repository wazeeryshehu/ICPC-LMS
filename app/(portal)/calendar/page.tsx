import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users, Video, CheckCircle2, BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageHeader, ProgressBar } from "@/components/ui";
import { toggleSessionRegistrationAction } from "@/lib/actions/learning";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await requireUser();
  const db = getDb();
  const now = new Date().toISOString();

  const sessions = db
    .prepare(
      `SELECT ts.*, c.slug AS course_slug, c.title AS course_title,
              (SELECT COUNT(*) FROM session_registrations sr WHERE sr.session_id = ts.id) AS taken,
              EXISTS(SELECT 1 FROM session_registrations sr WHERE sr.session_id = ts.id AND sr.user_id = ?) AS registered
       FROM training_sessions ts LEFT JOIN courses c ON c.id = ts.course_id
       ORDER BY ts.starts_at ASC`
    )
    .all(user.id) as Array<{
    id: number;
    title: string;
    description: string | null;
    modality: string;
    venue: string | null;
    starts_at: string;
    ends_at: string;
    capacity: number;
    taken: number;
    registered: number;
    course_slug: string | null;
    course_title: string | null;
  }>;

  const upcoming = sessions.filter((s) => s.ends_at >= now);
  const past = sessions.filter((s) => s.ends_at < now).reverse();

  return (
    <div>
      <PageHeader
        eyebrow="Scheduled learning"
        title="Training Calendar"
        description="Commission training sessions, clinics and workshops. Register to reserve a place; capacity is limited and registrations are recorded against your staff record."
        actions={<Link href="/courses" className="btn btn-primary btn-sm"><BookOpen size={13} /> Course catalogue</Link>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Upcoming sessions</div>
          <div className="mt-1 font-display text-[24px] font-bold text-ink">{upcoming.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">My registrations</div>
          <div className="mt-1 font-display text-[24px] font-bold text-ink">{sessions.filter((s) => s.registered && s.ends_at >= now).length}</div>
        </div>
        <div className="card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Sessions attended</div>
          <div className="mt-1 font-display text-[24px] font-bold text-ink">{sessions.filter((s) => s.registered && s.ends_at < now).length}</div>
        </div>
      </div>

      <h2 className="mb-3 font-display text-[17px] font-bold text-ink">Upcoming sessions</h2>
      {upcoming.length === 0 ? (
        <div className="card p-8 text-center text-[12.5px] text-muted">No upcoming training sessions are scheduled.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {upcoming.map((s) => {
            const full = s.taken >= s.capacity;
            return (
              <div key={s.id} className="card overflow-hidden">
                <div className="flex items-start gap-3 border-b border-line bg-panel-2 px-4 py-3">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-800 text-white">
                    <span className="text-[8px] font-bold uppercase leading-none">{new Date(s.starts_at).toLocaleDateString("en-NG", { month: "short" })}</span>
                    <span className="font-display text-[15px] font-bold leading-tight">{new Date(s.starts_at).getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`chip ${s.modality === "virtual" ? "chip-blue" : "chip-green"}`}>
                        {s.modality === "virtual" ? <Video size={10} /> : <MapPin size={10} />} {s.modality}
                      </span>
                      {s.registered ? <span className="chip chip-green"><CheckCircle2 size={10} /> Registered</span> : null}
                      {full && !s.registered ? <span className="chip chip-red">Full</span> : null}
                    </div>
                    <h3 className="mt-1 font-display text-[14.5px] font-bold leading-snug text-ink">{s.title}</h3>
                  </div>
                </div>
                <div className="p-4">
                  {s.description && <p className="text-[11.5px] leading-relaxed text-muted">{s.description}</p>}
                  <div className="mt-3 space-y-1.5 text-[11px] text-ink-soft">
                    <div className="flex items-center gap-1.5"><CalendarDays size={12} className="text-muted" /> {formatDate(s.starts_at, true)} – {formatDate(s.ends_at, true)}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={12} className="text-muted" /> {s.venue ?? "Venue to be confirmed"}</div>
                    <div className="flex items-center gap-1.5"><Users size={12} className="text-muted" /> {s.taken}/{s.capacity} registered</div>
                  </div>
                  <div className="mt-2"><ProgressBar value={s.capacity ? (s.taken / s.capacity) * 100 : 0} /></div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <form action={toggleSessionRegistrationAction}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <button
                        className={`btn btn-sm ${s.registered ? "btn-outline" : "btn-primary"}`}
                        disabled={!s.registered && full}
                      >
                        {s.registered ? "Cancel registration" : full ? "Session full" : "Register"}
                      </button>
                    </form>
                    {s.course_slug && (
                      <Link href={`/courses/${s.course_slug}`} className="btn btn-ghost btn-sm">
                        <BookOpen size={12} /> Related course
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mb-3 mt-7 font-display text-[17px] font-bold text-ink">Past sessions</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table min-w-[600px]">
                <thead>
                  <tr><th>Session</th><th>Date</th><th>Modality</th><th>Venue</th><th>Attendance</th></tr>
                </thead>
                <tbody>
                  {past.map((s) => (
                    <tr key={s.id}>
                      <td className="font-semibold text-ink">{s.title}</td>
                      <td className="text-[11px] text-muted">{formatDate(s.starts_at, true)}</td>
                      <td className="text-[11px] capitalize text-muted">{s.modality}</td>
                      <td className="text-[11px] text-muted">{s.venue ?? "—"}</td>
                      <td>{s.registered ? <span className="chip chip-green">Registered</span> : <span className="chip chip-gray">Not registered</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-panel-2 px-4 py-3 text-[11px] text-muted">
        <Clock size={13} className="shrink-0" />
        Registration closes when capacity is reached. Contact the Training and Development Unit for session changes.
      </div>
    </div>
  );
}
