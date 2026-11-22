"use server";

import { getDb, nowIso } from "@/lib/db";
import { hashPassword, isValidOfficialEmail, isValidStaffId, randomToken, validatePasswordPolicy, verifyPassword } from "@/lib/crypto";
import { createSession, destroyCurrentSession, getClientIp, getSessionUser, getSetting, logAudit } from "@/lib/auth";
import { createNotification } from "@/lib/achievements";
import { HOME_BY_ROLE, type Role } from "@/lib/rbac";
import { redirect } from "next/navigation";

export interface AuthState {
  error?: string;
  message?: string;
  resetLink?: string;
}

const RESET_MINUTES = 30;

function safeNext(next: unknown): string | null {
  if (typeof next !== "string") return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  if (next.startsWith("/login") || next.startsWith("/activate")) return null;
  if (next.startsWith("/forgot-password") || next.startsWith("/reset-password")) return null;
  return next;
}

function parseIdentifier(raw: string): { staffId: string; email: string } | { error: string } {
  const value = raw.trim();
  if (!value) {
    return { error: "Enter your Staff ID or official email address." };
  }
  if (value.includes("@")) {
    const email = value.toLowerCase();
    if (!isValidOfficialEmail(email)) {
      return { error: "Use your official ICPC email address, for example firstname.surname@icpc.gov.ng." };
    }
    return { staffId: "", email };
  }
  const staffId = value.toUpperCase();
  if (!isValidStaffId(staffId)) {
    return { error: "Staff IDs use the format P plus four digits, for example P0001." };
  }
  return { staffId, email: "" };
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  const visible = name.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(1, name.length - 1))}@${domain}`;
}

function findUserByIdentifier(identifier: { staffId: string; email: string }) {
  return getDb()
    .prepare(
      `SELECT id, staff_id, email, password_hash, first_name, last_name, role, status,
              failed_attempts, locked_until, must_change_password
       FROM users WHERE upper(staff_id) = ? OR lower(email) = ?`
    )
    .get(identifier.staffId, identifier.email);
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const identifierRaw = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";
  const next = safeNext(formData.get("next"));

  if (!identifierRaw.trim() || !password) {
    return { error: "Enter your Staff ID or official email, and your password." };
  }
  const parsed = parseIdentifier(identifierRaw);
  if ("error" in parsed) return { error: parsed.error };

  const db = getDb();
  const ip = await getClientIp();
  const user = findUserByIdentifier(parsed) as
    | {
        id: number;
        staff_id: string;
        email: string;
        password_hash: string | null;
        first_name: string;
        last_name: string;
        role: Role;
        status: string;
        failed_attempts: number;
        locked_until: string | null;
        must_change_password: number;
      }
    | undefined;

  const failMessage = "Invalid login details. Check your Staff ID or official email and password.";
  if (!user) {
    logAudit({ action: "auth.login_failed", entity: "user", details: "Unknown staff ID/email", ip });
    return { error: failMessage };
  }

  if (user.status === "pending") {
    return {
      error: "This account has not been activated. Use the staff activation page with your Staff ID and official email.",
    };
  }
  if (user.status === "suspended") {
    return { error: "This account is suspended. Contact the Training and Development Unit." };
  }

  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    const mins = Math.max(1, Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000));
    return { error: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` };
  }

  if (!verifyPassword(password, user.password_hash)) {
    const maxAttempts = Number(getSetting("max_login_attempts", "5"));
    const lockMinutes = Number(getSetting("lockout_minutes", "15"));
    const attempts = user.failed_attempts + 1;
    if (attempts >= maxAttempts) {
      const until = new Date(Date.now() + lockMinutes * 60000).toISOString();
      db.prepare("UPDATE users SET failed_attempts = 0, locked_until = ?, updated_at = ? WHERE id = ?").run(until, nowIso(), user.id);
      logAudit({ action: "auth.account_locked", entity: "user", entityId: user.id, details: `Locked for ${lockMinutes} minutes after ${attempts} failed attempts`, ip });
      return { error: `Too many failed attempts. Account locked for ${lockMinutes} minutes.` };
    }
    db.prepare("UPDATE users SET failed_attempts = ?, updated_at = ? WHERE id = ?").run(attempts, nowIso(), user.id);
    logAudit({ action: "auth.login_failed", entity: "user", entityId: user.id, details: `Invalid password (attempt ${attempts})`, ip });
    return { error: failMessage };
  }

  db.prepare("UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = ?, updated_at = ? WHERE id = ?").run(
    nowIso(),
    nowIso(),
    user.id
  );
  db.prepare("DELETE FROM app_sessions WHERE expires_at < ?").run(nowIso());
  await createSession(user.id, remember);
  logAudit({
    actorId: user.id,
    actorName: `${user.first_name} ${user.last_name}`,
    action: "auth.login",
    entity: "user",
    entityId: user.id,
    details: `Signed in with Staff ID ${user.staff_id}`,
    ip,
  });

  if (user.must_change_password) redirect("/profile?change=required");
  redirect(next ?? HOME_BY_ROLE[user.role]);
}

