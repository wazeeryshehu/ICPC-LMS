"use server";

import { redirect } from "next/navigation";
import { randomInt } from "node:crypto";
import { getDb, nowIso, withTransaction } from "@/lib/db";
import { getClientIp, logAudit, requireUser } from "@/lib/auth";
import { hashPassword, isValidOfficialEmail, isValidStaffId } from "@/lib/crypto";
import { createNotification } from "@/lib/achievements";
import { isSuperAdmin, ROLE_LABELS, type Role } from "@/lib/rbac";

const ROLES: Role[] = ["super_admin", "training_admin", "instructor", "coordinator", "learner", "management"];

async function requireAdmin() {
  return requireUser(["super_admin", "training_admin"]);
}

function nextStaffId(): string {
  const rows = getDb()
    .prepare("SELECT staff_id FROM users WHERE upper(staff_id) GLOB 'P[0-9][0-9][0-9][0-9]'")
    .all() as Array<{ staff_id: string }>;
  let max = 0;
  let prefix = "P";
  for (const row of rows) {
    const n = Number(row.staff_id.replace(/\D/g, "")) || 0;
    if (n >= max) {
      max = n;
      prefix = row.staff_id.startsWith("p") ? "p" : "P";
    }
  }
  return `${prefix}${String(Math.max(max + 1, 1)).padStart(4, "0")}`;
}

