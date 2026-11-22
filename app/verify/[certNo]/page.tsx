import { getSessionUser } from "@/lib/auth";
import { HOME_BY_ROLE } from "@/lib/rbac";
import { PublicHeader } from "@/components/PublicHeader";
import { CertificateVerify } from "@/components/CertificateVerify";
import { getVerificationRecord } from "@/lib/verification";
import { IcpcLogo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function VerifyCertificatePage({ params }: { params: Promise<{ certNo: string }> }) {
  const { certNo } = await params;
  const record = getVerificationRecord(decodeURIComponent(certNo));
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-surface">
      <PublicHeader isAuthed={!!user} homeHref={user ? HOME_BY_ROLE[user.role] : "/login"} />
      <main className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-line">
            <IcpcLogo emblem className="h-full w-auto" />
          </div>
          <div className="mt-3 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#2f5da8] dark:text-[#6fa8e8]">
            ICPC certificate verification
          </div>
          <h1 className="mt-1 font-display text-[25px] font-bold text-ink md:text-[29px]">Verification result</h1>
          <p className="mt-1 font-mono text-[12px] text-muted">{decodeURIComponent(certNo)}</p>
        </div>
        <CertificateVerify record={record} />
      </main>
    </div>
  );
}
