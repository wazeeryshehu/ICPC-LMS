"use server";

import { redirect } from "next/navigation";
import { getDb, nowIso } from "@/lib/db";
import { getClientIp, logAudit, requireUser } from "@/lib/auth";
import { createNotification } from "@/lib/achievements";
import { attemptCount, enrollmentProgress, ensureEnrollment, recalcEnrollment } from "@/lib/learning";
import { maybeIssueCertificate } from "@/lib/achievements";

interface QuestionRow {
  id: number;
  type: string;
  prompt: string;
  options_json: string | null;
  correct_json: string | null;
  explanation: string | null;
  points: number;
}

function parseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,;:!?]+$/g, "");
}

function gradeQuestion(q: QuestionRow, answer: unknown): { auto: number | null; correct: number | null } {
  const correct = parseJson<unknown>(q.correct_json);
  switch (q.type) {
    case "mcq":
      return { auto: Number(answer) === Number(correct) ? q.points : 0, correct: Number(answer) === Number(correct) ? 1 : 0 };
    case "true_false": {
      const isCorrect = String(answer) === String(correct);
      return { auto: isCorrect ? q.points : 0, correct: isCorrect ? 1 : 0 };
    }
    case "multi": {
      const given = Array.isArray(answer) ? answer.map(String).sort() : [];
      const expected = Array.isArray(correct) ? (correct as unknown[]).map(String).sort() : [];
      const isCorrect = given.length === expected.length && given.every((v, i) => v === expected[i]);
      return { auto: isCorrect ? q.points : 0, correct: isCorrect ? 1 : 0 };
    }
    case "fill": {
      const accepted = (Array.isArray(correct) ? correct : [correct]).map((v) => normalize(String(v)));
      const isCorrect = accepted.includes(normalize(String(answer ?? "")));
      return { auto: isCorrect ? q.points : 0, correct: isCorrect ? 1 : 0 };
    }
    case "matching": {
      const expected = (correct ?? {}) as Record<string, string>;
      const given = (answer ?? {}) as Record<string, string>;
      const keys = Object.keys(expected);
      const isCorrect = keys.length > 0 && keys.every((k) => normalize(given[k] ?? "") === normalize(expected[k]));
      return { auto: isCorrect ? q.points : 0, correct: isCorrect ? 1 : 0 };
    }
    case "short_answer":
    case "essay":
    default:
      return { auto: null, correct: null };
  }
}

export async function enrollAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const courseId = Number(formData.get("courseId"));
  const slug = String(formData.get("slug") ?? "");
  const db = getDb();
  const course = db.prepare("SELECT id, slug, status FROM courses WHERE id = ?").get(courseId) as
    | { id: number; slug: string; status: string }
    | undefined;
  if (!course || course.status !== "published") redirect("/courses");

  const existing = db
    .prepare("SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?")
    .get(user.id, courseId) as { id: number } | undefined;
  if (!existing) {
    ensureEnrollment(user.id, courseId, "self");
    logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "enrollment.created", entity: "course", entityId: courseId, details: `Self-enrolled in ${course.slug}`, ip: await getClientIp() });
  }
  redirect(`/learn/${slug || course.slug}`);
}

export async function completeLessonAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const lessonId = Number(formData.get("lessonId"));
  const slug = String(formData.get("slug") ?? "");
  const db = getDb();
  const lesson = db
    .prepare(
      `SELECT l.id, l.position, m.position AS module_position, m.course_id, c.slug FROM lessons l
       JOIN modules m ON m.id = l.module_id
       JOIN courses c ON c.id = m.course_id
       WHERE l.id = ?`
    )
    .get(lessonId) as
    | { id: number; position: number; module_position: number; course_id: number; slug: string }
    | undefined;
  if (!lesson) redirect("/courses");

  const enrollment = db
    .prepare("SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?")
    .get(user.id, lesson.course_id) as { id: number } | undefined;
  if (!enrollment) redirect(`/courses/${lesson.slug}`);

  db.prepare("INSERT OR IGNORE INTO lesson_progress(enrollment_id, lesson_id, completed_at) VALUES(?,?,?)").run(
    enrollment.id,
    lesson.id,
    nowIso()
  );
  const progress = recalcEnrollment(user.id, lesson.course_id);
  const cert = maybeIssueCertificate(user.id, lesson.course_id);

  if (progress.percent >= 100) {
    redirect(`/courses/${slug || lesson.slug}?completed=1${cert.issued ? `&cert=1` : ""}`);
  }

  const next = db
    .prepare(
      `SELECT l.id FROM lessons l
       JOIN modules m ON m.id = l.module_id
       WHERE m.course_id = ?
         AND ((m.position = ? AND l.position > ?) OR m.position > ?)
       ORDER BY m.position ASC, l.position ASC LIMIT 1`
    )
    .get(lesson.course_id, lesson.module_position, lesson.position, lesson.module_position) as
    | { id: number }
    | undefined;

  redirect(next ? `/learn/${slug || lesson.slug}?lesson=${next.id}` : `/courses/${slug || lesson.slug}`);
}

