import Link from "next/link";
import { Award, BadgeCheck, Download, ExternalLink, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, fullName } from "@/lib/format";
import { EmptyState, PageHeader, StatCard } from "@/components/ui";
import { IcpcLogo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const user = await requireUser();
  const db = getDb();

  const certs = db
    .prepare(
      `SELECT ct.id, ct.cert_no, ct.final_score, ct.grade, ct.issued_at, c.title, c.slug, c.cpd_points,
              cat.name AS category_name,
              (SELECT MAX(percent) FROM assessment_attempts at JOIN assessments a ON a.id = at.assessment_id
                WHERE a.course_id = c.id AND at.user_id = ct.user_id) AS best_score
       FROM certificates ct
       JOIN courses c ON c.id = ct.course_id
       LEFT JOIN course_categories cat ON cat.id = c.category_id
       WHERE ct.user_id = ? AND ct.revoked = 0 ORDER BY ct.issued_at DESC`
    )
    .all(user.id) as Array<{
    id: number;
    cert_no: string;
    final_score: number;
    grade: string;
    issued_at: string;
    title: string;
    slug: string;
    cpd_points: number;
    category_name: string | null;
    best_score: number | null;
  }>;

  const cpdTotal = certs.reduce((sum, c) => sum + c.cpd_points, 0);
  const distinctions = certs.filter((c) => c.grade === "Distinction").length;

  return (
    <div>
      <PageHeader
        eyebrow="Credentials"
        title="My Certificates"
        description="Certificates of completion issued by the Commission. Each certificate carries a unique number and a QR code for independent verification."
        actions={<Link href="/verify" className="btn btn-outline btn-sm"><ShieldCheck size={13} /> Public verification</Link>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Certificates issued" value={certs.length} sub="Valid credentials" icon={<Award size={18} />} />
        <StatCard label="CPD points earned" value={cpdTotal} sub="Across certified courses" icon={<Sparkles size={18} />} tone="gold" />
        <StatCard label="Distinctions" value={distinctions} sub="85% and above" icon={<BadgeCheck size={18} />} tone="blue" />
      </div>

      {certs.length === 0 ? (
        <EmptyState
          icon={<Award size={26} />}
          title="No certificates yet"
          description="Complete all lessons and pass the final examination of a course to earn a verifiable ICPC certificate."
          action={<Link href="/courses" className="btn btn-primary btn-sm">Browse courses</Link>}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {certs.map((cert) => (
            <article key={cert.id} className="card overflow-hidden">
              <div className="relative border-b-[3px] border-gold-500 bg-[#0b2550] px-5 py-5 text-white">
                <div className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white p-1 shadow-sm ring-1 ring-white/40">
                  <IcpcLogo emblem className="h-full w-auto" />
                </div>
                <div className="pr-12 text-[9px] font-bold uppercase tracking-[0.2em] text-[#8fc0f5]">Independent Corrupt Practices and Other Related Offences Commission</div>
                <div className="mt-1 font-display text-[17px] font-bold tracking-wide">CERTIFICATE OF COMPLETION</div>
                <p className="mt-3 text-[11px] text-white/55">This is to certify that</p>
                <div className="font-display text-[20px] font-bold leading-tight">
                  {fullName(user.first_name, user.last_name, user.middle_name)}
                </div>
                <p className="mt-1 text-[11px] text-white/55">has successfully completed</p>
                <h2 className="mt-0.5 text-[13.5px] font-semibold leading-snug text-[#cfe2fb]">{cert.title}</h2>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 text-[11.5px] sm:grid-cols-4">
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-muted">Score</div>
                    <div className="mt-0.5 font-display text-[15px] font-bold text-ink">{cert.final_score}%</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-muted">Grade</div>
                    <div className="mt-0.5 text-[12px] font-semibold text-ink">{cert.grade}</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-muted">Issued</div>
                    <div className="mt-0.5 text-[12px] font-semibold text-ink">{formatDate(cert.issued_at)}</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-muted">CPD</div>
                    <div className="mt-0.5 text-[12px] font-semibold text-ink">{cert.cpd_points} points</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2">
                  <QrCode size={18} className="shrink-0 text-brand-700 dark:text-brand-300" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-muted">Certificate number</div>
                    <div className="truncate font-mono text-[11.5px] font-semibold text-ink">{cert.cert_no}</div>
                  </div>
                  <span className="chip chip-green"><BadgeCheck size={10} /> Valid</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={`/api/certificates/${cert.cert_no}/pdf`} className="btn btn-primary btn-sm">
                    <Download size={13} /> Download PDF
                  </a>
                  <Link href={`/verify/${cert.cert_no}`} className="btn btn-outline btn-sm">
                    <ExternalLink size={12} /> Verification page
                  </Link>
                  <Link href={`/courses/${cert.slug}`} className="btn btn-ghost btn-sm">Course</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-[11px] leading-relaxed text-gold-900 dark:border-gold-900/40 dark:bg-gold-900/20 dark:text-gold-100">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        <span>
          <strong>Verification.</strong> Employers and third parties can scan the QR code on any certificate or visit the public verification page and enter the certificate number. Certificates remain verifiable even after revocation, in which case the revocation status is displayed.
        </span>
      </div>
    </div>
  );
}
