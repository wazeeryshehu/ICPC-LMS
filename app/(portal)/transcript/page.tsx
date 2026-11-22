import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, gradeFor } from "@/lib/format";
import { IcpcLogo } from "@/components/Logo";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function TranscriptPage() {
  const user = await requireUser();
  const db = getDb();

  const completed = db
    .prepare(
      `SELECT c.title, c.level, cat.name AS category_name, c.cpd_points, c.duration_minutes,
              e.completed_at, ct.cert_no, ct.grade,
              (SELECT MAX(percent) FROM assessment_attempts at JOIN assessments a ON a.id = at.assessment_id
                WHERE a.course_id = c.id AND a.type = 'final_exam' AND at.user_id = e.user_id) AS score
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN course_categories cat ON cat.id = c.category_id
       LEFT JOIN certificates ct ON ct.course_id = c.id AND ct.user_id = e.user_id AND ct.revoked = 0
       WHERE e.user_id = ? AND e.status = 'completed'
       ORDER BY e.completed_at ASC`
    )
    .all(user.id) as Array<{
    title: string;
    level: string;
    category_name: string | null;
    cpd_points: number;
    duration_minutes: number;
    completed_at: string;
    cert_no: string | null;
    grade: string | null;
    score: number | null;
  }>;

  const active = db
    .prepare(
      `SELECT c.title, e.progress_percent FROM enrollments e JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = ? AND e.status != 'completed' ORDER BY e.enrolled_at DESC`
    )
    .all(user.id) as Array<{ title: string; progress_percent: number }>;

  const badgeCount = (
    db.prepare("SELECT COUNT(*) AS n FROM user_badges WHERE user_id = ?").get(user.id) as { n: number }
  ).n;
  const cpdTotal = completed.reduce((sum, c) => sum + c.cpd_points, 0);
  const hours = Math.round(completed.reduce((sum, c) => sum + c.duration_minutes, 0) / 60);
  const avg = completed.length ? Math.round(completed.reduce((s, c) => s + (c.score ?? 0), 0) / completed.length) : 0;
  const ref = `TR-${new Date().getFullYear()}-${String(user.id).padStart(4, "0")}`;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href="/history" className="text-[12px] font-medium text-muted hover:text-ink">← Back to learning history</Link>
        <PrintButton />
      </div>

      <article className="rounded-2xl border border-line bg-white p-6 text-[#101d33] shadow-soft print:border-0 print:shadow-none md:p-10">
        <header className="flex flex-col gap-4 border-b-2 border-[#0b2550] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <IcpcLogo emblem className="h-12 w-auto shrink-0 sm:h-14" />
            <div>
              <div className="font-display text-[17px] font-bold leading-tight text-[#0b2550]">
                Independent Corrupt Practices and Other Related Offences Commission
              </div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#2f5da8]">Digital Learning and Capacity Development Management System</div>
            </div>
          </div>
          <div className="shrink-0 text-[9.5px] leading-relaxed text-[#5a6b82] sm:text-right">
            <div className="font-bold uppercase tracking-wider text-[#0b2550]">Official Training Transcript</div>
            <div>Ref: {ref}</div>
            <div>Issued: {formatDate(new Date())}</div>
          </div>
        </header>

        <section className="mt-5 grid gap-4 text-[11.5px] sm:grid-cols-2">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#2f5da8]">Staff member</div>
            <div className="mt-1 font-display text-[18px] font-bold text-[#101d33]">{user.first_name} {user.last_name}</div>
            <div className="text-[#495a72]">Staff ID: {user.staff_id}</div>
            <div className="text-[#495a72]">{user.email}</div>
            <div className="text-[#495a72]">{user.designation ?? "Staff"} · {user.department_name ?? "ICPC"}</div>
          </div>
          <div className="sm:text-right">
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#2f5da8]">Summary</div>
            <div className="mt-1 text-[#495a72]">Courses completed: <strong className="text-[#101d33]">{completed.length}</strong></div>
            <div className="text-[#495a72]">Learning hours: <strong className="text-[#101d33]">{hours}</strong></div>
            <div className="text-[#495a72]">Average score: <strong className="text-[#101d33]">{avg}%</strong></div>
            <div className="text-[#495a72]">CPD points: <strong className="text-[#101d33]">{cpdTotal}</strong></div>
            <div className="text-[#495a72]">Badges earned: <strong className="text-[#101d33]">{badgeCount}</strong></div>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b2550]">Completed courses and assessments</h2>
          {completed.length === 0 ? (
            <p className="rounded-lg border border-[#dbe3ef] bg-[#f7fafd] px-4 py-4 text-[11.5px] text-[#5a6b82]">
              No courses have been completed yet. This transcript will update automatically as courses are completed and certificates issued.
            </p>
          ) : (
            <table className="w-full border-collapse text-[10.5px]">
              <thead>
                <tr className="bg-[#0b2550] text-left text-white">
                  <th className="border border-[#123a70] px-2.5 py-2 font-semibold">#</th>
                  <th className="border border-[#123a70] px-2.5 py-2 font-semibold">Course</th>
                  <th className="border border-[#123a70] px-2.5 py-2 font-semibold">Category</th>
                  <th className="border border-[#123a70] px-2.5 py-2 font-semibold">Completed</th>
                  <th className="border border-[#123a70] px-2.5 py-2 text-center font-semibold">Score</th>
                  <th className="border border-[#123a70] px-2.5 py-2 text-center font-semibold">Grade</th>
                  <th className="border border-[#123a70] px-2.5 py-2 font-semibold">Certificate No.</th>
                </tr>
              </thead>
              <tbody>
                {completed.map((c, i) => (
                  <tr key={`${c.title}-${i}`} className={i % 2 === 0 ? "bg-white" : "bg-[#f5f8fd]"}>
                    <td className="border border-[#d9e1ec] px-2.5 py-2 text-[#5a6b82]">{i + 1}</td>
                    <td className="border border-[#d9e1ec] px-2.5 py-2 font-semibold text-[#101d33]">{c.title}</td>
                    <td className="border border-[#d9e1ec] px-2.5 py-2 text-[#5a6b82]">{c.category_name ?? "General"}</td>
                    <td className="border border-[#d9e1ec] px-2.5 py-2 text-[#5a6b82]">{formatDate(c.completed_at)}</td>
                    <td className="border border-[#d9e1ec] px-2.5 py-2 text-center font-semibold">{c.score ?? "—"}%</td>
                    <td className="border border-[#d9e1ec] px-2.5 py-2 text-center">{c.grade ?? (c.score !== null ? gradeFor(c.score) : "—")}</td>
                    <td className="border border-[#d9e1ec] px-2.5 py-2 font-mono text-[9.5px]">{c.cert_no ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {active.length > 0 && (
          <section className="mt-5">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b2550]">Courses in progress</h2>
            <table className="w-full border-collapse text-[10.5px]">
              <thead>
                <tr className="bg-[#eef3fa] text-left text-[#5a6b82]">
                  <th className="border border-[#d9e1ec] px-2.5 py-1.5 font-semibold">Course</th>
                  <th className="border border-[#d9e1ec] px-2.5 py-1.5 text-center font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody>
                {active.map((a) => (
                  <tr key={a.title}>
                    <td className="border border-[#d9e1ec] px-2.5 py-1.5">{a.title}</td>
                    <td className="border border-[#d9e1ec] px-2.5 py-1.5 text-center">{a.progress_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <footer className="mt-8 border-t border-[#d9e1ec] pt-4">
          <div className="flex items-end justify-between gap-6">
            <div className="text-[9px] leading-relaxed text-[#5a6b82]">
              <div>This transcript is generated from the ICPC Learning Management System.</div>
              <div>Certificates may be verified at the public verification service using the certificate number.</div>
              <div className="mt-2 font-semibold text-[#101d33]">Demonstration environment — records are fictitious.</div>
            </div>
            <div className="w-48 shrink-0 border-t border-[#101d33] pt-1 text-center text-[9px]">
              <div className="font-semibold text-[#101d33]">Authorised Officer</div>
              <div className="text-[#5a6b82]">Training and Development</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[8.5px] text-[#8997ab]">
            <span>Ref: {ref} · Generated {formatDate(new Date(), true)}</span>
            <span>ICPC Digital Learning and Capacity Development Management System</span>
          </div>
        </footer>
      </article>
    </div>
  );
}
