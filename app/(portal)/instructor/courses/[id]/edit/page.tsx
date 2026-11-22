import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Globe,
  Layers,
  Plus,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, humanStatus } from "@/lib/format";
import { isAdministrator } from "@/lib/rbac";
import { PageHeader } from "@/components/ui";
import {
  addLessonAction,
  addModuleAction,
  createAssessmentAction,
  publishCourseAction,
  updateCourseAction,
  uploadMaterialAction,
} from "@/lib/actions/instructor";

export const dynamic = "force-dynamic";

interface CourseRow {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  category_id: number | null;
  level: string;
  duration_minutes: number;
  is_mandatory: number;
  cpd_points: number;
  pass_mark: number;
  max_attempts: number;
  exam_minutes: number;
  objectives_json: string | null;
  status: string;
  legal_review_status: string;
  instructor_id: number | null;
  created_at: string;
  updated_at: string;
  category_name: string | null;
}

const FLASH: Record<string, string> = {
  created: "Draft course created. Add modules and lessons below.",
  "1": "Course details saved.",
  publish: "Course publication status updated.",
  module: "Module added.",
  lesson: "Lesson added.",
  assessment: "Assessment created.",
  material: "Material uploaded.",
};

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const user = await requireUser(["instructor", "super_admin", "training_admin"]);
  const { id } = await params;
  const { saved, error } = await searchParams;
  const courseId = Number(id);
  if (!Number.isInteger(courseId)) notFound();
  const db = getDb();
  const course = db
    .prepare(
      `SELECT c.*, cc.name AS category_name FROM courses c LEFT JOIN course_categories cc ON cc.id = c.category_id WHERE c.id = ?`
    )
    .get(courseId) as CourseRow | undefined;
  if (!course) notFound();
  if (!isAdministrator(user.role as "super_admin") && course.instructor_id !== user.id) notFound();

  const categories = db
    .prepare("SELECT id, name FROM course_categories ORDER BY name")
    .all() as Array<{ id: number; name: string }>;
  const modules = db
    .prepare("SELECT id, title, description, position FROM modules WHERE course_id = ? ORDER BY position, id")
    .all(courseId) as Array<{ id: number; title: string; description: string | null; position: number }>;
  const lessons = db
    .prepare(
      `SELECT l.id, l.title, l.type, l.duration_minutes, l.position, m.id AS module_id
       FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = ? ORDER BY m.position, l.position`
    )
    .all(courseId) as Array<{ id: number; title: string; type: string; duration_minutes: number; position: number; module_id: number }>;
  const assessments = db
    .prepare(
      `SELECT a.id, a.title, a.type, a.pass_mark, a.duration_minutes, a.max_attempts, a.is_published,
              (SELECT COUNT(*) FROM assessment_questions aq WHERE aq.assessment_id = a.id) AS questions
       FROM assessments a WHERE a.course_id = ? ORDER BY a.id`
    )
    .all(courseId) as Array<{
    id: number;
    title: string;
    type: string;
    pass_mark: number;
    duration_minutes: number;
    max_attempts: number;
    is_published: number;
    questions: number;
  }>;
  const materials = db
    .prepare("SELECT id, title, mime, size, created_at FROM materials WHERE course_id = ? ORDER BY created_at DESC")
    .all(courseId) as Array<{ id: number; title: string; mime: string; size: number; created_at: string }>;
  const objectives: string[] = (() => {
    try {
      return JSON.parse(course.objectives_json || "[]");
    } catch {
      return [];
    }
  })();
  const lessonCount = lessons.length;
  const published = course.status === "published";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Course builder · ${course.category_name ?? "Uncategorised"}`}
        title={course.title}
        description={`${humanStatus(course.status)} · updated ${formatDate(course.updated_at)} · ${lessonCount} lessons · ${assessments.length} assessments`}
        actions={
          <>
            <Link href={`/courses/${course.slug}`} className="btn btn-outline btn-sm"><Eye size={14} /> Learner view</Link>
            <Link href="/instructor/courses" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> All courses</Link>
            <form action={publishCourseAction}>
              <input type="hidden" name="courseId" value={course.id} />
              <input type="hidden" name="publish" value={published ? "0" : "1"} />
              <button type="submit" className={published ? "btn btn-danger btn-sm" : "btn btn-gold btn-sm"}>
                <Globe size={14} /> {published ? "Unpublish" : "Publish course"}
              </button>
            </form>
          </>
        }
      />

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-[12.5px] text-green-800 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-200">
          <CheckCircle2 size={15} /> {FLASH[saved] ?? "Changes saved."}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          <AlertTriangle size={15} />
          {error === "lessons" && "Add at least one lesson before publishing."}
          {error === "legal" && "This course cannot be published until the Legal Department approves the content."}
          {error === "upload" && "Select a file to upload."}
          {error === "filetype" && "File rejected. Allowed: PDF, DOCX, PPTX, XLSX, TXT, PNG, JPG, MP4 up to 9 MB."}
          {error === "lesson" && "A lesson needs a title."}
          {error === "assessment" && "An assessment needs a title."}
          {!["lessons", "legal", "upload", "filetype", "lesson", "assessment"].includes(error) && "Something went wrong. Please try again."}
        </div>
      )}

      {course.legal_review_status === "pending" && (
        <div className="flex items-start gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-[12px] text-gold-800 dark:border-gold-900/40 dark:bg-gold-900/20 dark:text-gold-200">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <span>Legal review is pending for this course. A Super Administrator or Training Administrator must approve the content under Governance → Legal review before publication.</span>
        </div>
      )}
      {course.legal_review_status === "rejected" && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>Legal review rejected this content. Revise the material and request review again from the course settings.</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-brand-700 dark:text-brand-300" />
              <h2 className="font-display text-[16px] font-bold text-ink">Curriculum</h2>
              <span className="chip chip-gray">{modules.length} modules · {lessonCount} lessons</span>
            </div>

            <div className="mt-4 space-y-4">
              {modules.length === 0 && <p className="text-[12.5px] text-muted">No modules yet. Add the first module below.</p>}
              {modules.map((m) => {
                const moduleLessons = lessons.filter((l) => l.module_id === m.id);
                return (
                  <div key={m.id} className="rounded-xl border border-line">
                    <div className="flex items-center justify-between gap-3 border-b border-line bg-panel-2 px-4 py-3">
                      <div>
                        <div className="text-[13px] font-semibold text-ink">{m.position}. {m.title}</div>
                        {m.description && <div className="mt-0.5 text-[11px] text-muted">{m.description}</div>}
                      </div>
                      <span className="chip chip-gray">{moduleLessons.length} lessons</span>
                    </div>
                    <div className="divide-y divide-line">
                      {moduleLessons.map((l) => (
                        <div key={l.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                          <div className="min-w-0">
                            <div className="truncate text-[12.5px] text-ink-soft">{l.title}</div>
                            <div className="text-[10px] text-muted">{humanStatus(l.type)} · {l.duration_minutes} min</div>
                          </div>
                          <span className="chip chip-gray !py-0">{humanStatus(l.type)}</span>
                        </div>
                      ))}
                    </div>
                    <details className="group border-t border-line bg-panel">
                      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-4 py-2.5 text-[11.5px] font-semibold text-brand-700 [&::-webkit-details-marker]:hidden dark:text-brand-300">
                        <Plus size={13} /> Add lesson to this module
                      </summary>
                      <form action={addLessonAction} className="space-y-3 px-4 pb-4">
                        <input type="hidden" name="courseId" value={course.id} />
                        <input type="hidden" name="moduleId" value={m.id} />
                        <div className="grid gap-3 sm:grid-cols-[1.6fr_0.9fr_0.6fr]">
                          <input name="title" className="input" placeholder="Lesson title" required />
                          <select name="type" className="select" defaultValue="reading">
                            <option value="reading">Reading</option>
                            <option value="video">Video</option>
                            <option value="interactive">Interactive</option>
                          </select>
                          <input name="minutes" type="number" min={1} max={240} defaultValue={10} className="input" aria-label="Minutes" />
                        </div>
                        <input name="videoUrl" className="input" placeholder="Video URL (optional)" />
                        <textarea name="content" className="textarea min-h-[90px]" placeholder="Lesson content — Markdown supported (## headings, **bold**, - lists)" />
                        <button type="submit" className="btn btn-primary btn-sm">Add lesson</button>
                      </form>
                    </details>
                  </div>
                );
              })}
            </div>

            <details className="group mt-4 rounded-xl border border-dashed border-line-strong">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 px-4 py-3 text-[12px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <Plus size={14} /> Add a module
              </summary>
              <form action={addModuleAction} className="space-y-3 px-4 pb-4">
                <input type="hidden" name="courseId" value={course.id} />
                <input name="title" className="input" placeholder="Module title" required />
                <input name="description" className="input" placeholder="Short module description (optional)" />
                <button type="submit" className="btn btn-primary btn-sm">Add module</button>
              </form>
            </details>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-brand-700 dark:text-brand-300" />
              <h2 className="font-display text-[16px] font-bold text-ink">Assessments</h2>
            </div>
            <div className="mt-4 space-y-2">
              {assessments.length === 0 && (
                <p className="text-[12.5px] text-muted">No assessments yet. Knowledge checks can be linked to a module; the final exam is required for certification.</p>
              )}
              {assessments.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-panel-2 px-3.5 py-2.5">
                  <div>
                    <div className="text-[12.5px] font-semibold text-ink">{a.title}</div>
                    <div className="text-[10.5px] text-muted">
                      {humanStatus(a.type)} · {a.questions} questions · pass {a.pass_mark}% · {a.duration_minutes ? `${a.duration_minutes} min` : "untimed"} · {a.max_attempts} attempts
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`chip ${a.is_published ? "chip-green" : "chip-gray"}`}>{a.is_published ? "Published" : "Draft"}</span>
                    <Link href={`/instructor/question-bank?course=${course.id}&assessment=${a.id}`} className="btn btn-outline btn-sm">Manage questions</Link>
                  </div>
                </div>
              ))}
            </div>

            <details className="group mt-4 rounded-xl border border-dashed border-line-strong">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 px-4 py-3 text-[12px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                <Plus size={14} /> Create assessment
              </summary>
              <form action={createAssessmentAction} className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
                <input type="hidden" name="courseId" value={course.id} />
                <div className="sm:col-span-2"><input name="title" className="input" placeholder="Assessment title" required /></div>
                <div>
                  <label className="label">Type</label>
                  <select name="type" className="select" defaultValue="knowledge_check">
                    <option value="knowledge_check">Knowledge check</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="final_exam">Final examination</option>
                  </select>
                </div>
                <div>
                  <label className="label">Link to module (optional)</label>
                  <select name="moduleId" className="select" defaultValue="">
                    <option value="">Course-wide</option>
                    {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Pass mark (%)</label>
                  <input name="passMark" type="number" min={1} max={100} defaultValue={course.pass_mark} className="input" />
                </div>
                <div>
                  <label className="label">Duration (minutes, 0 = untimed)</label>
                  <input name="durationMinutes" type="number" min={0} max={240} defaultValue={course.exam_minutes} className="input" />
                </div>
                <div>
                  <label className="label">Maximum attempts</label>
                  <input name="maxAttempts" type="number" min={1} max={10} defaultValue={course.max_attempts} className="input" />
                </div>
                <div className="sm:col-span-2"><textarea name="instructions" className="textarea min-h-[70px]" placeholder="Instructions shown before the assessment starts" /></div>
                <div className="sm:col-span-2"><button type="submit" className="btn btn-primary btn-sm">Create assessment</button></div>
              </form>
            </details>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-brand-700 dark:text-brand-300" />
              <h2 className="font-display text-[16px] font-bold text-ink">Course details</h2>
            </div>
            <form action={updateCourseAction} className="mt-4 space-y-3.5">
              <input type="hidden" name="courseId" value={course.id} />
              <div>
                <label className="label" htmlFor="title">Title</label>
                <input id="title" name="title" defaultValue={course.title} className="input" required />
              </div>
              <div>
                <label className="label" htmlFor="summary">Summary</label>
                <input id="summary" name="summary" defaultValue={course.summary} className="input" required />
              </div>
              <div>
                <label className="label" htmlFor="description">Description</label>
                <textarea id="description" name="description" defaultValue={course.description ?? ""} className="textarea min-h-[90px]" />
              </div>
              <div>
                <label className="label" htmlFor="objectives">Learning objectives</label>
                <textarea id="objectives" name="objectives" defaultValue={objectives.join("\n")} className="textarea min-h-[90px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <select name="categoryId" className="select" defaultValue={course.category_id ?? ""}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Level</label>
                  <select name="level" className="select" defaultValue={course.level}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="label">Duration (min)</label>
                  <input name="durationMinutes" type="number" defaultValue={course.duration_minutes} className="input" />
                </div>
                <div>
                  <label className="label">CPD points</label>
                  <input name="cpdPoints" type="number" defaultValue={course.cpd_points} className="input" />
                </div>
                <div>
                  <label className="label">Pass mark (%)</label>
                  <input name="passMark" type="number" defaultValue={course.pass_mark} className="input" />
                </div>
                <div>
                  <label className="label">Attempts</label>
                  <input name="maxAttempts" type="number" defaultValue={course.max_attempts} className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">Default exam timer (min)</label>
                  <input name="examMinutes" type="number" defaultValue={course.exam_minutes} className="input" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[12px] text-ink-soft">
                <input type="checkbox" name="mandatory" defaultChecked={Boolean(course.is_mandatory)} className="accent-[#16437f]" /> Mandatory course
              </label>
              <button type="submit" className="btn btn-primary btn-sm w-full">Save details</button>
            </form>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <Upload size={16} className="text-brand-700 dark:text-brand-300" />
              <h2 className="font-display text-[16px] font-bold text-ink">Materials</h2>
            </div>
            {materials.length > 0 ? (
              <div className="mt-3 space-y-2">
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-[12px] font-medium text-ink">{m.title}</div>
                      <div className="text-[10px] text-muted">{(m.size / 1024).toFixed(0)} KB · {formatDate(m.created_at)}</div>
                    </div>
                    <a href={`/api/materials/${m.id}`} className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">Open</a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[11.5px] text-muted">No materials uploaded.</p>
            )}
            <form action={uploadMaterialAction} className="mt-3 space-y-2.5">
              <input type="hidden" name="courseId" value={course.id} />
              <input name="title" className="input" placeholder="Display title (optional)" />
              <input name="file" type="file" className="input file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-[11px]" accept=".pdf,.docx,.pptx,.xlsx,.txt,.png,.jpg,.mp4" required />
              <button type="submit" className="btn btn-outline btn-sm w-full"><Upload size={13} /> Upload material</button>
            </form>
            <p className="mt-2 text-[10px] leading-relaxed text-muted">Files are virus-scanned in production. Allowed: PDF, DOCX, PPTX, XLSX, TXT, PNG, JPG, MP4 · max 9 MB.</p>
          </section>

          <section className="rounded-xl border border-line bg-panel-2 p-4 text-[11px] leading-relaxed text-muted">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-ink"><BookOpen size={15} /> Course readiness</div>
            <ul className="mt-2 space-y-1.5">
              <li>{lessonCount > 0 ? "✓" : "○"} At least one lesson</li>
              <li>{assessments.some((a) => a.type === "final_exam" && a.questions > 0) ? "✓" : "○"} Final exam with questions</li>
              <li>{course.legal_review_status === "not_required" || course.legal_review_status === "approved" ? "✓" : "○"} Legal review satisfied</li>
              <li>{course.status === "published" ? "✓" : "○"} Published to catalogue</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
