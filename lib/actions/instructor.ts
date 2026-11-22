"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { getDb, nowIso } from "@/lib/db";
import { uploadsDir } from "@/lib/paths";
import { getClientIp, logAudit, requireUser } from "@/lib/auth";
import { maybeIssueCertificate, createNotification } from "@/lib/achievements";
import { isAdministrator } from "@/lib/rbac";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

async function requireCourseManager() {
  const user = await requireUser(["instructor", "super_admin", "training_admin"]);
  return user;
}

function canEditCourse(userId: number, role: string, courseId: number): boolean {
  const course = getDb().prepare("SELECT instructor_id FROM courses WHERE id = ?").get(courseId) as
    | { instructor_id: number | null }
    | undefined;
  if (!course) return false;
  if (isAdministrator(role as "super_admin")) return true;
  return course.instructor_id === userId;
}

export async function createCourseAction(formData: FormData): Promise<void> {
  const user = await requireCourseManager();
  const db = getDb();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = Number(formData.get("categoryId")) || null;
  const level = String(formData.get("level") ?? "Beginner");
  const duration = Math.max(15, Number(formData.get("durationMinutes")) || 60);
  const cpd = Math.max(0, Number(formData.get("cpdPoints")) || 0);
  const mandatory = formData.get("mandatory") === "on" ? 1 : 0;
  const passMark = Math.min(100, Math.max(1, Number(formData.get("passMark")) || 60));
  const maxAttempts = Math.max(1, Number(formData.get("maxAttempts")) || 3);
  const examMinutes = Math.max(0, Number(formData.get("examMinutes")) || 30);
  const objectives = String(formData.get("objectives") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (title.length < 5 || summary.length < 10 || !categoryId) {
    redirect("/instructor/courses/new?error=invalid");
  }

  const category = db.prepare("SELECT name, slug FROM course_categories WHERE id = ?").get(categoryId) as
    | { name: string; slug: string }
    | undefined;
  if (!category) redirect("/instructor/courses/new?error=invalid");

  let slug = slugify(title);
  let suffix = 1;
  while (db.prepare("SELECT 1 FROM courses WHERE slug = ?").get(slug)) {
    slug = `${slugify(title)}-${++suffix}`;
  }

  const legal = /legal|regulat|ethics/i.test(category.name);
  const info = db
    .prepare(
      `INSERT INTO courses(slug, title, summary, description, category_id, level, duration_minutes, instructor_id, created_by,
        status, legal_review_status, is_mandatory, cpd_points, pass_mark, max_attempts, exam_minutes, objectives_json,
        prerequisites_json, created_at, updated_at)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .run(
      slug,
      title,
      summary,
      description || summary,
      categoryId,
      level,
      duration,
      user.id,
      user.id,
      "draft",
      legal ? "pending" : "not_required",
      mandatory,
      cpd,
      passMark,
      maxAttempts,
      examMinutes,
      JSON.stringify(objectives),
      JSON.stringify([]),
      nowIso(),
      nowIso()
    );

  if (legal) {
    db.prepare("INSERT INTO course_reviews(course_id, reviewer_id, status, comments, created_at) VALUES(?,?,?,?,?)").run(
      Number(info.lastInsertRowid),
      null,
      "pending",
      "Awaiting Legal Department review of legal content.",
      nowIso()
    );
  }
  logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "course.created", entity: "course", entityId: Number(info.lastInsertRowid), details: `${title} created as draft`, ip: await getClientIp() });
  redirect(`/instructor/courses/${Number(info.lastInsertRowid)}/edit?created=1`);
}

export async function updateCourseAction(formData: FormData): Promise<void> {
  const user = await requireCourseManager();
  const courseId = Number(formData.get("courseId"));
  if (!canEditCourse(user.id, user.role, courseId)) redirect("/instructor/courses");

  const db = getDb();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = Number(formData.get("categoryId")) || null;
  const level = String(formData.get("level") ?? "Beginner");
  const duration = Math.max(15, Number(formData.get("durationMinutes")) || 60);
  const cpd = Math.max(0, Number(formData.get("cpdPoints")) || 0);
  const mandatory = formData.get("mandatory") === "on" ? 1 : 0;
  const passMark = Math.min(100, Math.max(1, Number(formData.get("passMark")) || 60));
  const maxAttempts = Math.max(1, Number(formData.get("maxAttempts")) || 3);
  const examMinutes = Math.max(0, Number(formData.get("examMinutes")) || 30);
  const objectives = String(formData.get("objectives") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  db.prepare(
    `UPDATE courses SET title=?, summary=?, description=?, category_id=?, level=?, duration_minutes=?, is_mandatory=?,
      cpd_points=?, pass_mark=?, max_attempts=?, exam_minutes=?, objectives_json=?, updated_at=? WHERE id=?`
  ).run(title, summary, description, categoryId, level, duration, mandatory, cpd, passMark, maxAttempts, examMinutes, JSON.stringify(objectives), nowIso(), courseId);

  logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "course.updated", entity: "course", entityId: courseId, details: `${title} details updated`, ip: await getClientIp() });
  redirect(`/instructor/courses/${courseId}/edit?saved=1`);
}

export async function publishCourseAction(formData: FormData): Promise<void> {
  const user = await requireCourseManager();
  const courseId = Number(formData.get("courseId"));
  const publish = String(formData.get("publish")) === "1";
  if (!canEditCourse(user.id, user.role, courseId)) redirect("/instructor/courses");
  const db = getDb();
  const course = db
    .prepare(
      `SELECT c.title, c.legal_review_status, c.status,
              (SELECT COUNT(*) FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = c.id) AS lessons,
              (SELECT COUNT(*) FROM assessments a WHERE a.course_id = c.id AND a.type = 'final_exam') AS exams
       FROM courses c WHERE c.id = ?`
    )
    .get(courseId) as { title: string; legal_review_status: string; status: string; lessons: number; exams: number } | undefined;
  if (!course) redirect("/instructor/courses");

  if (publish) {
    if (course.lessons < 1) redirect(`/instructor/courses/${courseId}/edit?error=lessons`);
    if (course.legal_review_status === "pending" || course.legal_review_status === "demo_pending") {
      redirect(`/instructor/courses/${courseId}/edit?error=legal`);
    }
    db.prepare("UPDATE courses SET status='published', published_at=?, approved_by=?, updated_at=? WHERE id=?").run(
      nowIso(),
      isAdministrator(user.role as "super_admin") ? user.id : null,
      nowIso(),
      courseId
    );
    logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "course.published", entity: "course", entityId: courseId, details: `${course.title} published`, ip: await getClientIp() });
  } else {
    db.prepare("UPDATE courses SET status='draft', updated_at=? WHERE id=?").run(nowIso(), courseId);
    logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "course.unpublished", entity: "course", entityId: courseId, details: `${course.title} returned to draft`, ip: await getClientIp() });
  }
  redirect(`/instructor/courses/${courseId}/edit?saved=publish`);
}

export async function addModuleAction(formData: FormData): Promise<void> {
  const user = await requireCourseManager();
  const courseId = Number(formData.get("courseId"));
  if (!canEditCourse(user.id, user.role, courseId)) redirect("/instructor/courses");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) redirect(`/instructor/courses/${courseId}/edit`);
  const db = getDb();
  const pos = (db.prepare("SELECT COALESCE(MAX(position),0)+1 AS p FROM modules WHERE course_id = ?").get(courseId) as { p: number }).p;
  db.prepare("INSERT INTO modules(course_id, title, description, position) VALUES(?,?,?,?)").run(courseId, title, description || null, pos);
  db.prepare("UPDATE courses SET updated_at=? WHERE id=?").run(nowIso(), courseId);
  redirect(`/instructor/courses/${courseId}/edit?saved=module`);
}

export async function addLessonAction(formData: FormData): Promise<void> {
  const user = await requireCourseManager();
  const courseId = Number(formData.get("courseId"));
  const moduleId = Number(formData.get("moduleId"));
  if (!canEditCourse(user.id, user.role, courseId)) redirect("/instructor/courses");
  const db = getDb();
  const module = db.prepare("SELECT id FROM modules WHERE id = ? AND course_id = ?").get(moduleId, courseId);
  if (!module) redirect(`/instructor/courses/${courseId}/edit`);
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "reading");
  const content = String(formData.get("content") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const minutes = Math.max(1, Number(formData.get("minutes")) || 10);
  if (!title) redirect(`/instructor/courses/${courseId}/edit?error=lesson`);
  const pos = (db.prepare("SELECT COALESCE(MAX(position),0)+1 AS p FROM lessons WHERE module_id = ?").get(moduleId) as { p: number }).p;
  db.prepare(
    "INSERT INTO lessons(module_id, title, type, content, video_url, duration_minutes, position) VALUES(?,?,?,?,?,?,?)"
  ).run(moduleId, title, type, content || null, videoUrl || null, minutes, pos);
  db.prepare("UPDATE courses SET updated_at=? WHERE id=?").run(nowIso(), courseId);
  redirect(`/instructor/courses/${courseId}/edit?saved=lesson`);
}

export async function createAssessmentAction(formData: FormData): Promise<void> {
  const user = await requireCourseManager();
  const courseId = Number(formData.get("courseId"));
  if (!canEditCourse(user.id, user.role, courseId)) redirect("/instructor/courses");
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "quiz");
  const moduleId = Number(formData.get("moduleId")) || null;
  const passMark = Math.min(100, Math.max(1, Number(formData.get("passMark")) || 50));
  const duration = Math.max(0, Number(formData.get("durationMinutes")) || 0);
  const maxAttempts = Math.max(1, Number(formData.get("maxAttempts")) || 3);
  const instructions = String(formData.get("instructions") ?? "").trim();
  if (!title) redirect(`/instructor/courses/${courseId}/edit?error=assessment`);
  getDb()
    .prepare(
      `INSERT INTO assessments(course_id, module_id, title, type, instructions, pass_mark, duration_minutes, max_attempts,
        question_count, shuffle, show_results, is_published, created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .run(courseId, moduleId, title, type, instructions || null, passMark, duration, maxAttempts, 0, 0, 1, 1, nowIso());
  redirect(`/instructor/courses/${courseId}/edit?saved=assessment`);
}

export async function createQuestionAction(formData: FormData): Promise<void> {
  const user = await requireCourseManager();
  const courseId = Number(formData.get("courseId"));
  if (!canEditCourse(user.id, user.role, courseId)) redirect("/instructor/question-bank");
  const db = getDb();
  const type = String(formData.get("type") ?? "mcq");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const points = Math.max(1, Number(formData.get("points")) || 1);
  const difficulty = String(formData.get("difficulty") ?? "medium");
  const assessmentId = Number(formData.get("assessmentId")) || 0;
  const optionsRaw = String(formData.get("options") ?? "").trim();
  const correctRaw = String(formData.get("correct") ?? "").trim();

  if (!prompt) redirect(`/instructor/question-bank?course=${courseId}&error=prompt`);

  let options: unknown = null;
  let correct: unknown = null;

  if (type === "mcq" || type === "multi") {
    options = optionsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
    if ((options as string[]).length < 2) redirect(`/instructor/question-bank?course=${courseId}&error=options`);
    if (type === "mcq") {
      const idx = Number(correctRaw) - 1;
      if (!Number.isInteger(idx) || idx < 0 || idx >= (options as string[]).length) {
        redirect(`/instructor/question-bank?course=${courseId}&error=correct`);
      }
      correct = idx;
    } else {
      const idxs = correctRaw
        .split(/[,\s]+/)
        .map((s) => Number(s) - 1)
        .filter((n) => Number.isInteger(n) && n >= 0 && n < (options as string[]).length);
      if (!idxs.length) redirect(`/instructor/question-bank?course=${courseId}&error=correct`);
      correct = idxs;
    }
  } else if (type === "true_false") {
    const val = correctRaw.toLowerCase();
    if (val !== "true" && val !== "false") redirect(`/instructor/question-bank?course=${courseId}&error=correct`);
    correct = val === "true";
  } else if (type === "fill") {
    const accepted = correctRaw.split("|").map((s) => s.trim()).filter(Boolean);
    if (!accepted.length) redirect(`/instructor/question-bank?course=${courseId}&error=correct`);
    correct = accepted;
  } else if (type === "matching") {
    const pairs = optionsRaw
      .split("\n")
      .map((line) => line.split("=").map((s) => s.trim()))
      .filter((p) => p.length === 2 && p[0] && p[1])
      .map(([left, right]) => ({ left, right }));
    if (pairs.length < 2) redirect(`/instructor/question-bank?course=${courseId}&error=options`);
    options = pairs;
    correct = Object.fromEntries(pairs.map((p) => [p.left, p.right]));
  } else {
    options = null;
    correct = null;
  }

  const info = db
    .prepare(
      "INSERT INTO questions(course_id, type, prompt, options_json, correct_json, explanation, points, difficulty, created_at) VALUES(?,?,?,?,?,?,?,?,?)"
    )
    .run(
      courseId,
      type,
      prompt,
      options ? JSON.stringify(options) : null,
      correct === null ? null : JSON.stringify(correct),
      explanation || null,
      points,
      difficulty,
      nowIso()
    );
  const questionId = Number(info.lastInsertRowid);
  if (assessmentId) {
    const assessment = db
      .prepare("SELECT id FROM assessments WHERE id = ? AND course_id = ?")
      .get(assessmentId, courseId);
    if (assessment) {
      const pos = (db.prepare("SELECT COALESCE(MAX(position),0)+1 AS p FROM assessment_questions WHERE assessment_id = ?").get(assessmentId) as { p: number }).p;
      db.prepare("INSERT INTO assessment_questions(assessment_id, question_id, position, points) VALUES(?,?,?,?)").run(
        assessmentId,
        questionId,
        pos,
        points
      );
    }
  }
  logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "question.created", entity: "question", entityId: questionId, details: `${type} question added to course ${courseId}`, ip: await getClientIp() });
  redirect(`/instructor/question-bank?course=${courseId}&saved=1`);
}

export async function deleteQuestionAction(formData: FormData): Promise<void> {
  const user = await requireCourseManager();
  const questionId = Number(formData.get("questionId"));
  const courseId = Number(formData.get("courseId"));
  if (!canEditCourse(user.id, user.role, courseId)) redirect("/instructor/question-bank");
  const db = getDb();
  const linked = db.prepare("SELECT COUNT(*) AS n FROM attempt_responses WHERE question_id = ?").get(questionId) as { n: number };
  if (linked.n === 0) {
    db.prepare("DELETE FROM questions WHERE id = ? AND course_id = ?").run(questionId, courseId);
    logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "question.deleted", entity: "question", entityId: questionId, details: "Question removed from bank", ip: await getClientIp() });
  }
  redirect(`/instructor/question-bank?course=${courseId}`);
}

