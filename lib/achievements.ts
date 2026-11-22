import { getDb, nowIso } from "./db";
import { getSetting, logAudit } from "./auth";
import { randomToken } from "./crypto";
import { gradeFor } from "./format";

export function createNotification(opts: {
  userId: number;
  title: string;
  body?: string;
  type?: "info" | "success" | "warning" | "danger";
  link?: string;
}): void {
  const db = getDb();
  db.prepare(
    "INSERT INTO notifications(user_id, title, body, type, link, is_read, created_at) VALUES(?,?,?,?,?,?,?)"
  ).run(opts.userId, opts.title, opts.body ?? null, opts.type ?? "info", opts.link ?? null, 0, nowIso());

  if (getSetting("email_notifications", "1") === "1") {
    const user = db.prepare("SELECT email FROM users WHERE id = ?").get(opts.userId) as { email: string } | undefined;
    if (user) {
      db.prepare(
        "INSERT INTO email_queue(user_id, to_email, subject, body, status, created_at) VALUES(?,?,?,?,?,?)"
      ).run(
        opts.userId,
        user.email,
        opts.title,
        opts.body ?? "",
        getSetting("email_mode", "simulation") === "simulation" ? "simulated" : "queued",
        nowIso()
      );
    }
  }
}

function newCertificateNumber(): string {
  const db = getDb();
  const year = new Date().getFullYear();
  for (let i = 0; i < 10; i++) {
    const suffix = randomToken(4).toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 6);
    const certNo = `ICPC-${year}-${suffix.padEnd(6, "0")}`;
    const existing = db.prepare("SELECT 1 AS x FROM certificates WHERE cert_no = ?").get(certNo);
    if (!existing) return certNo;
  }
  return `ICPC-${year}-${Date.now().toString().slice(-6)}`;
}

export function awardBadges(userId: number): string[] {
  const db = getDb();
  const certs = db
    .prepare(
      `SELECT cert.course_id, cert.final_score, c.slug AS course_slug, cc.slug AS category_slug,
              c.title AS course_title
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       JOIN course_categories cc ON cc.id = c.category_id
       WHERE cert.user_id = ? AND cert.revoked = 0`
    )
    .all(userId) as Array<{
    course_id: number;
    final_score: number;
    course_slug: string;
    category_slug: string;
    course_title: string;
  }>;

  if (certs.length === 0) return [];

  const count = certs.length;
  const avg = certs.reduce((s, c) => s + c.final_score, 0) / count;
  const categories = certs.map((c) => c.category_slug);
  const slugs = new Set(certs.map((c) => c.course_slug));

  const earned: string[] = [];
  const award = (key: string, courseId: number | null = null) => {
    const result = db
      .prepare("INSERT OR IGNORE INTO user_badges(user_id, badge_key, course_id, awarded_at) VALUES(?,?,?,?)")
      .run(userId, key, courseId, nowIso());
    if (Number(result.changes) > 0) {
      earned.push(key);
      const badge = db.prepare("SELECT name, description, tier FROM badges WHERE key = ?").get(key) as
        | { name: string; description: string; tier: string }
        | undefined;
      if (badge) {
        createNotification({
          userId,
          title: `New ${badge.tier} badge earned: ${badge.name}`,
          body: badge.description,
          type: "success",
          link: "/achievements",
        });
      }
    }
  };

  award("course_explorer", certs[0].course_id);
  if (count >= 5) award("learning_champion");
  if (categories.filter((c) => c === "legal-services").length >= 3) award("legal_compliance_specialist");
  if (slugs.has("cybersecurity-awareness-public-officers")) award("cybersecurity_champion");
  if (categories.filter((c) => c === "investigation-operations").length >= 3) award("investigation_excellence");
  if (slugs.has("intelligence-gathering-analysis")) award("intelligence_analyst");
  if (categories.filter((c) => c === "ict-digital").length >= 2) award("digital_transformation_champion");
  if (slugs.has("public-service-rules-professional-ethics")) award("integrity_ethics_advocate");
  if (count >= 3 && avg >= 80) award("advanced_learner");
  if (certs.some((c) => c.final_score >= 90)) award("high_performance");

  const days = db
    .prepare(
      `SELECT COUNT(DISTINCT substr(lp.completed_at, 1, 10)) AS n
       FROM lesson_progress lp JOIN enrollments e ON e.id = lp.enrollment_id WHERE e.user_id = ?`
    )
    .get(userId) as { n: number };
  if (days.n >= 5) award("learning_streak");

  const user = db.prepare("SELECT department_id FROM users WHERE id = ?").get(userId) as
    | { department_id: number | null }
    | undefined;
  if (user?.department_id) {
    const top = db
      .prepare(
        `SELECT e.user_id, COUNT(*) AS n
         FROM certificates cert
         JOIN users u ON u.id = cert.user_id
         JOIN enrollments e ON e.user_id = cert.user_id AND e.course_id = cert.course_id
         WHERE u.department_id = ? AND cert.revoked = 0
         GROUP BY e.user_id ORDER BY n DESC LIMIT 1`
      )
      .get(user.department_id) as { user_id: number; n: number } | undefined;
    if (top && top.user_id === userId && top.n >= 2) award("departmental_learning_champion");
  }

  return earned;
}

