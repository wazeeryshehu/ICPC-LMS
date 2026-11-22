import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { IcpcLogo, LogoPlate } from "@/components/Logo";
import { ActivateForm } from "@/components/AuthForms";
import { getSessionUser } from "@/lib/auth";
import { HOME_BY_ROLE } from "@/lib/rbac";

export const metadata = { title: "Staff Account Activation" };
export const dynamic = "force-dynamic";

export default async function ActivatePage() {
  const user = await getSessionUser();
  if (user) redirect(HOME_BY_ROLE[user.role]);
  const selfActivationEnabled =
    process.env.NODE_ENV !== "production" || process.env.ALLOW_SELF_ACTIVATION === "true";

  return (
    <div className="grid min-h-screen lg:grid-cols-[0.85fr_1fr]">
      <div className="hero-bg relative hidden flex-col justify-between p-10 text-white lg:flex xl:p-14">
        <Link href="/" className="inline-flex flex-col gap-2">
          <LogoPlate imageClassName="h-9 w-auto" className="px-3 py-2" />
          <span className="text-[10px] uppercase tracking-[0.12em] text-white/55">Digital Learning Portal</span>
        </Link>
        <div className="max-w-md">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2f7cd6]/40 bg-[#2f7cd6]/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#a9ccf5]">
            <Sparkles size={13} /> New officer onboarding
          </div>
          <h1 className="font-display text-[36px] font-bold leading-tight">
            Activate your institutional learning profile.
          </h1>
          <p className="mt-4 text-[13.5px] leading-relaxed text-white/70">
            Your Staff ID and official ICPC email are the keys to your learning record. Activation
            links your profile to your department, training assignments, certificates and CPD history.
          </p>
          <div className="mt-8 grid gap-3 text-[12px]">
            <div className="flex items-start gap-2.5 text-white/75">
              <GraduationCap size={16} className="mt-0.5 text-[#8fc0f5]" />
              Enrol in mandatory, departmental and professional development programmes.
            </div>
            <div className="flex items-start gap-2.5 text-white/75">
              <ShieldCheck size={16} className="mt-0.5 text-[#8fc0f5]" />
              Your Staff ID and email pair is verified against the official staff register.
            </div>
          </div>
        </div>
        <div className="text-[10.5px] text-white/35">Demonstration environment · Fictitious staff records</div>
      </div>

      <div className="flex items-center justify-center bg-surface px-4 py-10 sm:px-8">
        <div className="w-full max-w-[540px]">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted hover:text-ink">
              <ArrowLeft size={14} /> Portal home
            </Link>
            <Link href="/login" className="text-[11.5px] font-semibold text-brand-700 hover:underline dark:text-brand-300">
              Back to sign in
            </Link>
          </div>
          <div className="mb-6 lg:hidden">
            <IcpcLogo className="h-10 w-auto" />
            <div className="mt-1.5 text-[9px] uppercase tracking-[0.1em] text-muted">Digital Learning Portal</div>
          </div>
          <div className="card p-6 sm:p-7">
            <h2 className="font-display text-[23px] font-bold text-ink">Activate your staff account</h2>
            <p className="mb-5 mt-1 text-[12px] leading-relaxed text-muted">
              Use the Staff ID and official email assigned to you by the Training and Development Unit.
            </p>
            {selfActivationEnabled ? (
              <ActivateForm />
            ) : (
              <div className="flex items-start gap-2.5 rounded-lg border border-line bg-surface-2/60 px-3.5 py-3 text-[12px] leading-relaxed text-muted">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <span>
                  Self-service activation is disabled on this deployment. Contact the Training and
                  Development Unit so they can activate your account and issue a temporary password.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