export async function uploadMaterialAction(formData: FormData): Promise<void> {
  const user = await requireCourseManager();
  const courseId = Number(formData.get("courseId"));
  if (!canEditCourse(user.id, user.role, courseId)) redirect("/instructor/courses");
  const file = formData.get("file");
  const title = String(formData.get("title") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) redirect(`/instructor/courses/${courseId}/edit?error=upload`);

  const allowed: Record<string, string> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "text/plain": "txt",
    "image/png": "png",
    "image/jpeg": "jpg",
    "video/mp4": "mp4",
  };
  if (file.size > 9 * 1024 * 1024 || !allowed[file.type]) {
    redirect(`/instructor/courses/${courseId}/edit?error=filetype`);
  }
  const ext = allowed[file.type];
  const filename = `${randomBytes(12).toString("hex")}.${ext}`;
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  getDb()
    .prepare(
      "INSERT INTO materials(course_id, title, filename, mime, size, uploaded_by, created_at) VALUES(?,?,?,?,?,?,?)"
    )
    .run(courseId, title || file.name, filename, file.type, file.size, user.id, nowIso());
  logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "material.uploaded", entity: "course", entityId: courseId, details: `${title || file.name} uploaded`, ip: await getClientIp() });
  redirect(`/instructor/courses/${courseId}/edit?saved=material`);
}

