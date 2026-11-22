import { getDb, nowIso } from "./db";
import { maybeIssueCertificate } from "./achievements";

export function ensureEnrollment(userId: number, courseId: number, source = "self"): number {
  const db = getDb();
  db.prepare(
    "INSERT OR IGNORE INTO enrollments(user_id, course_id, source, status, progress_percent, enrolled_at) VALUES(?,?,?,?,?,?)"
  ).run(userId, courseId, source, "active", 0, nowIso());
  const row = db
    .prepare("SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?")
    .get(userId, courseId) as { id: number };
  return row.id;
}

export function enrollmentProgress(userId: number, courseId: number): { done: number; total: number; percent: number } {
  const db = getDb();
  const enrollment = db
    .prepare("SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?")
    .get(userId, courseId) as { id: number } | undefined;
  const total = (
    db
      .prepare("SELECT COUNT(*) AS n FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = ?")
      .get(courseId) as { n: number }
  ).n;
  if (!enrollment) return { done: 0, total, percent: 0 };
  const done = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM lesson_progress lp
         JOIN lessons l ON l.id = lp.lesson_id
         JOIN modules m ON m.id = l.module_id
         WHERE lp.enrollment_id = ? AND m.course_id = ?`
      )
      .get(enrollment.id, courseId) as { n: number }
  ).n;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function recalcEnrollment(userId: number, courseId: number): { done: number; total: number; percent: number } {
  const db = getDb();
  const progress = enrollmentProgress(userId, courseId);
  const enrollment = db
    .prepare("SELECT id, status FROM enrollments WHERE user_id = ? AND course_id = ?")
    .get(userId, courseId) as { id: number; status: string } | undefined;
  if (enrollment && enrollment.status !== "completed") {
    const last = db
      .prepare(
        `SELECT l.id FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id
         JOIN modules m ON m.id = l.module_id
         WHERE lp.enrollment_id = ? AND m.course_id = ?
         ORDER BY lp.completed_at DESC LIMIT 1`
      )
      .get(enrollment.id, courseId) as { id: number } | undefined;
    db.prepare("UPDATE enrollments SET progress_percent = ?, last_lesson_id = ? WHERE id = ?").run(
      progress.percent,
      last?.id ?? null,
      enrollment.id
    );
  }
  return progress;
}

export function attemptCount(userId: number, assessmentId: number): number {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS n FROM assessment_attempts WHERE user_id = ? AND assessment_id = ? AND status != 'in_progress'"
    )
    .get(userId, assessmentId) as { n: number };
  return row.n;
}

export function bestAttempt(userId: number, assessmentId: number): { percent: number | null; passed: number | null } | null {
  const row = getDb()
    .prepare(
      "SELECT percent, passed FROM assessment_attempts WHERE user_id = ? AND assessment_id = ? AND status != 'in_progress' ORDER BY percent DESC LIMIT 1"
    )
    .get(userId, assessmentId) as { percent: number | null; passed: number | null } | undefined;
  return row ?? null;
}

export function checkLessonCompletionCertificate(userId: number, courseId: number): string | null {
  const result = maybeIssueCertificate(userId, courseId);
  return result.issued ? result.certNo ?? null : null;
}
