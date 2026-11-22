import { getDb } from "./db";
import type { CourseCardData } from "@/components/ui";

export interface CourseListRow extends CourseCardData {
  id: number;
  categoryId: number | null;
  progress: number | null;
  enrollmentStatus: string | null;
  rating: number;
  enrolledCount: number;
}

const BASE = `
  SELECT c.id, c.slug, c.title, c.summary, c.level, c.duration_minutes AS durationMinutes,
         c.is_mandatory AS isMandatory, c.cpd_points AS cpdPoints,
         c.legal_review_status AS legalReview, cat.name AS categoryName, cat.id AS categoryId,
         TRIM(COALESCE(i.first_name, '') || ' ' || COALESCE(i.last_name, '')) AS instructorName,
         (SELECT COUNT(*) FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = c.id) AS lessonCount,
         (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS moduleCount,
         e.progress_percent AS progress, e.status AS enrollmentStatus,
         COALESCE((SELECT ROUND(AVG(f.rating), 1) FROM course_feedback f WHERE f.course_id = c.id), 0) AS rating,
         (SELECT COUNT(*) FROM enrollments en WHERE en.course_id = c.id) AS enrolledCount
  FROM courses c
  LEFT JOIN course_categories cat ON cat.id = c.category_id
  LEFT JOIN users i ON i.id = c.instructor_id
  LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = ?
`;

export function getCourseCards(
  userId: number,
  opts: {
    q?: string;
    category?: string;
    level?: string;
    sort?: string;
    onlyEnrolled?: boolean;
    mandatory?: boolean;
    limit?: number;
  } = {}
): CourseListRow[] {
  const db = getDb();
  const where: string[] = ["c.status = 'published'"];
  const params: Array<string | number> = [userId];
  if (opts.q) {
    where.push("(c.title LIKE ? OR c.summary LIKE ? OR cat.name LIKE ?)");
    const like = `%${opts.q}%`;
    params.push(like, like, like);
  }
  if (opts.category) {
    where.push("cat.slug = ?");
    params.push(opts.category);
  }
  if (opts.level) {
    where.push("c.level = ?");
    params.push(opts.level);
  }
  if (opts.onlyEnrolled) where.push("e.id IS NOT NULL");
  if (opts.mandatory) where.push("c.is_mandatory = 1");
  let order = "c.is_mandatory DESC, c.id ASC";
  if (opts.sort === "newest") order = "c.published_at DESC, c.id DESC";
  if (opts.sort === "popular") order = "enrolledCount DESC, c.id ASC";
  if (opts.sort === "rating") order = "rating DESC, c.id ASC";
  if (opts.sort === "duration") order = "c.duration_minutes ASC";
  const limit = opts.limit ? `LIMIT ${Math.max(1, Math.floor(opts.limit))}` : "";
  return db
    .prepare(`${BASE} WHERE ${where.join(" AND ")} ORDER BY ${order} ${limit}`)
    .all(...params) as unknown as CourseListRow[];
}

export function getCourseCard(userId: number, slug: string): CourseListRow | undefined {
  const db = getDb();
  return db
    .prepare(`${BASE} WHERE c.slug = ? AND c.status = 'published'`)
    .get(userId, slug) as unknown as CourseListRow | undefined;
}

export function categories(): Array<{ id: number; name: string; slug: string; count: number }> {
  return getDb()
    .prepare(
      `SELECT cc.id, cc.name, cc.slug,
              (SELECT COUNT(*) FROM courses c WHERE c.category_id = cc.id AND c.status = 'published') AS count
       FROM course_categories cc ORDER BY cc.name`
    )
    .all() as unknown as Array<{ id: number; name: string; slug: string; count: number }>;
}

export function recommendCourses(userId: number, limit = 3): CourseListRow[] {
  const db = getDb();
  const affinity = db
    .prepare(
      `SELECT DISTINCT c.category_id AS id, AVG(CASE WHEN e.status = 'completed' THEN 2 ELSE 1 END) AS weight
       FROM enrollments e JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = ? AND c.category_id IS NOT NULL GROUP BY c.category_id`
    )
    .all(userId) as Array<{ id: number; weight: number }>;
  const weights = new Map(affinity.map((a) => [a.id, a.weight]));
  const candidates = db
    .prepare(`${BASE} WHERE c.status = 'published' AND e.id IS NULL ORDER BY c.is_mandatory DESC, c.id ASC`)
    .all(userId) as unknown as CourseListRow[];
  return candidates
    .map((c) => {
      const score = (c.isMandatory ? 6 : 0) + (c.categoryId ? (weights.get(c.categoryId) ?? 0) : 0) + c.rating * 0.6;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.c);
}

export function mandatoryCompliance(userId: number, departmentId: number | null): { assigned: number; completed: number } {
  const db = getDb();
  const assigned = db
    .prepare(
      `SELECT COUNT(DISTINCT c.id) AS n FROM course_assignments ca
       JOIN courses c ON c.id = ca.course_id
       WHERE c.status = 'published' AND (
         ca.scope = 'all' OR ca.user_id = ? OR (ca.scope = 'department' AND ca.department_id = ?)
       )`
    )
    .get(userId, departmentId ?? -1) as { n: number };
  const completed = db
    .prepare(
      `SELECT COUNT(DISTINCT c.id) AS n FROM course_assignments ca
       JOIN courses c ON c.id = ca.course_id
       JOIN enrollments e ON e.course_id = c.id AND e.user_id = ?
       WHERE c.status = 'published' AND e.status = 'completed' AND (
         ca.scope = 'all' OR ca.user_id = ? OR (ca.scope = 'department' AND ca.department_id = ?)
       )`
    )
    .get(userId, userId, departmentId ?? -1) as { n: number };
  return { assigned: assigned.n, completed: completed.n };
}
