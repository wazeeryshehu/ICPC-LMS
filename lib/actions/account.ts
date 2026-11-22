"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDb, nowIso } from "@/lib/db";
import { SESSION_COOKIE, getClientIp, logAudit, requireUser } from "@/lib/auth";
import { hashPassword, validatePasswordPolicy, verifyPassword } from "@/lib/crypto";
import { createNotification } from "@/lib/achievements";

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  getDb().prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(user.id);
  redirect("/notifications");
}

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  getDb().prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(id, user.id);
  const link = String(formData.get("link") ?? "");
  redirect(link && link.startsWith("/") ? link : "/notifications");
}

export async function updateProfileAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const phone = String(formData.get("phone") ?? "").trim().slice(0, 30);
  getDb().prepare("UPDATE users SET phone = ?, updated_at = ? WHERE id = ?").run(phone || null, nowIso(), user.id);
  await logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "profile.updated", entity: "user", entityId: user.id, details: "Contact details updated", ip: await getClientIp() });
  redirect("/profile?saved=1");
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const currentHash = (
    getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as { password_hash: string | null }
  ).password_hash;
  if (!currentHash || !verifyPassword(current, currentHash)) {
    redirect("/profile?error=current");
  }
  const policyError = validatePasswordPolicy(next);
  if (policyError) {
    redirect(`/profile?error=policy&msg=${encodeURIComponent(policyError)}`);
  }
  if (next !== confirm) {
    redirect("/profile?error=match");
  }
  getDb()
    .prepare("UPDATE users SET password_hash = ?, must_change_password = 0, updated_at = ? WHERE id = ?")
    .run(hashPassword(next), nowIso(), user.id);
  const currentToken = (await cookies()).get(SESSION_COOKIE)?.value ?? "";
  getDb()
    .prepare("DELETE FROM app_sessions WHERE user_id = ? AND token <> ?")
    .run(user.id, currentToken);
  createNotification({
    userId: user.id,
    title: "Password changed",
    body: "Your ICPC LMS password was changed successfully. If this wasn't you, contact ICT support immediately.",
    type: "warning",
    link: "/profile",
  });
  await logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "password.changed", entity: "user", entityId: user.id, details: "User changed own password", ip: await getClientIp() });
  redirect("/profile?saved=password");
}
