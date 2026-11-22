import Link from "next/link";
import { BookOpen, Eye, Pencil, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, humanStatus } from "@/lib/format";
import { isAdministrator, canManageCourses } from "@/lib/rbac";
import { EmptyState, PageHeader, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function InstructorCoursesPage() {
  const user = await requireUser(["instructor", "super_admin", "training_admin"]);
  const db = getDb();
  const admin = isAdministrator(user.role as "super_admin");

  const rows = db
    .prepare(
      `SELECT c.id, c.slug, c.title, c.level, c.status, c.legal_review_status, c.updated_at,
              cat.name AS category_name,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS enrolled,
              (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status='completed') AS completed,
              (SELECT ROUND(AVG(e.progress_percent)) FROM enrollments e WHERE e.course_id = c.id) AS avg_progress,
              (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS modules,
              (SELECT COUNT(*) FROM assessments a WHERE a.course_id = c.id) AS assessments,
              (SELECT COUNT(*) FROM questions q WHERE q.course_id = c.id) AS questions
       FROM courses c LEFT JOIN course_categories cat ON cat.id = c.category_id
       WHERE ${admin ? "1=1" : "c.instructor_id = ?"}
       ORDER BY c.status = 'draft' DESC, c.updated_at DESC`
    )
    .all(...(admin ? [] : [user.id])) as Array<{
    id: number;
    slug: string;
    title: string;
    level: string;
    status: string;
    legal_review_status: string;
    updated_at: string;
    category_name: string | null;
    enrolled: number;
    completed: number;
    avg_progress: number | null;
    modules: number;
    assessments: number;
    questions: number;
  }>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Course management"
        title={admin ? "All courses" : "My courses"}
        description="Draft, publish and maintain course content. Publishing requires at least one lesson and, for legal content, Legal Department approval."
        actions={
          canManageCourses(user.role) ? (
            <Link href="/instructor/courses/new" className="btn btn-primary btn-sm"><Plus size={14} /> Create course</Link>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total courses" value={rows.length} icon={<BookOpen size={18} />} />
        <StatCard label="Published" value={rows.filter((r) => r.status === "published").length} tone="green" />
        <StatCard label="Draft / in review" value={rows.filter((r) => r.status !== "published").length} tone="gold" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={24} />}
          title="No courses assigned yet"
          description="Create a new course to get started."
          action={<Link href="/instructor/courses/new" className="btn btn-primary btn-sm">Create course</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Content</th>
                  <th>Learners</th>
                  <th>Avg progress</th>
                  <th>Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-semibold text-ink">{c.title}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted">
                        <span>{c.category_name ?? "Uncategorised"}</span>
                        <span>· {c.level}</span>
                        {c.legal_review_status === "pending" && <span className="chip chip-gold !py-0">Legal review</span>}
                        {c.legal_review_status === "rejected" && <span className="chip chip-red !py-0">Legal rejected</span>}
                      </div>
                    </td>
                    <td><span className={`chip ${c.status === "published" ? "chip-green" : "chip-gray"}`}>{humanStatus(c.status)}</span></td>
                    <td className="text-[11.5px] text-muted">{c.modules} modules · {c.assessments} assessments · {c.questions} questions</td>
                    <td className="text-[11.5px] text-muted">{c.enrolled} enrolled<br /><span className="text-[10.5px]">{c.completed} completed</span></td>
                    <td className="w-32">
                      <div className="text-[11px] font-semibold text-ink">{c.avg_progress ?? 0}%</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-brand-700 dark:bg-brand-400" style={{ width: `${c.avg_progress ?? 0}%` }} />
                      </div>
                    </td>
                    <td className="text-[11px] text-muted">{formatDate(c.updated_at)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status === "published" && (
                          <Link href={`/courses/${c.slug}`} className="btn btn-ghost btn-sm" title="Preview"><Eye size={14} /></Link>
                        )}
                        <Link href={`/instructor/courses/${c.id}/edit`} className="btn btn-outline btn-sm"><Pencil size={13} /> Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