export async function startAttemptAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const assessmentId = Number(formData.get("assessmentId"));
  const db = getDb();
  const assessment = db
    .prepare(
      `SELECT a.id, a.course_id, a.type, a.duration_minutes, a.max_attempts, a.is_published, a.title,
              c.slug, c.status
       FROM assessments a JOIN courses c ON c.id = a.course_id WHERE a.id = ?`
    )
    .get(assessmentId) as
    | {
        id: number;
        course_id: number;
        type: string;
        duration_minutes: number;
        max_attempts: number;
        is_published: number;
        title: string;
        slug: string;
        status: string;
      }
    | undefined;
  if (!assessment || !assessment.is_published || assessment.status !== "published") redirect("/courses");

  ensureEnrollment(user.id, assessment.course_id, "self");
  if (assessment.type === "final_exam") {
    const progress = enrollmentProgress(user.id, assessment.course_id);
    if (progress.total > 0 && progress.done < progress.total) {
      redirect(`/courses/${assessment.slug}?locked=1`);
    }
  }
  const existing = db
    .prepare(
      "SELECT id FROM assessment_attempts WHERE user_id = ? AND assessment_id = ? AND status = 'in_progress' ORDER BY id DESC LIMIT 1"
    )
    .get(user.id, assessmentId) as { id: number } | undefined;
  if (existing) {
    redirect(`/learn/${assessment.slug}/exam/${assessmentId}?attempt=${existing.id}`);
  }

  const used = attemptCount(user.id, assessmentId);
  if (used >= assessment.max_attempts) {
    redirect(`/learn/${assessment.slug}/exam/${assessmentId}?limit=1`);
  }

  const startedAt = new Date();
  const deadline =
    assessment.duration_minutes > 0
      ? new Date(startedAt.getTime() + assessment.duration_minutes * 60000).toISOString()
      : null;
  const info = db
    .prepare(
      `INSERT INTO assessment_attempts(assessment_id, user_id, attempt_number, started_at, deadline_at, status)
       VALUES(?,?,?,?,?,?)`
    )
    .run(assessmentId, user.id, used + 1, startedAt.toISOString(), deadline, "in_progress");
  redirect(`/learn/${assessment.slug}/exam/${assessmentId}?attempt=${Number(info.lastInsertRowid)}`);
}

