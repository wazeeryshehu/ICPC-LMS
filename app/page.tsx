import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Cpu,
  Eye,
  GraduationCap,
  Handshake,
  Landmark,
  LineChart,
  Megaphone,
  QrCode,
  Scale,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { CourseCard, SectionHeading, StatCard } from "@/components/ui";
import { IcpcLogo } from "@/components/Logo";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { HOME_BY_ROLE } from "@/lib/rbac";
import { formatDate, formatNumber, timeAgo, truncate } from "@/lib/format";

export const dynamic = "force-dynamic";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "legal-services": Scale,
  "investigation-operations": Search,
  "security-intelligence": Eye,
  "ict-digital": Cpu,
  "human-resources": Users,
  "public-enlightenment": Megaphone,
  prs: LineChart,
  "finance-accounts": Wallet,
  "procurement-supply-chain": ShoppingCart,
  "monitoring-compliance": ClipboardCheck,
  "general-leadership": Briefcase,
  "ethics-integrity": Handshake,
};

export default async function LandingPage() {
  const db = getDb();
  const user = await getSessionUser();
  const authed = Boolean(user);
  const home = user ? HOME_BY_ROLE[user.role] : "/login";

  const staff = (db.prepare("SELECT COUNT(*) AS n FROM users WHERE status = 'active'").get() as { n: number }).n;
  const courses = (db.prepare("SELECT COUNT(*) AS n FROM courses WHERE status = 'published'").get() as { n: number }).n;
  const certificates = (db.prepare("SELECT COUNT(*) AS n FROM certificates WHERE revoked = 0").get() as { n: number }).n;
  const enrollments = (db.prepare("SELECT COUNT(*) AS n FROM enrollments").get() as { n: number }).n;
  const completions = (db.prepare("SELECT COUNT(*) AS n FROM enrollments WHERE status = 'completed'").get() as { n: number }).n;
  const completionRate = enrollments ? Math.round((completions / enrollments) * 100) : 0;

  const featured = db
    .prepare(
      `SELECT c.slug, c.title, c.summary, c.level, c.duration_minutes, c.is_mandatory, c.legal_review_status,
              cc.name AS category_name,
              u.first_name || ' ' || u.last_name AS instructor_name,
              (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = c.id) AS lesson_count,
              (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) AS module_count,
              c.cpd_points
       FROM courses c
       JOIN course_categories cc ON cc.id = c.category_id
       JOIN users u ON u.id = c.instructor_id
       WHERE c.status = 'published'
       ORDER BY c.is_mandatory DESC, c.published_at DESC
       LIMIT 6`
    )
    .all() as Array<{
    slug: string;
    title: string;
    summary: string;
    level: string;
    duration_minutes: number;
    is_mandatory: number;
    legal_review_status: string;
    category_name: string;
    instructor_name: string;
    lesson_count: number;
    module_count: number;
    cpd_points: number;
  }>;

  const categories = db
    .prepare(
      `SELECT cc.slug, cc.name, cc.description, COUNT(c.id) AS course_count
       FROM course_categories cc
       LEFT JOIN courses c ON c.category_id = cc.id AND c.status = 'published'
       GROUP BY cc.id ORDER BY cc.id`
    )
    .all() as Array<{ slug: string; name: string; description: string; course_count: number }>;

  const announcements = db
    .prepare("SELECT title, body, published_at, pinned FROM announcements WHERE audience IN ('all','learners') ORDER BY pinned DESC, published_at DESC LIMIT 3")
    .all() as Array<{ title: string; body: string; published_at: string; pinned: number }>;

  return (
    <div className="min-h-screen bg-surface">
      <PublicHeader isAuthed={authed} homeHref={home} />

      <section className="hero-bg relative overflow-hidden text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #a9ccf5 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2f7cd6]/40 bg-[#2f7cd6]/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#a9ccf5]">
              <Landmark size={13} /> Federal Republic of Nigeria · Official Staff Learning Platform
            </div>
            <h1 className="mt-5 font-display text-[38px] font-bold leading-[1.08] sm:text-[48px] lg:text-[54px]">
              Continuous learning for a{" "}
              <span className="bg-gradient-to-r from-[#d6e8fb] to-[#2f7cd6] bg-clip-text text-transparent">
                corruption-free
              </span>{" "}
              public service.
            </h1>
            <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-white/70 sm:text-[15px]">
              Welcome to the Independent Corrupt Practices and Other Related Offences Commission&apos;s
              central digital learning, capacity development and professional certification portal.
              Build competence, demonstrate integrity and earn verifiable professional credentials.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={home} className="btn btn-gold btn-lg">
                {authed ? "Open my learning portal" : "Staff sign in"} <ArrowRight size={17} />
              </Link>
              <Link
                href="/verify"
                className="btn btn-lg border border-white/25 bg-white/5 text-white hover:bg-white/10"
              >
                <QrCode size={17} /> Verify a certificate
              </Link>
            </div>
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[11.5px] leading-relaxed text-white/60 sm:max-w-xl">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#8fc0f5]" />
              <span>
                Staff access is verified against the official register using your{" "}
                <strong className="text-white">Staff ID</strong> (e.g. P0001) and{" "}
                <strong className="text-white">official email</strong> (firstname.surname@icpc.gov.ng).
              </span>
            </div>
          </div>

          <div className="relative animate-fade-up lg:pl-6">
            <div className="relative mx-auto w-full max-w-[390px]">
              <div className="rounded-[28px] border border-[#2f7cd6]/30 bg-white/[0.06] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center rounded-2xl bg-white px-5 py-6 shadow-lg ring-1 ring-white/25">
                  <IcpcLogo className="h-auto w-full max-w-[300px]" />
                </div>
                <div className="mt-5 text-center">
                  <div className="font-display text-[15px] font-bold text-white">ICPC Digital Learning Academy</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/45">
                    Integrity · Transparency · Accountability
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-white/5 px-2 py-2.5">
                    <div className="font-display text-xl font-bold text-[#a9ccf5]">{courses}</div>
                    <div className="text-[9px] uppercase tracking-wide text-white/45">Courses</div>
                  </div>
                  <div className="rounded-xl bg-white/5 px-2 py-2.5">
                    <div className="font-display text-xl font-bold text-[#a9ccf5]">{formatNumber(certificates)}</div>
                    <div className="text-[9px] uppercase tracking-wide text-white/45">Certificates</div>
                  </div>
                  <div className="rounded-xl bg-white/5 px-2 py-2.5">
                    <div className="font-display text-xl font-bold text-[#a9ccf5]">{completionRate}%</div>
                    <div className="text-[9px] uppercase tracking-wide text-white/45">Completion</div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-4 top-16 hidden items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-[10.5px] font-semibold text-ink shadow-lift sm:flex">
                <CheckCircle2 size={14} className="text-brand-600" /> QR-verified certificates
              </div>
              <div className="absolute -right-3 bottom-20 hidden items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-[10.5px] font-semibold text-ink shadow-lift sm:flex">
                <Award size={14} className="text-[#2f5da8]" /> Digital badges
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-black/15">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-4 px-4 py-5 text-white md:grid-cols-4 md:px-8">
            {[
              { label: "Active staff learners", value: formatNumber(staff), icon: <Users size={16} /> },
              { label: "Published courses", value: formatNumber(courses), icon: <BookOpen size={16} /> },
              { label: "Verified certificates", value: formatNumber(certificates), icon: <Award size={16} /> },
              { label: "Course enrolments", value: formatNumber(enrollments), icon: <GraduationCap size={16} /> },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 px-2">
                <span className="text-[#8fc0f5]">{s.icon}</span>
                <div>
                  <div className="font-display text-lg font-bold leading-none">{s.value}</div>
                  <div className="mt-1 text-[9.5px] uppercase tracking-[0.09em] text-white/45">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <SectionHeading
          eyebrow="About the portal"
          title="An institutional academy, not just an online course library"
          description="The ICPC Learning Portal supports mandatory training, departmental capacity development, professional certification and continuous learning across the Commission."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <BookOpen size={20} />,
              title: "Structured learning",
              text: "Modules, lessons, knowledge checks and timed final examinations with saved progress and resumable learning.",
            },
            {
              icon: <ShieldCheck size={20} />,
              title: "Verified achievement",
              text: "Automated grading, auditable results, digital badges and certificates with QR-code verification.",
            },
            {
              icon: <BarChart3 size={20} />,
              title: "Institutional insight",
              text: "Departmental dashboards, mandatory-training compliance tracking and exportable management reports.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-5">
              <div className="mb-3 inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                {f.icon}
              </div>
              <h3 className="font-display text-[17px] font-bold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="courses" className="bg-surface-2/70 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionHeading
            eyebrow="Course library"
            title="Featured institutional courses"
            description="Core legal, investigative, digital, leadership and ethics programmes available to ICPC personnel."
            action={
              <Link href={authed ? "/courses" : "/login"} className="btn btn-outline">
                Browse all courses <ArrowRight size={15} />
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CourseCard
                key={c.slug}
                href={authed ? `/courses/${c.slug}` : `/login?next=/courses/${c.slug}`}
                course={{
                  slug: c.slug,
                  title: c.title,
                  summary: c.summary,
                  level: c.level,
                  durationMinutes: c.duration_minutes,
                  isMandatory: c.is_mandatory,
                  legalReview: c.legal_review_status,
                  categoryName: c.category_name,
                  instructorName: c.instructor_name,
                  lessonCount: c.lesson_count,
                  moduleCount: c.module_count,
                  cpdPoints: c.cpd_points,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <SectionHeading
          eyebrow="Departments & directorates"
          title="Learning organised around ICPC functions"
          description="Every department, directorate and unit has a dedicated learning pathway, alongside general institutional courses."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? BookOpen;
            return (
              <Link
                key={cat.slug}
                href={authed ? `/courses?category=${cat.slug}` : "/login"}
                className="card card-hover flex items-start gap-3.5 p-4"
              >
                <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold leading-snug text-ink">{cat.name}</div>
                  <div className="mt-1 text-[10.5px] text-muted line-clamp-2">{cat.description}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[#2f5da8] dark:text-[#6fa8e8]">
                    {cat.course_count} course{cat.course_count === 1 ? "" : "s"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-[#071a3a] py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:px-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <SectionHeading
              light
              eyebrow="Institutional communications"
              title="Announcements"
              description="Official notices on mandatory training, new courses and certification services."
            />
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.pinned ? (
                      <span className="rounded-full bg-[#2f7cd6]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#a9ccf5]">
                        Pinned
                      </span>
                    ) : null}
                    <span className="text-[9.5px] uppercase tracking-[0.1em] text-white/40">
                      {formatDate(a.published_at)} · {timeAgo(a.published_at)}
                    </span>
                  </div>
                  <div className="mt-1.5 text-[14px] font-semibold text-white">{a.title}</div>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-white/55">{truncate(a.body, 180)}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              light
              eyebrow="Certificate authentication"
              title="Verify an ICPC certificate"
              description="Enter a certificate number or scan the QR code printed on an official certificate."
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <form action="/verify" method="get" className="space-y-3">
                <label htmlFor="certNo" className="block text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/50">
                  Certificate identification number
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="certNo"
                    name="cert"
                    placeholder="e.g. ICPC-2026-00001"
                    className="input flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/35"
                    required
                  />
                  <button type="submit" className="btn btn-gold">
                    Verify <ArrowRight size={15} />
                  </button>
                </div>
              </form>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-black/15 px-3 py-2.5 text-[10.5px] leading-relaxed text-white/45">
                <QrCode size={14} className="mt-0.5 shrink-0 text-[#8fc0f5]" />
                Official certificates carry a unique number, the award date, the final score and an authorised
                institutional signature. Verification confirms records held on the portal.
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <Sparkles size={16} className="text-[#8fc0f5]" />
                <div className="mt-2 text-[12px] font-semibold">CPD tracking</div>
                <div className="mt-0.5 text-[10px] text-white/45">Annual professional development targets</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                <Clock size={16} className="text-[#8fc0f5]" />
                <div className="mt-2 text-[12px] font-semibold">Self-paced</div>
                <div className="mt-0.5 text-[10px] text-white/45">Resume learning where you left off</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-panel">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <IcpcLogo className="h-10 w-auto" />
              <div className="hidden border-l border-line pl-3 sm:block">
                <div className="text-[9px] uppercase leading-tight tracking-[0.1em] text-muted">
                  Digital Learning &amp;<br />Capacity Development
                </div>
              </div>
            </div>
            <p className="mt-3 max-w-md text-[11px] leading-relaxed text-muted">
              Independent Corrupt Practices and Other Related Offences Commission. This portal supports staff training,
              regulatory awareness, professional development and continuous assessment in support of the Commission&apos;s
              anti-corruption mandate.
            </p>
            <p className="mt-3 text-[10px] text-muted">
              Demonstration environment · Staff records are fictitious · Legal course content pending formal Legal Department review.
            </p>
          </div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">Portal</div>
            <div className="mt-2.5 space-y-1.5 text-[11.5px] text-ink-soft">
              <Link href="/login" className="block hover:text-brand-700 dark:hover:text-brand-300">Staff sign in</Link>
              <Link href="/activate" className="block hover:text-brand-700 dark:hover:text-brand-300">Staff activation</Link>
              <Link href="/verify" className="block hover:text-brand-700 dark:hover:text-brand-300">Certificate verification</Link>
              <a href="#categories" className="block hover:text-brand-700 dark:hover:text-brand-300">Learning categories</a>
            </div>
          </div>
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted">Support</div>
            <div className="mt-2.5 space-y-1.5 text-[11.5px] text-ink-soft">
              <div>Training and Development Unit</div>
              <div>lms.support@icpc.gov.ng</div>
              <div>Data protection: privacy@icpc.gov.ng</div>
              <div className="pt-1 text-[10px] text-muted">Aligned with the Nigeria Data Protection Act 2023</div>
            </div>
          </div>
        </div>
        <div className="border-t border-line px-4 py-3 text-center text-[10px] text-muted">
          © {new Date().getFullYear()} Independent Corrupt Practices and Other Related Offences Commission. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