export async function createUserAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const db = getDb();
  const first = String(formData.get("firstName") ?? "").trim();
  const otherName = String(formData.get("otherName") ?? "").trim();
  const last = String(formData.get("lastName") ?? "").trim();
  const staffIdInput = String(formData.get("staffId") ?? "").trim();
  const emailInput = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "learner") as Role;
  const designation = String(formData.get("designation") ?? "").trim();
  const departmentId = Number(formData.get("departmentId")) || null;
  const unitId = Number(formData.get("unitId")) || null;
  const phone = String(formData.get("phone") ?? "").trim();
  const tempPassword = `Icpc@${randomInt(100000, 1000000)}`;

  if (!first || !last || otherName.length > 60 || !ROLES.includes(role)) redirect("/admin/users/new?error=invalid");
  if (role === "super_admin" && !isSuperAdmin(actor.role)) redirect("/admin/users/new?error=privilege");

  if (staffIdInput && !isValidStaffId(staffIdInput)) redirect("/admin/users/new?error=staffid");
  if (!emailInput || !isValidOfficialEmail(emailInput)) redirect("/admin/users/new?error=email");
  const staffId = staffIdInput || nextStaffId();
  const email = emailInput;
  if (!isValidStaffId(staffId)) redirect("/admin/users/new?error=invalid");
  if (db.prepare("SELECT 1 FROM users WHERE upper(staff_id) = ?").get(staffId.toUpperCase())) redirect("/admin/users/new?error=staffid");
  if (db.prepare("SELECT 1 FROM users WHERE lower(email) = ?").get(email)) redirect("/admin/users/new?error=email");
  if (unitId && departmentId) {
    const unit = db.prepare("SELECT 1 FROM units WHERE id = ? AND department_id = ?").get(unitId, departmentId);
    if (!unit) redirect("/admin/users/new?error=invalid");
  }

  const info = db
    .prepare(
      `INSERT INTO users(staff_id, email, password_hash, first_name, middle_name, last_name, role, designation, department_id, unit_id, phone,
        status, must_change_password, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .run(staffId, email, hashPassword(tempPassword), first, otherName || null, last, role, designation || null, departmentId, unitId, phone || null, "active", 1, nowIso(), nowIso());
  const userId = Number(info.lastInsertRowid);

  createNotification({
    userId,
    title: "Welcome to the ICPC Digital Learning Portal",
    body: `Your staff account (${staffId}) has been created. Sign in with your staff ID and official email, then change your temporary password.`,
    type: "info",
    link: "/profile",
  });
  logAudit({
    actorId: actor.id,
    actorName: `${actor.first_name} ${actor.last_name}`,
    action: "user.created",
    entity: "user",
    entityId: userId,
    details: `${[first, otherName, last].filter(Boolean).join(" ")} (${staffId}, ${ROLE_LABELS[role]}) created`,
    ip: await getClientIp(),
  });
  redirect(`/admin/users/${userId}?created=1&temp=${encodeURIComponent(tempPassword)}`);
}

export async function updateUserAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const userId = Number(formData.get("userId"));
  const db = getDb();
  const target = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as
    | {
        id: number;
        role: Role;
        status: string;
        staff_id: string;
        email: string;
        first_name: string;
        middle_name: string | null;
        last_name: string;
      }
    | undefined;
  if (!target) redirect("/admin/users");

  const role = String(formData.get("role") ?? target.role) as Role;
  const otherName = String(formData.get("otherName") ?? target.middle_name ?? "").trim();
  const staffId = String(formData.get("staffId") ?? target.staff_id).trim() || target.staff_id;
  const email = (String(formData.get("email") ?? target.email).trim().toLowerCase()) || target.email;
  const designation = String(formData.get("designation") ?? "").trim();
  const departmentId = Number(formData.get("departmentId")) || null;
  const unitId = Number(formData.get("unitId")) || null;
  const phone = String(formData.get("phone") ?? "").trim();
  const status = String(formData.get("status") ?? target.status);

  if (!ROLES.includes(role) || otherName.length > 60) redirect(`/admin/users/${userId}?error=invalid`);
  if ((role === "super_admin" || target.role === "super_admin") && !isSuperAdmin(actor.role)) {
    redirect(`/admin/users/${userId}?error=privilege`);
  }
  if (target.id === actor.id && (status !== "active" || role !== target.role)) {
    redirect(`/admin/users/${userId}?error=self`);
  }
  if (!isValidStaffId(staffId)) redirect(`/admin/users/${userId}?error=staffid`);
  if (!isValidOfficialEmail(email)) redirect(`/admin/users/${userId}?error=email`);
  if (db.prepare("SELECT 1 FROM users WHERE upper(staff_id) = ? AND id <> ?").get(staffId.toUpperCase(), userId)) {
    redirect(`/admin/users/${userId}?error=staffid`);
  }
  if (db.prepare("SELECT 1 FROM users WHERE lower(email) = ? AND id <> ?").get(email, userId)) {
    redirect(`/admin/users/${userId}?error=email`);
  }
  if (unitId && departmentId) {
    const unit = db.prepare("SELECT 1 FROM units WHERE id = ? AND department_id = ?").get(unitId, departmentId);
    if (!unit) redirect(`/admin/users/${userId}?error=invalid`);
  }

  db.prepare(
    `UPDATE users SET staff_id=?, email=?, middle_name=?, role=?, designation=?, department_id=?, unit_id=?, phone=?, status=?, updated_at=? WHERE id=?`
  ).run(staffId, email, otherName || null, role, designation || null, departmentId, unitId, phone || null, status, nowIso(), userId);
  if (status !== "active") {
    db.prepare("DELETE FROM app_sessions WHERE user_id = ?").run(userId);
  }
  if (staffId !== target.staff_id || email !== target.email) {
    createNotification({
      userId,
      title: "Sign-in details updated",
      body: `An administrator updated your staff record. Staff ID: ${staffId}. Official email: ${email}. Use these details at sign-in.`,
      type: "warning",
      link: "/profile",
    });
  }
  const changes = [`role ${role}`, `status ${status}`];
  if (staffId !== target.staff_id) changes.push(`staff ID ${target.staff_id} -> ${staffId}`);
  if (email !== target.email) changes.push(`email ${target.email} -> ${email}`);
  logAudit({
    actorId: actor.id,
    actorName: `${actor.first_name} ${actor.last_name}`,
    action: "user.updated",
    entity: "user",
    entityId: userId,
    details: `${target.staff_id}: ${changes.join(", ")}`,
    ip: await getClientIp(),
  });
  redirect(`/admin/users/${userId}?saved=1`);
}

export async function setUserStatusAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const userId = Number(formData.get("userId"));
  const status = String(formData.get("status"));
  if (!["active", "suspended", "pending"].includes(status)) redirect("/admin/users");
  if (userId === actor.id) redirect("/admin/users?error=self");
  const db = getDb();
  const target = db.prepare("SELECT staff_id, first_name, last_name, role FROM users WHERE id = ?").get(userId) as
    | { staff_id: string; first_name: string; last_name: string; role: Role }
    | undefined;
  if (!target) redirect("/admin/users");
  if (target.role === "super_admin" && !isSuperAdmin(actor.role)) redirect("/admin/users?error=privilege");
  db.prepare("UPDATE users SET status=?, updated_at=? WHERE id=?").run(status, nowIso(), userId);
  if (status !== "active") db.prepare("DELETE FROM app_sessions WHERE user_id = ?").run(userId);
  logAudit({
    actorId: actor.id,
    actorName: `${actor.first_name} ${actor.last_name}`,
    action: status === "active" ? "user.activated" : "user.suspended",
    entity: "user",
    entityId: userId,
    details: `${target.staff_id} ${status}`,
    ip: await getClientIp(),
  });
  redirect(`/admin/users?status=${status}`);
}

export async function unlockUserAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const userId = Number(formData.get("userId"));
  const db = getDb();
  const target = db.prepare("SELECT staff_id FROM users WHERE id = ?").get(userId) as { staff_id: string } | undefined;
  if (!target) redirect("/admin/users");
  db.prepare("UPDATE users SET failed_attempts=0, locked_until=NULL, updated_at=? WHERE id=?").run(nowIso(), userId);
  logAudit({ actorId: actor.id, actorName: `${actor.first_name} ${actor.last_name}`, action: "user.unlocked", entity: "user", entityId: userId, details: `${target.staff_id} unlocked`, ip: await getClientIp() });
  redirect("/admin/users?unlocked=1");
}

export async function resetPasswordAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const userId = Number(formData.get("userId"));
  const db = getDb();
  const target = db.prepare("SELECT staff_id, email, first_name, role FROM users WHERE id = ?").get(userId) as
    | { staff_id: string; email: string; first_name: string; role: Role }
    | undefined;
  if (!target) redirect("/admin/users");
  if (target.role === "super_admin" && !isSuperAdmin(actor.role)) redirect("/admin/users?error=privilege");
  const temp = `ICPC@${randomInt(100000, 1000000)}`;
  db.prepare("UPDATE users SET password_hash=?, must_change_password=1, failed_attempts=0, locked_until=NULL, updated_at=? WHERE id=?").run(
    hashPassword(temp),
    nowIso(),
    userId
  );
  db.prepare("DELETE FROM app_sessions WHERE user_id = ?").run(userId);
  createNotification({
    userId,
    title: "Password reset by administrator",
    body: "Your password was reset. Sign in with the temporary password issued by the administrator and change it immediately.",
    type: "warning",
    link: "/profile",
  });
  logAudit({ actorId: actor.id, actorName: `${actor.first_name} ${actor.last_name}`, action: "user.password_reset", entity: "user", entityId: userId, details: `${target.staff_id} password reset`, ip: await getClientIp() });
  redirect(`/admin/users/${userId}?temp=${encodeURIComponent(temp)}`);
}

export async function createDepartmentAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const description = String(formData.get("description") ?? "").trim();
  if (!name || !code) redirect("/admin/departments?error=invalid");
  const db = getDb();
  if (db.prepare("SELECT 1 FROM departments WHERE name = ? OR code = ?").get(name, code)) {
    redirect("/admin/departments?error=duplicate");
  }
  const info = db.prepare("INSERT INTO departments(name, code, description, created_at) VALUES(?,?,?,?)").run(name, code, description || null, nowIso());
  logAudit({ actorId: actor.id, actorName: `${actor.first_name} ${actor.last_name}`, action: "department.created", entity: "department", entityId: Number(info.lastInsertRowid), details: `${name} (${code})`, ip: await getClientIp() });
  redirect("/admin/departments?saved=department");
}

export async function createUnitAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const departmentId = Number(formData.get("departmentId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!departmentId || !name) redirect("/admin/departments?error=invalid");
  const db = getDb();
  if (!db.prepare("SELECT 1 FROM departments WHERE id = ?").get(departmentId)) redirect("/admin/departments");
  const info = db.prepare("INSERT INTO units(department_id, name, created_at) VALUES(?,?,?)").run(departmentId, name, nowIso());
  logAudit({ actorId: actor.id, actorName: `${actor.first_name} ${actor.last_name}`, action: "unit.created", entity: "department", entityId: departmentId, details: `Unit ${name} added`, ip: await getClientIp() });
  redirect("/admin/departments?saved=unit");
}

export async function createAnnouncementAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const audience = String(formData.get("audience") ?? "all");
  const pinned = formData.get("pinned") === "on" ? 1 : 0;
  if (!title || body.length < 10 || !ROLES.includes(audience as Role) && audience !== "all") {
    redirect("/admin/announcements?error=invalid");
  }
  const db = getDb();
  const info = db
    .prepare("INSERT INTO announcements(title, body, audience, pinned, created_by, published_at) VALUES(?,?,?,?,?,?)")
    .run(title, body, audience, pinned, actor.id, nowIso());
  const recipients = db
    .prepare(`SELECT id FROM users WHERE status = 'active' ${audience === "all" ? "" : "AND role = ?"}`)
    .all(...(audience === "all" ? [] : [audience])) as Array<{ id: number }>;
  for (const r of recipients) {
    createNotification({ userId: r.id, title: `Announcement: ${title}`, body: body.slice(0, 240), type: "info", link: "/notifications" });
  }
  logAudit({ actorId: actor.id, actorName: `${actor.first_name} ${actor.last_name}`, action: "announcement.published", entity: "announcement", entityId: Number(info.lastInsertRowid), details: `${title} to ${audience} (${recipients.length} staff)`, ip: await getClientIp() });
  redirect("/admin/announcements?saved=1");
}

export async function deleteAnnouncementAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const id = Number(formData.get("id"));
  const db = getDb();
  const row = db.prepare("SELECT title FROM announcements WHERE id = ?").get(id) as { title: string } | undefined;
  if (!row) redirect("/admin/announcements");
  db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
  logAudit({ actorId: actor.id, actorName: `${actor.first_name} ${actor.last_name}`, action: "announcement.deleted", entity: "announcement", entityId: id, details: row.title, ip: await getClientIp() });
  redirect("/admin/announcements?deleted=1");
}

export async function saveSettingsAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const allowed = [
    "institution_name",
    "institution_short",
    "signatory_name",
    "signatory_title",
    "certificate_prefix",
    "annual_cpd_target",
    "max_login_attempts",
    "lockout_minutes",
    "session_hours",
    "default_pass_mark",
    "email_notifications",
    "email_mode",
    "retention_years",
    "support_email",
    "portal_notice",
  ];
  const db = getDb();
  const stmt = db.prepare("INSERT INTO settings(key, value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  withTransaction(() => {
    for (const key of allowed) {
      if (key === "email_notifications") {
        stmt.run(key, formData.get(key) === "1" ? "1" : "0");
        continue;
      }
      const value = formData.get(key);
      if (value !== null) stmt.run(key, String(value).trim());
    }
  });
  logAudit({ actorId: actor.id, actorName: `${actor.first_name} ${actor.last_name}`, action: "settings.updated", entity: "settings", details: "System settings saved", ip: await getClientIp() });
  redirect("/admin/settings?saved=1");
}

export async function reviewLegalContentAction(formData: FormData): Promise<void> {
  const actor = await requireAdmin();
  const courseId = Number(formData.get("courseId"));
  const decision = String(formData.get("decision"));
  const comments = String(formData.get("comments") ?? "").trim();
  if (!["approved", "rejected"].includes(decision)) redirect("/admin/settings");
  const db = getDb();
  const course = db.prepare("SELECT title, instructor_id FROM courses WHERE id = ?").get(courseId) as
    | { title: string; instructor_id: number | null }
    | undefined;
  if (!course) redirect("/admin/settings");
  db.prepare("UPDATE courses SET legal_review_status=?, updated_at=? WHERE id=?").run(decision, nowIso(), courseId);
  db.prepare("INSERT INTO course_reviews(course_id, reviewer_id, status, comments, created_at) VALUES(?,?,?,?,?)").run(
    courseId,
    actor.id,
    decision,
    comments || (decision === "approved" ? "Legal content approved." : "Legal content rejected."),
    nowIso()
  );
  if (course.instructor_id) {
    createNotification({
      userId: course.instructor_id,
      title: decision === "approved" ? "Legal review approved" : "Legal review rejected",
      body: `${course.title}: ${comments || (decision === "approved" ? "Content cleared for publication." : "Please revise and resubmit.")}`,
      type: decision === "approved" ? "success" : "warning",
      link: "/instructor/courses",
    });
  }
  logAudit({ actorId: actor.id, actorName: `${actor.first_name} ${actor.last_name}`, action: `course.legal_${decision}`, entity: "course", entityId: courseId, details: comments || course.title, ip: await getClientIp() });
  redirect("/admin/settings?saved=legal");
}

export async function assignCourseAction(formData: FormData): Promise<void> {
  const actor = await requireUser(["super_admin", "training_admin", "coordinator"]);
  const courseId = Number(formData.get("courseId"));
  const departmentId = Number(formData.get("departmentId")) || null;
  const dueDate = String(formData.get("dueDate") ?? "").trim() || null;
  const mandatory = formData.get("mandatory") === "on" ? 1 : 0;
  const backTo = actor.role === "coordinator" ? "/department" : "/admin/departments";
  if (!courseId || !departmentId) redirect(`${backTo}?error=assignment`);
  if (actor.role === "coordinator" && actor.department_id !== departmentId) redirect(`${backTo}?error=scope`);
  const db = getDb();
  const course = db.prepare("SELECT title, status FROM courses WHERE id = ?").get(courseId) as
    | { title: string; status: string }
    | undefined;
  if (!course || course.status !== "published") redirect(`${backTo}?error=course`);
  const dept = db.prepare("SELECT name FROM departments WHERE id = ?").get(departmentId) as { name: string } | undefined;
  if (!dept) redirect(`${backTo}?error=assignment`);

  const staff = db
    .prepare("SELECT id FROM users WHERE department_id = ? AND status = 'active'")
    .all(departmentId) as Array<{ id: number }>;
  withTransaction(() => {
    db.prepare(
      "INSERT INTO course_assignments(course_id, scope, department_id, mandatory, due_date, assigned_by, created_at) VALUES(?,?,?,?,?,?,?)"
    ).run(courseId, "department", departmentId, mandatory, dueDate, actor.id, nowIso());
    const enrol = db.prepare(
      `INSERT OR IGNORE INTO enrollments(user_id, course_id, source, status, progress_percent, enrolled_at)
       VALUES(?,?,?,?,?,?)`
    );
    for (const s of staff) {
      enrol.run(s.id, courseId, "assignment", "active", 0, nowIso());
    }
  });
  for (const s of staff) {
    createNotification({
      userId: s.id,
      title: "Training assignment",
      body: `${course.title} has been assigned to ${dept.name}${dueDate ? ` — due ${dueDate}` : ""}.`,
      type: "info",
      link: `/courses`,
    });
  }
  logAudit({ actorId: actor.id, actorName: `${actor.first_name} ${actor.last_name}`, action: "course.assigned", entity: "course", entityId: courseId, details: `Assigned to ${dept.name} (${staff.length} staff)`, ip: await getClientIp() });
  redirect(`${backTo}?saved=assignment`);
}