export async function submitAssessmentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const attemptId = Number(formData.get("attemptId"));
  const db = getDb();
  const attempt = db
    .prepare(
      `SELECT at.id, at.user_id, at.status, at.started_at, a.id AS assessment_id, a.title, a.type,
              a.pass_mark, a.show_results, a.course_id, c.slug, c.title AS course_title
       FROM assessment_attempts at
       JOIN assessments a ON a.id = at.assessment_id
       JOIN courses c ON c.id = a.course_id
       WHERE at.id = ?`
    )
    .get(attemptId) as
    | {
        id: number;
        user_id: number;
        status: string;
        started_at: string;
        assessment_id: number;
        title: string;
        type: string;
        pass_mark: number;
        show_results: number;
        course_id: number;
        slug: string;
        course_title: string;
      }
    | undefined;
  if (!attempt || attempt.user_id !== user.id) redirect("/dashboard");
  if (attempt.status !== "in_progress") redirect(`/results/${attemptId}`);

  const questions = db
    .prepare(
      `SELECT q.id, q.type, q.prompt, q.options_json, q.correct_json, q.explanation, aq.points
       FROM assessment_questions aq JOIN questions q ON q.id = aq.question_id
       WHERE aq.assessment_id = ? ORDER BY aq.position ASC`
    )
    .all(attempt.assessment_id) as unknown as QuestionRow[];

  let autoScore = 0;
  let maxAuto = 0;
  let maxTotal = 0;
  let manualPending = 0;

  for (const q of questions) {
    maxTotal += q.points;
    let answer: unknown = null;
    if (q.type === "multi") {
      answer = formData.getAll(`q_${q.id}`).map(String);
    } else if (q.type === "matching") {
      const pairs = parseJson<Array<{ left: string; right: string }>>(q.options_json) ?? [];
      const mapping: Record<string, string> = {};
      pairs.forEach((pair, idx) => {
        mapping[pair.left] = String(formData.get(`q_${q.id}__${idx}`) ?? "");
      });
      answer = mapping;
    } else {
      const raw = formData.get(`q_${q.id}`);
      answer = raw === null ? "" : String(raw);
    }

    if (q.type === "short_answer" || q.type === "essay" || q.type === "scenario") {
      manualPending++;
      db.prepare(
        "INSERT INTO attempt_responses(attempt_id, question_id, answer_json, auto_score, manual_score, is_correct) VALUES(?,?,?,?,?,?)"
      ).run(attempt.id, q.id, JSON.stringify(answer), null, null, null);
      continue;
    }

    maxAuto += q.points;
    const graded = gradeQuestion(q, answer);
    autoScore += graded.auto ?? 0;
    db.prepare(
      "INSERT INTO attempt_responses(attempt_id, question_id, answer_json, auto_score, manual_score, is_correct) VALUES(?,?,?,?,?,?)"
    ).run(attempt.id, q.id, JSON.stringify(answer), graded.auto, null, graded.correct);
  }

  const started = new Date(attempt.started_at).getTime();
  const timeSpent = Math.max(1, Math.round((Date.now() - started) / 1000));

  if (manualPending > 0) {
    db.prepare(
      `UPDATE assessment_attempts SET submitted_at = ?, score = ?, max_score = ?, percent = ?, passed = NULL,
        status = 'submitted', time_spent_seconds = ? WHERE id = ?`
    ).run(nowIso(), autoScore, maxTotal, maxTotal ? Math.round((autoScore / maxTotal) * 1000) / 10 : 0, timeSpent, attempt.id);
    const instructors = db
      .prepare(
        `SELECT DISTINCT u.id FROM courses c JOIN users u ON u.id = c.instructor_id WHERE c.id = ?`
      )
      .all(attempt.course_id) as Array<{ id: number }>;
    for (const inst of instructors) {
      createNotification({
        userId: inst.id,
        title: "Submission awaiting grading",
        body: `${user.first_name} ${user.last_name} submitted ${attempt.title} in ${attempt.course_title}.`,
        type: "info",
        link: "/instructor/grading",
      });
    }
    logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "assessment.submitted", entity: "assessment", entityId: attempt.assessment_id, details: `Attempt ${attempt.id} submitted with ${manualPending} manual item(s) pending` });
    redirect(`/results/${attempt.id}`);
  }

  const percent = maxTotal ? Math.round((autoScore / maxTotal) * 1000) / 10 : 0;
  const passed = percent >= attempt.pass_mark ? 1 : 0;
  db.prepare(
    `UPDATE assessment_attempts SET submitted_at = ?, score = ?, max_score = ?, percent = ?, passed = ?,
      status = 'graded', time_spent_seconds = ?, graded_at = ? WHERE id = ?`
  ).run(nowIso(), autoScore, maxTotal, percent, passed, timeSpent, nowIso(), attempt.id);

  createNotification({
    userId: user.id,
    title: passed ? "Assessment passed" : "Assessment result published",
    body: `${attempt.title}: ${percent}% (pass mark ${attempt.pass_mark}%).`,
    type: passed ? "success" : "warning",
    link: `/results/${attempt.id}`,
  });

  if (attempt.type === "final_exam" && passed) {
    maybeIssueCertificate(user.id, attempt.course_id);
  }
  logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "assessment.graded", entity: "assessment", entityId: attempt.assessment_id, details: `Attempt ${attempt.id} auto-graded at ${percent}%` });

  redirect(`/results/${attempt.id}`);
}

export async function submitFeedbackAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const courseId = Number(formData.get("courseId"));
  const slug = String(formData.get("slug") ?? "");
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating"))));
  const comments = String(formData.get("comments") ?? "").trim().slice(0, 1000);
  const db = getDb();
  const enrolled = db
    .prepare("SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?")
    .get(user.id, courseId);
  if (enrolled) {
    db.prepare(
      `INSERT INTO course_feedback(course_id, user_id, rating, comments, created_at) VALUES(?,?,?,?,?)
       ON CONFLICT(user_id, course_id) DO UPDATE SET rating = excluded.rating, comments = excluded.comments, created_at = excluded.created_at`
    ).run(courseId, user.id, rating, comments, nowIso());
  }
  redirect(`/courses/${slug}?feedback=1`);
}

export async function toggleSessionRegistrationAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const sessionId = Number(formData.get("sessionId"));
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM session_registrations WHERE session_id = ? AND user_id = ?")
    .get(sessionId, user.id) as { id: number } | undefined;
  if (existing) {
    db.prepare("DELETE FROM session_registrations WHERE id = ?").run(existing.id);
  } else {
    const session = db
      .prepare("SELECT title, capacity, (SELECT COUNT(*) FROM session_registrations WHERE session_id = ?) AS taken FROM training_sessions WHERE id = ?")
      .get(sessionId, sessionId) as { title: string; capacity: number; taken: number } | undefined;
    if (session && session.taken < session.capacity) {
      db.prepare("INSERT INTO session_registrations(session_id, user_id, registered_at) VALUES(?,?,?)").run(
        sessionId,
        user.id,
        nowIso()
      );
      createNotification({
        userId: user.id,
        title: "Training session registration confirmed",
        body: `You are registered for ${session.title}.`,
        type: "success",
        link: "/calendar",
      });
    }
  }
  redirect("/calendar");
}
