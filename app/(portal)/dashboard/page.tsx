import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  Medal,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate, fullName, timeAgo } from "@/lib/format";
import { mandatoryCompliance, recommendCourses } from "@/lib/queries";
import { CourseCard, EmptyState, ProgressBar, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const db = getDb();
  const name = fullName(user.first_name, user.last_name);

  const enrollmentStats = db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
              SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
              ROUND(AVG(progress_percent)) AS avg_progress
       FROM enrollments WHERE user_id = ?`
    )
    .get(user.id) as { total: number; completed: number | null; active: number | null; avg_progress: number | null };

  const certCount = (
    db.prepare("SELECT COUNT(*) AS n FROM certificates WHERE user_id = ? AND revoked = 0").get(user.id) as { n: number }
  ).n;
  const badgeCount = (
    db.prepare("SELECT COUNT(*) AS n FROM user_badges WHERE user_id = ?").get(user.id) as { n: number }
  ).n;
  const avgScore = (
    db
      .prepare(
        "SELECT ROUND(AVG(percent)) AS n FROM assessment_attempts WHERE user_id = ? AND status = 'graded' AND percent IS NOT NULL"
      )
      .get(user.id) as { n: number | null }
  ).n;

  const continueRows = db
    .prepare(
      `SELECT e.progress_percent, c.id AS course_id, c.slug, c.title, c.level, cat.name AS category_name,
              (SELECT COUNT(*) FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = c.id) AS lesson_count,
              (SELECT l.id FROM lessons l JOIN modules m ON m.id = l.module_id
                WHERE m.course_id = c.id AND l.id NOT IN (SELECT lp.lesson_id FROM lesson_progress lp WHERE lp.enrollment_id = e.id)
                ORDER BY m.position ASC, l.position ASC LIMIT 1) AS next_lesson_id,
              (SELECT l.title FROM lessons l JOIN modules m ON m.id = l.module_id
                WHERE m.course_id = c.id AND l.id NOT IN (SELECT lp.lesson_id FROM lesson_progress lp WHERE lp.enrollment_id = e.id)
                ORDER BY m.position ASC, l.position ASC LIMIT 1) AS next_lesson_title
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN course_categories cat ON cat.id = c.category_id
       WHERE e.user_id = ? AND e.status = 'active' AND c.status = 'published'
       ORDER BY e.enrolled_at DESC LIMIT 3`
    )
    .all(user.id) as Array<{
    progress_percent: number;
    course_id: number;
    slug: string;
    title: string;
    level: string;
    category_name: string | null;
    lesson_count: number;
    next_lesson_id: number | null;
    next_lesson_title: string | null;
  }>;

  const recommended = recommendCourses(user.id, 3);
  const compliance = mandatoryCompliance(user.id, user.department_id);
  const compliancePct = compliance.assigned ? Math.round((compliance.completed / compliance.assigned) * 100) : 0;

  const sessions = db
    .prepare(
      `SELECT ts.id, ts.title, ts.modality, ts.venue, ts.starts_at, ts.capacity,
              (SELECT COUNT(*) FROM session_registrations sr WHERE sr.session_id = ts.id) AS taken,
              EXISTS(SELECT 1 FROM session_registrations sr WHERE sr.session_id = ts.id AND sr.user_id = ?) AS registered
       FROM training_sessions ts WHERE ts.starts_at >= ? ORDER BY ts.starts_at ASC LIMIT 3`
    )
    .all(user.id, new Date().toISOString()) as Array<{
    id: number;
    title: string;
    modality: string;
    venue: string | null;
    starts_at: string;
    capacity: number;
    taken: number;
    registered: number;
  }>;

  const badges = db
    .prepare(
      `SELECT b.name, b.tier, b.icon, ub.awarded_at FROM user_badges ub
       JOIN badges b ON b.key = ub.badge_key WHERE ub.user_id = ?
       ORDER BY ub.awarded_at DESC LIMIT 4`
    )
    .all(user.id) as Array<{ name: string; tier: string; icon: string; awarded_at: string }>;

  const certificates = db
    .prepare(
      `SELECT ct.cert_no, ct.final_score, ct.grade, ct.issued_at, c.title, c.slug
       FROM certificates ct JOIN courses c ON c.id = ct.course_id
       WHERE ct.user_id = ? AND ct.revoked = 0 ORDER BY ct.issued_at DESC LIMIT 2`
    )
    .all(user.id) as Array<{ cert_no: string; final_score: number; grade: string; issued_at: string; title: string; slug: string }>;

  const notifications = db
    .prepare("SELECT id, title, body, type, link, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 4")
    .all(user.id) as Array<{ id: number; title: string; body: string | null; type: string; link: string | null; is_read: number; created_at: string }>;

  const latestAttempts = db
    .prepare(
      `SELECT at.id, at.percent, at.passed, at.submitted_at, a.title, c.slug
       FROM assessment_attempts at JOIN assessments a ON a.id = at.assessment_id JOIN courses c ON c.id = a.course_id
       WHERE at.user_id = ? AND at.status IN ('graded','submitted') ORDER BY at.submitted_at DESC LIMIT 3`
    )
    .all(user.id) as Array<{ id: number; percent: number | null; passed: number | null; submitted_at: string; title: string; slug: string }>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-[#0b2550] p-6 text-white shadow-lift md:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#2f7cd6]/15 blur-2xl" />
        <div className="absolute bottom-0 right-24 hidden h-40 w-40 rotate-12 rounded-3xl border border-white/10 md:block" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#8fc0f5]">
              {greeting} · {formatDate(new Date())}
            </div>
            <h2 className="mt-2 font-display text-[26px] font-bold leading-tight md:text-[32px]">
              Welcome back, {user.first_name}.
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/65">
              {user.designation ?? "Staff"} · {user.department_name ?? "ICPC"} · Staff ID {user.staff_id}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Link href="/courses" className="btn btn-gold btn-sm">
                <BookOpen size={14} /> Explore catalogue
              </Link>
              {continueRows[0] ? (
                <Link
                  href={continueRows[0].next_lesson_id ? `/learn/${continueRows[0].slug}?lesson=${continueRows[0].next_lesson_id}` : `/courses/${continueRows[0].slug}`}
                  className="btn btn-sm border border-white/20 bg-white/10 text-white hover:bg-white/15"
                >
                  <Play size={14} /> Resume learning
                </Link>
              ) : (
                <Link href="/courses" className="btn btn-sm border border-white/20 bg-white/10 text-white hover:bg-white/15">
                  <Play size={14} /> Start a course
                </Link>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#8fc0f5"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(enrollmentStats.avg_progress ?? 0) * 2.64} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[22px] font-bold text-white">{enrollmentStats.avg_progress ?? 0}%</span>
                <span className="text-[8.5px] uppercase tracking-wider text-white/50">Avg. progress</span>
              </div>
            </div>
            <div className="space-y-2 text-[11.5px]">
              <div className="flex items-center gap-2 text-white/75"><CheckCircle2 size={13} className="text-[#8fc0f5]" /> {enrollmentStats.completed ?? 0} courses completed</div>
              <div className="flex items-center gap-2 text-white/75"><GraduationCap size={13} className="text-[#8fc0f5]" /> {enrollmentStats.active ?? 0} active enrolments</div>
              <div className="flex items-center gap-2 text-white/75"><Target size={13} className="text-[#8fc0f5]" /> {avgScore ?? 0}% average score</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolled courses" value={enrollmentStats.total} sub={`${enrollmentStats.active ?? 0} in progress`} icon={<BookOpen size={18} />} />
        <StatCard label="Completed" value={enrollmentStats.completed ?? 0} sub="Courses finished" icon={<CheckCircle2 size={18} />} tone="gold" />
        <StatCard label="Certificates" value={certCount} sub="Verified credentials" icon={<Award size={18} />} tone="blue" />
        <StatCard label="Badges earned" value={badgeCount} sub="Recognition milestones" icon={<Medal size={18} />} tone="red" />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-[17px] font-bold text-ink">Continue learning</h3>
                <p className="text-[11.5px] text-muted">Pick up where you left off.</p>
              </div>
              <Link href="/history" className="text-[11.5px] font-semibold text-brand-700 hover:underline dark:text-brand-300">
                View all
              </Link>
            </div>
            {continueRows.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={22} />}
                title="No active courses yet"
                description="Browse the catalogue and enrol in a course to begin your learning journey."
                action={<Link href="/courses" className="btn btn-primary btn-sm">Browse courses</Link>}
              />
            ) : (
              <div className="space-y-3">
                {continueRows.map((row) => (
                  <div key={row.course_id} className="flex flex-col gap-3 rounded-xl border border-line bg-panel-2 p-4 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#16437f] to-[#3b72c8] text-[#8fc0f5]">
                      <BookOpen size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="chip chip-gray">{row.category_name ?? "General"}</span>
                        <span className="chip chip-green">{row.level}</span>
                      </div>
                      <h4 className="mt-1 truncate font-display text-[14.5px] font-bold text-ink">{row.title}</h4>
                      <p className="mt-0.5 truncate text-[11px] text-muted">
                        {row.next_lesson_title ? `Next: ${row.next_lesson_title}` : "All lessons complete — final assessment ready"}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar value={row.progress_percent} className="max-w-[240px]" />
                        <span className="text-[10.5px] font-semibold text-muted">{row.progress_percent}%</span>
                      </div>
                    </div>
                    <Link
                      href={row.next_lesson_id ? `/learn/${row.slug}?lesson=${row.next_lesson_id}` : `/courses/${row.slug}`}
                      className="btn btn-primary btn-sm shrink-0"
                    >
                      {row.next_lesson_id ? "Continue" : "Assessment"} <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-[17px] font-bold text-ink">Recommended for you</h3>
                <p className="text-[11.5px] text-muted">Based on your department, interests and compliance requirements.</p>
              </div>
              <Link href="/courses" className="text-[11.5px] font-semibold text-brand-700 hover:underline dark:text-brand-300">
                Catalogue
              </Link>
            </div>
            {recommended.length === 0 ? (
              <EmptyState icon={<Sparkles size={22} />} title="You're all caught up" description="You have enrolled in all published courses." />
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {recommended.map((course) => (
                  <CourseCard key={course.id} course={course} href={`/courses/${course.slug}`} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-700 dark:text-brand-300" />
              <h3 className="font-display text-[15px] font-bold text-ink">Mandatory training</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0">
                <svg viewBox="0 0 100 100" className="h-16 w-16 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--line)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="#2f7cd6" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${compliancePct * 2.64} 264`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-ink">{compliancePct}%</span>
              </div>
              <div className="text-[12px] text-muted">
                <div className="font-semibold text-ink">{compliance.completed} of {compliance.assigned} completed</div>
                <p className="mt-1 leading-relaxed">
                  {compliance.assigned === 0
                    ? "No mandatory courses assigned to you."
                    : compliancePct >= 100
                      ? "Fully compliant. Well done."
                      : "Complete all assigned mandatory courses to meet Commission requirements."}
                </p>
              </div>
            </div>
            <Link href="/courses?mandatory=1" className="btn btn-outline btn-sm mt-3 w-full justify-center">
              View mandatory courses
            </Link>
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-brand-700 dark:text-brand-300" />
                <h3 className="font-display text-[15px] font-bold text-ink">Upcoming sessions</h3>
              </div>
              <Link href="/calendar" className="text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-300">All</Link>
            </div>
            {sessions.length === 0 ? (
              <p className="text-[12px] text-muted">No upcoming training sessions.</p>
            ) : (
              <ul className="space-y-3">
                {sessions.map((s) => (
                  <li key={s.id} className="rounded-lg border border-line bg-panel-2 p-3">
                    <div className="text-[12.5px] font-semibold leading-snug text-ink">{s.title}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10.5px] text-muted">
                      <Clock size={11} /> {formatDate(s.starts_at, true)} · {s.modality}
                    </div>
                    <div className="mt-1.5 text-[10px] text-muted">
                      {s.taken}/{s.capacity} registered {s.registered ? <span className="chip chip-green ml-1">Registered</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-gold-600" />
                <h3 className="font-display text-[15px] font-bold text-ink">Recent recognition</h3>
              </div>
              <Link href="/achievements" className="text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-300">All</Link>
            </div>
            {badges.length === 0 ? (
              <p className="text-[12px] text-muted">Complete courses to earn badges.</p>
            ) : (
              <ul className="space-y-2">
                {badges.map((b) => (
                  <li key={b.name} className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-50 text-gold-700 dark:bg-gold-900/30 dark:text-gold-200">
                      <Medal size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12px] font-semibold text-ink">{b.name}</div>
                      <div className="text-[10px] capitalize text-muted">{b.tier} · {timeAgo(b.awarded_at)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {certificates.length > 0 && (
              <div className="mt-3 border-t border-line pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-muted">
                  <Award size={12} /> Latest certificates
                </div>
                {certificates.map((c) => (
                  <Link key={c.cert_no} href="/certificates" className="block rounded-lg px-2 py-1.5 text-[11.5px] text-ink-soft hover:bg-surface-2">
                    <span className="font-semibold text-ink">{c.title}</span>
                    <span className="ml-1 text-muted">· {c.final_score}% {c.grade}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-700 dark:text-brand-300" />
                <h3 className="font-display text-[15px] font-bold text-ink">Recent results</h3>
              </div>
              <Link href="/history" className="text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-300">History</Link>
            </div>
            {latestAttempts.length === 0 ? (
              <p className="text-[12px] text-muted">No assessment attempts yet.</p>
            ) : (
              <ul className="space-y-2">
                {latestAttempts.map((a) => (
                  <li key={a.id}>
                    <Link href={`/results/${a.id}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2">
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-semibold text-ink">{a.title}</div>
                        <div className="text-[10px] text-muted">{timeAgo(a.submitted_at)}</div>
                      </div>
                      <span className={`chip ${a.passed === 1 ? "chip-green" : a.passed === 0 ? "chip-red" : "chip-gold"}`}>
                        {a.percent !== null ? `${a.percent}%` : "Pending"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-[15px] font-bold text-ink">Notifications</h3>
              <Link href="/notifications" className="text-[11px] font-semibold text-brand-700 hover:underline dark:text-brand-300">All</Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-[12px] text-muted">You have no notifications.</p>
            ) : (
              <ul className="space-y-2.5">
                {notifications.map((n) => (
                  <li key={n.id} className="flex gap-2">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.is_read ? "bg-line" : "bg-[#2f7cd6]"}`} />
                    <div className="min-w-0">
                      <div className={`truncate text-[12px] ${n.is_read ? "text-ink-soft" : "font-semibold text-ink"}`}>{n.title}</div>
                      <div className="text-[10px] text-muted">{timeAgo(n.created_at)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-[11px] leading-relaxed text-gold-900 dark:border-gold-900/40 dark:bg-gold-900/15 dark:text-gold-100">
        <ChevronRight size={14} className="shrink-0" />
        <span>
          <strong>Demonstration environment:</strong> staff records, courses, results and certificates on this portal are fictitious and provided for demonstration of the ICPC Digital Learning and Capacity Development Management System.
        </span>
      </div>
    </div>
  );
}
