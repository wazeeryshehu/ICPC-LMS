import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDb, nowIso } from "./db";
import { sessionToken } from "./crypto";
import { HOME_BY_ROLE, type Role } from "./rbac";

export const SESSION_COOKIE = "icpc_session";
const SESSION_HOURS = 8;
const REMEMBER_DAYS = 30;

export interface SessionUser {
  id: number;
  staff_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  designation: string | null;
  department_id: number | null;
  department_name: string | null;
  department_code: string | null;
  unit_id: number | null;
  unit_name: string | null;
  status: string;
  must_change_password: number;
  last_login_at: string | null;
  phone: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id, u.staff_id, u.email, u.first_name, u.last_name, u.role, u.designation,
              u.department_id, d.name AS department_name, d.code AS department_code,
              u.unit_id, un.name AS unit_name, u.status, u.must_change_password,
              u.last_login_at, u.phone, s.expires_at
       FROM app_sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN units un ON un.id = u.unit_id
       WHERE s.token = ?`
    )
    .get(token) as (SessionUser & { expires_at: string }) | undefined;

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now() || row.status !== "active") {
    db.prepare("DELETE FROM app_sessions WHERE token = ?").run(token);
    return null;
  }
  const { expires_at: _expires, ...user } = row;
  return user;
}

export async function requireUser(allowed?: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (allowed && !allowed.includes(user.role)) {
    redirect(HOME_BY_ROLE[user.role]);
  }
  return user;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function getUserAgent(): Promise<string> {
  const h = await headers();
  return h.get("user-agent")?.slice(0, 200) ?? "";
}

export async function createSession(userId: number, remember = false): Promise<void> {
  const db = getDb();
  const token = sessionToken();
  const ttlMs = (remember ? REMEMBER_DAYS * 24 : SESSION_HOURS) * 3600 * 1000;
  const expires = new Date(Date.now() + ttlMs);
  const ip = await getClientIp();
  const ua = await getUserAgent();
  db.prepare(
    "INSERT INTO app_sessions(token, user_id, created_at, expires_at, ip, user_agent) VALUES(?,?,?,?,?,?)"
  ).run(token, userId, nowIso(), expires.toISOString(), ip, ua);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroyCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    getDb().prepare("DELETE FROM app_sessions WHERE token = ?").run(token);
  }
  store.delete(SESSION_COOKIE);
}

export function logAudit(opts: {
  actorId?: number | null;
  actorName?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | number | null;
  details?: string | null;
  ip?: string | null;
}): void {
  try {
    getDb()
      .prepare(
        "INSERT INTO audit_logs(actor_id, actor_name, action, entity, entity_id, details, ip, created_at) VALUES(?,?,?,?,?,?,?,?)"
      )
      .run(
        opts.actorId ?? null,
        opts.actorName ?? null,
        opts.action,
        opts.entity ?? null,
        opts.entityId != null ? String(opts.entityId) : null,
        opts.details ?? null,
        opts.ip ?? null,
        nowIso()
      );
  } catch {
    // Audit failures must never break the user action; they are surfaced in logs.
    console.error("Failed to write audit log", opts.action);
  }
}

export function unreadNotificationCount(userId: number): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0")
    .get(userId) as { n: number };
  return row.n;
}

export function getSetting(key: string, fallback = ""): string {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? fallback;
}