export async function requestPasswordResetAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const identifierRaw = String(formData.get("identifier") ?? "");
  const parsed = parseIdentifier(identifierRaw);
  if ("error" in parsed) return { error: parsed.error };

  const db = getDb();
  const ip = await getClientIp();
  const genericMessage =
    "If those details match an active staff record, a password reset link has been sent to the officer's official email address.";

  const cutoff = new Date(Date.now() - 15 * 60000).toISOString();
  const ipAttempts = db
    .prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'auth.password_reset_requested' AND ip = ? AND created_at >= ?")
    .get(ip, cutoff) as { n: number };
  if (ipAttempts.n >= 10) {
    logAudit({ action: "auth.password_reset_throttled", entity: "user", details: "Per-IP request limit reached", ip });
    return { message: genericMessage };
  }

  const user = findUserByIdentifier(parsed) as
    | { id: number; staff_id: string; email: string; first_name: string; last_name: string; status: string }
    | undefined;

  if (!user) {
    logAudit({ action: "auth.password_reset_requested", entity: "user", details: "No matching staff record", ip });
    return { message: genericMessage };
  }
  if (user.status === "pending") {
    return { error: "This account has not been activated yet. Use the staff activation page to set your first password." };
  }
  if (user.status === "suspended") {
    return { error: "This account is suspended. Contact the Training and Development Unit to restore access." };
  }

  const userAttempts = db
    .prepare("SELECT COUNT(*) AS n FROM audit_logs WHERE action = 'auth.password_reset_requested' AND actor_id = ? AND created_at >= ?")
    .get(user.id, cutoff) as { n: number };
  if (userAttempts.n >= 3) {
    logAudit({ action: "auth.password_reset_throttled", entity: "user", entityId: user.id, details: "Per-user request limit reached", ip });
    return { message: genericMessage };
  }

  const token = randomToken(32);
  const expires = new Date(Date.now() + RESET_MINUTES * 60000).toISOString();
  db.prepare("DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL").run(user.id);
  db.prepare("DELETE FROM password_resets WHERE expires_at < ?").run(nowIso());
  db.prepare(
    "INSERT INTO password_resets(token, user_id, requested_ip, created_at, expires_at, used_at) VALUES(?,?,?,?,?,NULL)"
  ).run(token, user.id, ip, nowIso(), expires);

  createNotification({
    userId: user.id,
    title: "Password reset requested",
    body: `A password reset link was requested for your ICPC Learning Portal account. Use this one-time link within ${RESET_MINUTES} minutes: /reset-password/${token} — if this wasn't you, ignore this message.`,
    type: "warning",
    link: `/reset-password/${token}`,
  });
  logAudit({
    actorId: user.id,
    actorName: `${user.first_name} ${user.last_name}`,
    action: "auth.password_reset_requested",
    entity: "user",
    entityId: user.id,
    details: "Reset link generated",
    ip,
  });

  return {
    message: `A reset link has been sent to ${maskEmail(user.email)}. It expires in ${RESET_MINUTES} minutes.`,
    resetLink: `/reset-password/${token}`,
  };
}

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const invalidLink = "This password reset link is invalid or has expired. Request a new link.";

  if (!token) return { error: invalidLink };
  if (!password || !confirm) return { error: "Enter and confirm your new password." };

  const db = getDb();
  const row = db
    .prepare(
      `SELECT pr.expires_at, pr.used_at, u.id, u.staff_id, u.first_name, u.last_name
       FROM password_resets pr JOIN users u ON u.id = pr.user_id WHERE pr.token = ?`
    )
    .get(token) as
    | { expires_at: string; used_at: string | null; id: number; staff_id: string; first_name: string; last_name: string }
    | undefined;

  if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) {
    return { error: invalidLink };
  }

  const policyError = validatePasswordPolicy(password);
  if (policyError) return { error: policyError };
  if (password !== confirm) return { error: "Passwords do not match." };

  db.prepare(
    "UPDATE users SET password_hash = ?, must_change_password = 0, failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?"
  ).run(hashPassword(password), nowIso(), row.id);
  db.prepare("UPDATE password_resets SET used_at = ? WHERE token = ?").run(nowIso(), token);
  db.prepare("DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL").run(row.id);
  db.prepare("DELETE FROM app_sessions WHERE user_id = ?").run(row.id);

  createNotification({
    userId: row.id,
    title: "Password reset completed",
    body: "Your ICPC Learning Portal password was reset. All other sessions were signed out. If this wasn't you, contact ICT support immediately.",
    type: "success",
    link: "/login",
  });
  logAudit({
    actorId: row.id,
    actorName: `${row.first_name} ${row.last_name}`,
    action: "auth.password_reset_completed",
    entity: "user",
    entityId: row.id,
    details: "Password reset via one-time link; sessions cleared",
    ip: await getClientIp(),
  });

  redirect("/login?reset=1");
}