export interface CertificateResult {
  issued: boolean;
  certNo?: string;
  reason?: "already" | "lessons_incomplete" | "exam_not_passed" | "not_enrolled";
}

export function maybeIssueCertificate(userId: number, courseId: number): CertificateResult {
  const db = getDb();
  const enrollment = db
    .prepare("SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?")
    .get(userId, courseId) as { id: number } | undefined;
  if (!enrollment) return { issued: false, reason: "not_enrolled" };

  const existing = db
    .prepare("SELECT cert_no FROM certificates WHERE user_id = ? AND course_id = ? AND revoked = 0")
    .get(userId, courseId) as { cert_no: string } | undefined;
  if (existing) return { issued: false, certNo: existing.cert_no, reason: "already" };

  const totalLessons = (
    db
      .prepare(
        "SELECT COUNT(*) AS n FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = ?"
      )
      .get(courseId) as { n: number }
  ).n;
  const doneLessons = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM lesson_progress lp
         JOIN lessons l ON l.id = lp.lesson_id
         JOIN modules m ON m.id = l.module_id
         WHERE lp.enrollment_id = ? AND m.course_id = ?`
      )
      .get(enrollment.id, courseId) as { n: number }
  ).n;
  if (totalLessons === 0 || doneLessons < totalLessons) {
    return { issued: false, reason: "lessons_incomplete" };
  }

  const course = db
    .prepare("SELECT title, pass_mark FROM courses WHERE id = ?")
    .get(courseId) as { title: string; pass_mark: number } | undefined;
  if (!course) return { issued: false, reason: "exam_not_passed" };

  const passed = db
    .prepare(
      `SELECT at.percent, at.id FROM assessment_attempts at
       JOIN assessments a ON a.id = at.assessment_id
       WHERE at.user_id = ? AND a.course_id = ? AND a.type = 'final_exam' AND at.passed = 1
       ORDER BY at.percent DESC LIMIT 1`
    )
    .get(userId, courseId) as { percent: number; id: number } | undefined;
  if (!passed) return { issued: false, reason: "exam_not_passed" };

  const certNo = newCertificateNumber();
  const score = Math.round(passed.percent * 10) / 10;
  db.prepare(
    "INSERT INTO certificates(cert_no, user_id, course_id, final_score, grade, issued_at, revoked) VALUES(?,?,?,?,?,?,0)"
  ).run(certNo, userId, courseId, score, gradeFor(score), nowIso());
  db.prepare("UPDATE enrollments SET status = 'completed', progress_percent = 100, completed_at = ? WHERE id = ?").run(
    nowIso(),
    enrollment.id
  );

  createNotification({
    userId,
    title: "Certificate issued",
    body: `Congratulations! Your certificate for ${course.title} is ready to download.`,
    type: "success",
    link: "/certificates",
  });
  logAudit({ actorId: userId, action: "certificate.issued", entity: "course", entityId: courseId, details: `Certificate ${certNo} issued with score ${score}%` });
  awardBadges(userId);

  return { issued: true, certNo };
}
