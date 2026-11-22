import Link from "next/link";
import { Award, BadgeCheck, CalendarDays, CheckCircle2, GraduationCap, ShieldAlert, ShieldCheck, UserRound, XCircle } from "lucide-react";
import { formatDate } from "@/lib/format";
import { IcpcLogo } from "@/components/Logo";

export interface VerificationRecord {
  certNo: string;
  learnerName: string;
  staffId: string;
  courseTitle: string;
  category: string | null;
  score: number;
  grade: string;
  issuedAt: string;
  revoked: number;
  revokedReason: string | null;
  cpdPoints: number;
}

export function CertificateVerify({ record }: { record: VerificationRecord | null }) {
  if (!record) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
          <XCircle size={26} />
        </div>
        <h2 className="mt-3 font-display text-[19px] font-bold text-ink">Certificate not found</h2>
        <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-relaxed text-muted">
          No certificate matches that number. Check the number carefully (format: ICPC-YYYY-XXXXXX) and try again, or contact{" "}
          <a href="mailto:lms.support@icpc.gov.ng" className="text-brand-700 underline dark:text-brand-300">lms.support@icpc.gov.ng</a>.
        </p>
        <Link href="/verify" className="btn btn-outline btn-sm mt-4">Try another number</Link>
      </div>
    );
  }

  const revoked = record.revoked === 1;

  return (
    <div className="space-y-4">
      <div className={`overflow-hidden rounded-2xl border-2 ${revoked ? "border-red-300 dark:border-red-900" : "border-green-300 dark:border-green-900"} bg-panel`}>
        <div className={`px-5 py-4 text-white ${revoked ? "bg-[#5f1d1d]" : "bg-[#0b2550]"}`}>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
            <ShieldCheck size={13} /> ICPC Certificate Verification Service
            <span className="ml-auto flex h-9 w-9 items-center justify-center rounded-md bg-white p-0.5 shadow-sm">
              <IcpcLogo emblem className="h-full w-auto" />
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            {revoked ? <ShieldAlert size={24} /> : <BadgeCheck size={26} className="text-[#8fc0f5]" />}
            <div>
              <div className="font-display text-[19px] font-bold leading-tight">{revoked ? "Certificate revoked" : "Certificate verified"}</div>
              <div className="text-[11px] text-white/60">
                {revoked ? "This certificate is no longer valid." : "This certificate was issued by the ICPC Digital Learning Portal."}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          {revoked && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] leading-relaxed text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100">
              <strong>Revocation reason:</strong> {record.revokedReason ?? "Not specified"}. Please contact the Commission if you believe this is an error.
            </div>
          )}

          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-[9.5px] font-bold uppercase tracking-wider text-muted">Awarded to</dt>
              <dd className="mt-0.5 flex items-center gap-2 font-display text-[18px] font-bold text-ink">
                <UserRound size={16} className="text-brand-700 dark:text-brand-300" /> {record.learnerName}
              </dd>
              <dd className="text-[11px] text-muted">Staff ID {record.staffId}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[9.5px] font-bold uppercase tracking-wider text-muted">Course completed</dt>
              <dd className="mt-0.5 flex items-start gap-2 text-[13.5px] font-semibold leading-snug text-ink">
                <GraduationCap size={16} className="mt-0.5 shrink-0 text-brand-700 dark:text-brand-300" /> {record.courseTitle}
              </dd>
              {record.category && <dd className="text-[11px] text-muted">{record.category}</dd>}
            </div>
            <div>
              <dt className="text-[9.5px] font-bold uppercase tracking-wider text-muted">Final score</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" /> {record.score}% · {record.grade}
              </dd>
            </div>
            <div>
              <dt className="text-[9.5px] font-bold uppercase tracking-wider text-muted">CPD points</dt>
              <dd className="mt-0.5 text-[13px] font-semibold text-ink">{record.cpdPoints}</dd>
            </div>
            <div>
              <dt className="text-[9.5px] font-bold uppercase tracking-wider text-muted">Certificate number</dt>
              <dd className="mt-0.5 font-mono text-[12px] font-semibold text-ink">{record.certNo}</dd>
            </div>
            <div>
              <dt className="text-[9.5px] font-bold uppercase tracking-wider text-muted">Date issued</dt>
              <dd className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                <CalendarDays size={13} /> {formatDate(record.issuedAt)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-[10.5px] leading-relaxed text-muted">
            <Award size={14} className="mt-0.5 shrink-0" />
            <span>
              This verification confirms the certificate details held in the ICPC Learning Management System as at the time of checking. For further authentication, contact the Commission quoting the certificate number above.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/verify" className="btn btn-outline btn-sm">Verify another certificate</Link>
        <Link href="/" className="btn btn-ghost btn-sm">ICPC portal home</Link>
      </div>
    </div>
  );
}
