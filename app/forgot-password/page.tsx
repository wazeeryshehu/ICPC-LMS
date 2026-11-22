import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { ForgotPasswordForm } from "@/components/AuthForms";
import { IcpcLogo } from "@/components/Logo";
import { getSessionUser } from "@/lib/auth";
import { HOME_BY_ROLE } from "@/lib/rbac";

export const metadata = { title: "Reset Password" };
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const user = await getSessionUser();
  if (user) redirect(HOME_BY_ROLE[user.role]);

  return (
    <div className="min-h-screen bg-surface">
      <PublicHeader isAuthed={false} homeHref="/login" />
      <main className="mx-auto max-w-lg px-4 py-10 md:py-14">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-line">
            <IcpcLogo emblem className="h-full w-auto" />
          </div>
          <div className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#2f5da8] dark:text-[#6fa8e8]">
            Account recovery
          </div>
          <h1 className="mt-1 font-display text-[28px] font-bold text-ink md:text-[32px]">Forgot your password?</h1>
          <p className="mx-auto mt-2 max-w-md text-[12.5px] leading-relaxed text-muted">
            Enter your Staff ID or official ICPC email address. If the details match an active staff record, we will
            issue a one-time password reset link valid for 30 minutes.
          </p>
        </div>

        <div className="card mt-6 p-5 sm:p-6">
          <ForgotPasswordForm />
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-line bg-panel-2 px-4 py-3 text-[11px] leading-relaxed text-muted">
          <KeyRound size={14} className="mt-0.5 shrink-0 text-brand-700 dark:text-brand-300" />
          <span>
            <strong className="text-ink">Demonstration environment.</strong> Email delivery is simulated, so the reset link
            is displayed on screen after you submit the form. Try the demo account Staff ID{" "}
            <span className="font-mono font-semibold text-ink">P0001</span>.
          </span>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted hover:text-ink">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
