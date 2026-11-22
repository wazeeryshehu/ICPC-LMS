import Link from "next/link";
import { BookOpen, Filter, Search, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { categories, getCourseCards } from "@/lib/queries";
import { CourseCard, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; level?: string; sort?: string; mandatory?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const courses = getCourseCards(user.id, {
    q: sp.q?.trim(),
    category: sp.category,
    level: sp.level,
    sort: sp.sort,
    mandatory: sp.mandatory === "1",
  });
  const cats = categories();

  return (
    <div>
      <PageHeader
        eyebrow="Learning catalogue"
        title="Course Catalogue"
        description="Explore Commission-approved courses across legal, investigative, digital, leadership and professional disciplines. Mandatory training is highlighted."
        actions={
          <>
            <Link href="/history" className="btn btn-outline btn-sm">My learning</Link>
            <Link href="/calendar" className="btn btn-primary btn-sm">Training calendar</Link>
          </>
        }
      />

      <div className="card mb-5 p-4">
        <form className="flex flex-col gap-3 md:flex-row md:items-end" method="get">
          <div className="w-full min-w-[220px] flex-1">
            <label htmlFor="q" className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted">Search</label>
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="q"
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Search course title, summary or category…"
                className="input w-full pl-9"
              />
            </div>
          </div>
          <div className="w-full md:w-[210px]">
            <label htmlFor="category" className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted">Category</label>
            <select id="category" name="category" defaultValue={sp.category ?? ""} className="input w-full">
              <option value="">All categories</option>
              {cats.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name} ({c.count})</option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-[140px]">
            <label htmlFor="level" className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted">Level</label>
            <select id="level" name="level" defaultValue={sp.level ?? ""} className="input w-full">
              <option value="">All levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className="w-full md:w-[160px]">
            <label htmlFor="sort" className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-muted">Sort</label>
            <select id="sort" name="sort" defaultValue={sp.sort ?? ""} className="input w-full">
              <option value="">Recommended</option>
              <option value="newest">Newest</option>
              <option value="popular">Most popular</option>
              <option value="rating">Highest rated</option>
              <option value="duration">Shortest</option>
            </select>
          </div>
          {sp.mandatory === "1" ? <input type="hidden" name="mandatory" value="1" /> : null}
          <button type="submit" className="btn btn-primary btn-sm h-[38px]"><Filter size={14} /> Apply</button>
          {(sp.q || sp.category || sp.level || sp.sort || sp.mandatory) && (
            <Link href="/courses" className="btn btn-ghost btn-sm h-[38px]">Clear</Link>
          )}
        </form>

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
          <Link href="/courses" className={`chip ${!sp.category ? "chip-gold" : "chip-gray"}`}>All categories</Link>
          {cats.map((c) => (
            <Link key={c.slug} href={`/courses?category=${c.slug}`} className={`chip ${sp.category === c.slug ? "chip-gold" : "chip-gray"}`}>
              {c.name}
            </Link>
          ))}
          <Link href="/courses?mandatory=1" className={`chip ml-auto ${sp.mandatory === "1" ? "chip-gold" : "chip-gray"}`}>
            <ShieldCheck size={11} /> Mandatory
          </Link>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] text-muted">
          {courses.length} course{courses.length === 1 ? "" : "s"} available
          {sp.q ? ` for “${sp.q}”` : ""}
        </p>
        <span className="chip chip-green">{user.department_code ?? "ICPC"} staff</span>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={24} />}
          title="No courses match your filters"
          description="Try clearing your search or selecting a different category."
          action={<Link href="/courses" className="btn btn-primary btn-sm">Reset filters</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              href={`/courses/${course.slug}`}
              progress={course.enrollmentStatus ? course.progress : null}
              footer={
                <div className="mt-2 flex items-center justify-between text-[10.5px]">
                  <span className="text-muted">
                    {course.rating > 0 ? `★ ${course.rating.toFixed(1)} · ` : ""}
                    {course.enrolledCount} enrolled
                  </span>
                  {course.enrollmentStatus === "completed" ? (
                    <span className="chip chip-green">Completed</span>
                  ) : course.enrollmentStatus ? (
                    <span className="chip chip-gold">In progress</span>
                  ) : (
                    <span className="font-semibold text-brand-700 dark:text-brand-300">View course →</span>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-panel-2 px-4 py-3 text-[11px] leading-relaxed text-muted">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" />
        <span>
          Legal content is subject to review by the Legal Department. Courses marked “Demonstration legal content pending Legal Department review” are included for demonstration purposes only and do not constitute legal advice.
        </span>
      </div>
    </div>
  );
}