export async function gradeAttemptAction(formData: FormData): Promise<void> {
  const user = await requireUser(["instructor", "super_admin", "training_admin"]);
  const attemptId = Number(formData.get("attemptId"));
  const db = getDb();
  const attempt = db
    .prepare(
      `SELECT at.id, at.user_id, at.status, at.assessment_id, a.pass_mark, a.course_id, a.type, a.title,
              c.slug, u.first_name, u.last_name
       FROM assessment_attempts at
       JOIN assessments a ON a.id = at.assessment_id
       JOIN courses c ON c.id = a.course_id
       JOIN users u ON u.id = at.user_id
       WHERE at.id = ?`
    )
    .get(attemptId) as
    | {
        id: number;
        user_id: number;
        status: string;
        assessment_id: number;
        pass_mark: number;
        course_id: number;
        type: string;
        title: string;
        slug: string;
        first_name: string;
        last_name: string;
      }
    | undefined;
  if (!attempt) redirect("/instructor/grading");
  if (attempt.status !== "submitted") redirect(`/results/${attemptId}`);

  const responses = db
    .prepare(
      `SELECT r.id, r.question_id, r.auto_score, q.points, q.type
       FROM attempt_responses r JOIN questions q ON q.id = r.question_id WHERE r.attempt_id = ?`
    )
    .all(attemptId) as Array<{ id: number; question_id: number; auto_score: number | null; points: number; type: string }>;

  let total = 0;
  let maxTotal = 0;
  for (const r of responses) {
    maxTotal += r.points;
    if (r.type === "essay" || r.type === "short_answer" || r.type === "scenario") {
      const raw = formData.get(`score_${r.id}`);
      const feedback = String(formData.get(`feedback_${r.id}`) ?? "").trim();
      const score = Math.max(0, Math.min(r.points, Number(raw) || 0));
      db.prepare(
        "UPDATE attempt_responses SET manual_score=?, feedback=?, graded_by=?, graded_at=?, is_correct=? WHERE id=?"
      ).run(score, feedback || null, user.id, nowIso(), score >= r.points ? 1 : 0, r.id);
      total += score;
    } else {
      total += r.auto_score ?? 0;
    }
  }
  const percent = maxTotal ? Math.round((total / maxTotal) * 1000) / 10 : 0;
  const passed = percent >= attempt.pass_mark ? 1 : 0;
  db.prepare(
    "UPDATE assessment_attempts SET score=?, max_score=?, percent=?, passed=?, status='graded', graded_by=?, graded_at=? WHERE id=?"
  ).run(total, maxTotal, percent, passed, user.id, nowIso(), attemptId);

  createNotification({
    userId: attempt.user_id,
    title: passed ? "Assessment result published — passed" : "Assessment result published",
    body: `${attempt.title}: ${percent}% after manual grading (pass mark ${attempt.pass_mark}%).`,
    type: passed ? "success" : "warning",
    link: `/results/${attemptId}`,
  });
  if (attempt.type === "final_exam" && passed) {
    maybeIssueCertificate(attempt.user_id, attempt.course_id);
  }
  logAudit({ actorId: user.id, actorName: `${user.first_name} ${user.last_name}`, action: "assessment.manually_graded", entity: "assessment", entityId: attempt.assessment_id, details: `Attempt ${attemptId} graded at ${percent}%`, ip: await getClientIp() });
  redirect(`/instructor/grading?saved=${attemptId}`);
}
