import Link from "next/link";
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { createCourseAction } from "@/lib/actions/instructor";

export const dynamic = "force-dynamic";

export default async function NewCoursePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser(["instructor", "super_admin", "training_admin"]);
  const { error } = await searchParams;
  const categories = getDb()
    .prepare("SELECT id, name FROM course_categories ORDER BY name")
    .all() as Array<{ id: number; name: string }>;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Course builder"
        title="Create a new course"
        description="Courses start as drafts. Add modules, lessons and assessments, then publish when ready."
        actions={<Link href="/instructor/courses" className="btn btn-outline btn-sm"><ArrowLeft size={14} /> Back to courses</Link>}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          Please complete the required fields: a title, a summary, and a category.
        </div>
      )}

      <form action={createCourseAction} className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="font-display text-[15px] font-bold text-ink">Course details</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="title">Course title *</label>
                <input id="title" name="title" className="input" required minLength={5} placeholder="e.g. Advanced Procurement Integrity" />
              </div>
              <div>
                <label className="label" htmlFor="summary">Short summary *</label>
                <input id="summary" name="summary" className="input" required minLength={10} placeholder="One-line catalogue summary" />
              </div>
              <div>
                <label className="label" htmlFor="description">Full description</label>
                <textarea id="description" name="description" className="textarea min-h-[110px]" placeholder="What the course covers, who it is for and how it is delivered." />
              </div>
              <div>
                <label className="label" htmlFor="objectives">Learning objectives (one per line)</label>
                <textarea id="objectives" name="objectives" className="textarea min-h-[110px]" placeholder={"Explain the legal framework\nApply controls in daily work\nIdentify red flags"} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="categoryId">Departmental category *</label>
                  <select id="categoryId" name="categoryId" className="select" required>
                    <option value="">Select a category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="level">Level</label>
                  <select id="level" name="level" className="select" defaultValue="Beginner">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-[15px] font-bold text-ink">Assessment defaults</h2>
            <p className="mt-1 text-[11.5px] text-muted">These defaults are applied to the final examination and can be overridden per assessment.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label" htmlFor="passMark">Pass mark (%)</label>
                <input id="passMark" name="passMark" type="number" min={1} max={100} defaultValue={60} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="maxAttempts">Maximum attempts</label>
                <input id="maxAttempts" name="maxAttempts" type="number" min={1} max={10} defaultValue={3} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="examMinutes">Exam timer (minutes)</label>
                <input id="examMinutes" name="examMinutes" type="number" min={0} max={240} defaultValue={30} className="input" />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="card p-5">
            <h2 className="font-display text-[15px] font-bold text-ink">Catalogue settings</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="durationMinutes">Estimated duration (minutes)</label>
                <input id="durationMinutes" name="durationMinutes" type="number" min={15} max={2400} defaultValue={90} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="cpdPoints">CPD points</label>
                <input id="cpdPoints" name="cpdPoints" type="number" min={0} max={50} defaultValue={5} className="input" />
              </div>
              <label className="flex items-start gap-2.5 rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[12px] text-ink-soft">
                <input type="checkbox" name="mandatory" className="mt-0.5 accent-[#16437f]" />
                <span>Mandatory training for assigned staff</span>
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-panel-2 p-4 text-[11.5px] leading-relaxed text-muted">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-ink"><ShieldCheck size={15} /> Governance notice</div>
            <p className="mt-2">
              Courses in Legal Services categories are automatically routed to the Legal Department for content review. Legal-reviewed
              courses cannot be published until approval is recorded.
            </p>
          </section>

          <section className="card p-5">
            <h2 className="font-display text-[15px] font-bold text-ink">Ready to build?</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
              After creating the draft you will be able to add modules, lessons, knowledge checks, a final exam, question-bank items and materials.
            </p>
            <button type="submit" className="btn btn-primary mt-4 w-full"><BookOpen size={15} /> Create draft course</button>
          </section>
        </aside>
      </form>
    </div>
  );
}
