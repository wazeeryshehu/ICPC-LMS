import Link from "next/link";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { ResetPasswordForm } from "@/components/AuthForms";
import { IcpcLogo } from "@/components/Logo";
import { getDb } from "@/lib/db";

export const metadata = { title: "Set a New Password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = getDb()
    .prepare("SELECT expires_at, used_at FROM password_resets WHERE token = ?")
    .get(token) as { expires_at: string; used_at: string | null } | undefined;
  const valid = Boolean(row && !row.used_at && new Date(row.expires_at).getTime() >= Date.now());

  return (
    <div className="min-h-screen bg-surface">
      <PublicHeader isAuthed={false} homeHref="/login" />
      <main className="mx-auto max-w-lg px-4 py-10 md:py-14">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-line">
            <IcpcLogo emblem className="h-full w-auto" />
          </div>
          <div className="mt-4 text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#2f5da8] dark:text-[#6fa8e8]">
            Secure account recovery
          </div>
          <h1 className="mt-1 font-display text-[28px] font-bold text-ink md:text-[32px]">
            {valid ? "Set a new password" : "Reset link unavailable"}
          </h1>
        </div>

        <div className="card mt-6 p-5 sm:p-6">
          {valid ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle size={22} />
              </div>
              <h2 className="mt-3 font-display text-[18px] font-bold text-ink">This link is invalid or has expired</h2>
              <p className="mx-auto mt-1.5 max-w-sm text-[12px] leading-relaxed text-muted">
                Password reset links are single-use and expire after 30 minutes. Request a fresh link to continue.
              </p>
              <Link href="/forgot-password" className="btn btn-primary btn-sm mt-4">
                Request a new reset link
              </Link>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-line bg-panel-2 px-4 py-3 text-[11px] leading-relaxed text-muted">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand-700 dark:text-brand-300" />
          <span>
            For your security, resetting your password signs you out of all other devices and records the event in the
            audit log.
          </span>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-[11.5px] font-semibold text-muted hover:text-ink">Back to sign in</Link>
        </div>
      </main>
    </div>
  );
}