export async function activateAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const staffId = String(formData.get("staffId") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!staffId || !email || !password || !confirm) {
    return { error: "All fields are required." };
  }
  if (!isValidStaffId(staffId)) {
    return { error: "Staff IDs use the format P plus four digits, for example P0001." };
  }
  if (!isValidOfficialEmail(email)) {
    return { error: "Activate using your official ICPC email address, for example firstname.surname@icpc.gov.ng." };
  }
  const policyError = validatePasswordPolicy(password);
  if (policyError) return { error: policyError };
  if (password !== confirm) return { error: "Passwords do not match." };

  const db = getDb();
  const user = db
    .prepare("SELECT id, staff_id, email, first_name, last_name, status, role FROM users WHERE staff_id = ?")
    .get(staffId) as
    | { id: number; staff_id: string; email: string; first_name: string; last_name: string; status: string; role: Role }
    | undefined;

  const genericError =
    "No pending staff record matches that Staff ID and official email. Contact the Training and Development Unit if you need access.";

  if (!user || user.email.toLowerCase() !== email) {
    logAudit({ action: "auth.activation_failed", entity: "user", entityId: staffId, details: "No matching staff ID/email", ip: await getClientIp() });
    return { error: genericError };
  }
  if (user.status === "active") {
    return { error: "This account is already active. Sign in with your Staff ID, official email and password." };
  }
  if (user.status !== "pending") {
    return { error: genericError };
  }

  const ip = await getClientIp();
  db.prepare(
    "UPDATE users SET password_hash = ?, status = 'active', must_change_password = 0, failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?"
  ).run(hashPassword(password), nowIso(), user.id);
  db.prepare(
    "INSERT INTO notifications(user_id, title, body, type, link, is_read, created_at) VALUES(?,?,?,?,?,?,?)"
  ).run(
    user.id,
    "Account activated",
    "Your ICPC Learning Portal account is now active. Your mandatory training assignments are on your dashboard.",
    "success",
    "/dashboard",
    0,
    nowIso()
  );
  logAudit({
    actorId: user.id,
    actorName: `${user.first_name} ${user.last_name}`,
    action: "auth.account_activated",
    entity: "user",
    entityId: user.id,
    details: `Staff ID ${user.staff_id} activated and password set`,
    ip,
  });
  await createSession(user.id);
  redirect(HOME_BY_ROLE[user.role]);
}

export async function signOutAction(): Promise<void> {
  const user = await getSessionUser();
  if (user) {
    logAudit({
      actorId: user.id,
      actorName: `${user.first_name} ${user.last_name}`,
      action: "auth.logout",
      entity: "user",
      entityId: user.id,
      details: "Signed out",
      ip: await getClientIp(),
    });
  }
  await destroyCurrentSession();
  redirect("/login");
}
