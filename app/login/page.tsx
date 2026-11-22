import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { IcpcLogo, LogoPlate } from "@/components/Logo";
import { LoginForm } from "@/components/AuthForms";
import { getSessionUser } from "@/lib/auth";
import { HOME_BY_ROLE } from "@/lib/rbac";

export const metadata = { title: "Staff Sign In" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect(HOME_BY_ROLE[user.role]);
  const params = await searchParams;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="hero-bg relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #a9ccf5 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative">
          <Link href="/" className="inline-flex flex-col gap-2">
            <LogoPlate imageClassName="h-10 w-auto" className="px-3 py-2" />
            <span className="text-[10px] uppercase tracking-[0.14em] text-white/60">
              Digital Learning &amp; Capacity Development
            </span>
          </Link>
        </div>

        <div className="relative max-w-lg">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2f7cd6]/40 bg-[#2f7cd6]/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#a9ccf5]">
            <ShieldCheck size={13} /> Official staff access
          </div>
          <h1 className="font-display text-[40px] font-bold leading-[1.12] text-white xl:text-[46px]">
            Learn. Certify.<br />Strengthen integrity.
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-white/70">
            The Commission&apos;s central digital learning, capacity development and professional
            certification portal for staff across all departments, directorates and offices.
          </p>
          <div className="mt-7 space-y-3 text-[12.5px] text-white/75">
            {[
              "Sign in with your Staff ID or official email and password.",
              "Complete mandatory, departmental and professional development courses.",
              "Earn verifiable certificates, digital badges and CPD records.",
            ].map((line) => (
              <div key={line} className="flex items-start gap-2.5">
                <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#2f7cd6]/20 text-[#8fc0f5]">
                  <ShieldCheck size={10} />
                </span>
                {line}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[10.5px] leading-relaxed text-white/35">
          Demonstration environment · Fictitious staff records · Data persists in the institutional learning database
        </div>
      </div>

      <div className="flex items-center justify-center bg-surface px-4 py-10 sm:px-8">
        <div className="w-full max-w-[430px]">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted hover:text-ink">
              <ArrowLeft size={14} /> Portal home
            </Link>
            <Link href="/verify" className="text-[11.5px] font-semibold text-brand-700 hover:underline dark:text-brand-300">
              Verify certificate
            </Link>
          </div>

          <div className="mb-6 lg:hidden">
            <IcpcLogo className="h-10 w-auto" />
            <div className="mt-1.5 text-[9px] uppercase tracking-[0.1em] text-muted">Digital Learning Portal</div>
          </div>

          <div className="card p-6 sm:p-7">
            <h2 className="font-display text-[23px] font-bold text-ink">Staff sign in</h2>
            <p className="mb-5 mt-1 text-[12px] leading-relaxed text-muted">
              Sign in with your Staff ID or official ICPC email address, plus your password.
            </p>
            {params.reset === "1" && (
              <div role="status" className="mb-4 flex items-start gap-2 rounded-lg border border-[#2f7cd6]/30 bg-[#eef6ff] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#14406e] dark:border-[#2f7cd6]/30 dark:bg-[#0d2f52] dark:text-[#bfe0ff]">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                <span>Your password has been reset. Sign in with your new password.</span>
              </div>
            )}
            <LoginForm next={params.next} />
          </div>

          <p className="mt-4 text-center text-[10.5px] leading-relaxed text-muted">
            {process.env.NODE_ENV !== "production"
              ? "Staff activation is available for new officers pre-registered by the Training and Development Unit."
              : "Account activation is handled by the Training and Development Unit."}
            <br />Protected by role-based access control and audited sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
