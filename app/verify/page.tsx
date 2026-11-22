import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { HOME_BY_ROLE } from "@/lib/rbac";
import { PublicHeader } from "@/components/PublicHeader";
import { CertificateVerify } from "@/components/CertificateVerify";
import { getVerificationRecord } from "@/lib/verification";
import { IcpcLogo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ cert?: string }> }) {
  const sp = await searchParams;
  const certNo = sp.cert?.trim() ?? "";
  if (certNo) redirect(`/verify/${encodeURIComponent(certNo)}`);

  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-surface">
      <PublicHeader isAuthed={!!user} homeHref={user ? HOME_BY_ROLE[user.role] : "/login"} />
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-line">
            <IcpcLogo emblem className="h-full w-auto" />
          </div>
          <div className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#2f5da8] dark:text-[#6fa8e8]">
            Public service
          </div>
          <h1 className="mt-1 font-display text-[28px] font-bold text-ink md:text-[34px]">Certificate Verification</h1>
          <p className="mx-auto mt-2 max-w-xl text-[13px] leading-relaxed text-muted">
            Verify the authenticity of a certificate issued through the ICPC Digital Learning and Capacity Development Management System.
            Enter the certificate number exactly as printed, or scan the QR code on the certificate.
          </p>
        </div>

        <div className="card mx-auto mt-7 max-w-xl p-5">
          <form method="get" className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                name="cert"
                required
                placeholder="e.g. ICPC-2026-00001"
                className="input pl-9 font-mono uppercase"
                autoComplete="off"
              />
            </div>
            <button className="btn btn-primary">Verify certificate</button>
          </form>
          <p className="mt-2 text-[10.5px] text-muted">
            Certificate numbers are not case-sensitive. Demonstration certificates are fictitious.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-xl rounded-xl border border-line bg-panel-2 px-4 py-3 text-[11px] leading-relaxed text-muted">
          <strong className="text-ink">For employers and institutions.</strong> A verified certificate confirms the holder completed the named course
          and attained the stated score. Revoked certificates are also displayed with their revocation status for transparency.
        </div>

        <div className="mt-8 text-center text-[11.5px] text-muted">
          Need help? Contact <a href="mailto:lms.support@icpc.gov.ng" className="text-brand-700 underline dark:text-brand-300">lms.support@icpc.gov.ng</a> ·{" "}
          <Link href="/" className="text-brand-700 underline dark:text-brand-300">Return to portal</Link>
        </div>
      </main>
    </div>
  );
}
