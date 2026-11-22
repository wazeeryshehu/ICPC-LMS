"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import {
  activateAction,
  loginAction,
  requestPasswordResetAction,
  resetPasswordAction,
  type AuthState,
} from "@/lib/actions/auth";

function FieldIcon({ children }: { children: React.ReactNode }) {
  return <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{children}</span>;
}

function PasswordField({
  name,
  label,
  autoComplete,
  value,
  onChange,
  placeholder,
}: {
  name: string;
  label: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <div className="relative">
        <FieldIcon><LockKeyhole size={15} /></FieldIcon>
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          className="input pl-9 pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Enter password"}
          required
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

const DEMO_ACCOUNTS = [
  { label: "Super Administrator", staffId: "P0001" },
  { label: "Training Administrator", staffId: "P0002" },
  { label: "Instructor", staffId: "P0003" },
  { label: "Staff Learner", staffId: "P0008" },
];

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(loginAction, {});
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <form action={formAction} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        {state.error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-300/60 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}
        <div>
          <label className="label" htmlFor="identifier">Staff ID or official email</label>
          <div className="relative">
            <FieldIcon><UserRound size={15} /></FieldIcon>
            <input
              id="identifier"
              name="identifier"
              className="input pl-9"
              placeholder="P0001 or firstname.surname@icpc.gov.ng"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="text"
              enterKeyHint="next"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              maxLength={80}
              required
            />
          </div>
          <p className="mt-1 text-[10.5px] text-muted">
            You may sign in with either your Staff ID or your official ICPC email address.
          </p>
        </div>
        <PasswordField
          name="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        <div className="flex items-center justify-between gap-3 text-[11.5px]">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" name="remember" className="h-3.5 w-3.5 accent-[#16437f]" defaultChecked /> Keep me signed in on this device
          </label>
          <Link href="/forgot-password" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn btn-primary w-full" disabled={pending}>
          <KeyRound size={16} />
          {pending ? "Verifying credentials…" : "Sign in to the portal"}
        </button>
        <p className="text-center text-[11.5px] text-muted">
          New officer?{" "}
          <Link href="/activate" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">
            Activate your account
          </Link>
        </p>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-line-strong bg-surface-2/60 p-3.5">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
          <ShieldCheck size={13} /> Demonstration accounts
        </div>
        <p className="mt-1 text-[10.5px] text-muted">
          Password for all demo accounts: <span className="font-mono font-bold text-ink">ICPC@2026</span>. Select one to fill the form.
          You can also sign in with the officer&apos;s official email address instead of the Staff ID.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {DEMO_ACCOUNTS.map((acct) => (
            <button
              key={acct.staffId}
              type="button"
              onClick={() => {
                setIdentifier(acct.staffId);
                setPassword("ICPC@2026");
              }}
              className="rounded-lg border border-line bg-panel px-2.5 py-1.5 text-left text-[10.5px] text-ink-soft transition hover:border-brand-400 hover:bg-panel-2"
            >
              <span className="block font-bold text-ink">{acct.staffId}</span>
              <span className="block text-[9.5px] text-muted">{acct.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ActivateForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(activateAction, {});
  const [staffId, setStaffId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-300/60 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="activate-staff-id">Staff ID</label>
          <input
            id="activate-staff-id"
            name="staffId"
            className="input font-mono uppercase tracking-wider"
            placeholder="P0022"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value.toUpperCase())}
            maxLength={10}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="activate-email">Official Staff Email</label>
          <input
            id="activate-email"
            name="email"
            type="email"
            className="input"
            placeholder="firstname.surname@icpc.gov.ng"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      <PasswordField name="password" label="Create password" autoComplete="new-password" value={password} onChange={setPassword} />
      <PasswordField name="confirm" label="Confirm password" autoComplete="new-password" value={confirm} onChange={setConfirm} />
      <div className="rounded-lg bg-surface-2 px-3 py-2.5 text-[10.5px] leading-relaxed text-muted">
        Password policy: at least 10 characters, including uppercase and lowercase letters, a number and a symbol.
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        <ShieldCheck size={16} />
        {pending ? "Activating account…" : "Activate my staff account"}
      </button>
      <p className="text-center text-[11.5px] text-muted">
        Already activated? <Link href="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Sign in</Link>
      </p>
      <div className="rounded-xl border border-dashed border-line-strong bg-surface-2/60 p-3.5 text-[10.5px] text-muted">
        <span className="font-bold uppercase tracking-[0.08em]">Activation demo:</span> Staff ID{" "}
        <span className="font-mono font-bold text-ink">P0022</span> and email{" "}
        <span className="font-mono font-bold text-ink">grace.adeyemi@icpc.gov.ng</span> are pre-registered and awaiting activation.
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(requestPasswordResetAction, {});
  const [identifier, setIdentifier] = useState("");

  if (state.message) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-[#2f7cd6]/30 bg-[#eef6ff] px-3.5 py-3 text-[12px] leading-relaxed text-[#14406e] dark:border-[#2f7cd6]/30 dark:bg-[#0d2f52] dark:text-[#bfe0ff]">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>{state.message}</span>
        </div>
        {state.resetLink && (
          <div className="rounded-xl border border-dashed border-line-strong bg-surface-2/60 p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">Demonstration environment</div>
            <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
              Email delivery is simulated, so the one-time link is shown here instead of being emailed.
            </p>
            <Link href={state.resetLink} className="btn btn-primary btn-sm mt-2 w-full">
              Continue to reset password <ArrowRight size={14} />
            </Link>
          </div>
        )}
        <p className="text-center text-[11.5px] text-muted">
          <Link href="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Back to sign in</Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-300/60 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <div>
        <label className="label" htmlFor="reset-identifier">Staff ID or official email</label>
        <div className="relative">
          <FieldIcon><Mail size={15} /></FieldIcon>
          <input
            id="reset-identifier"
            name="identifier"
            className="input pl-9"
            placeholder="P0001 or firstname.surname@icpc.gov.ng"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            maxLength={80}
            required
          />
        </div>
        <p className="mt-1 text-[10.5px] text-muted">
          Enter the Staff ID or official ICPC email address on your staff record.
        </p>
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        <Mail size={16} />
        {pending ? "Requesting reset link…" : "Send password reset link"}
      </button>
      <p className="text-center text-[11.5px] text-muted">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Sign in</Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(resetPasswordAction, {});
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state.error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-300/60 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      <PasswordField name="password" label="New password" autoComplete="new-password" value={password} onChange={setPassword} />
      <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" value={confirm} onChange={setConfirm} />
      <div className="rounded-lg bg-surface-2 px-3 py-2.5 text-[10.5px] leading-relaxed text-muted">
        Password policy: at least 10 characters, including uppercase and lowercase letters, a number and a symbol.
        All other signed-in sessions will be ended.
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        <KeyRound size={16} />
        {pending ? "Resetting password…" : "Set new password"}
      </button>
      <p className="text-center text-[11.5px] text-muted">
        <Link href="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-300">Back to sign in</Link>
      </p>
    </form>
  );
}
