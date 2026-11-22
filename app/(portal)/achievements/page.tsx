import Link from "next/link";
import {
  Award,
  Compass,
  Cpu,
  Eye,
  Flame,
  Handshake,
  Lock,
  Medal,
  Search,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { PageHeader, ProgressBar, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  trophy: Trophy,
  scale: Award,
  shield: Shield,
  search: Search,
  eye: Eye,
  cpu: Cpu,
  handshake: Handshake,
  star: Star,
  medal: Medal,
  zap: Zap,
  flame: Flame,
};

const TIER_STYLE: Record<string, string> = {
  bronze: "bg-[#f6ead9] text-[#8a5620] dark:bg-[#3a2817] dark:text-[#e0b27e]",
  silver: "bg-[#eef1f3] text-[#4b5b66] dark:bg-[#26333b] dark:text-[#c3d2da]",
  gold: "bg-gold-50 text-gold-700 dark:bg-gold-900/30 dark:text-gold-200",
};

export default async function AchievementsPage() {
  const user = await requireUser();
  const db = getDb();

  const badges = db
    .prepare(
      `SELECT b.key, b.name, b.description, b.tier, b.icon, b.criteria, ub.awarded_at, c.title AS course_title
       FROM badges b
       LEFT JOIN user_badges ub ON ub.badge_key = b.key AND ub.user_id = ?
       LEFT JOIN courses c ON c.id = ub.course_id
       ORDER BY ub.awarded_at IS NULL ASC, b.sort ASC`
    )
    .all(user.id) as Array<{
    key: string;
    name: string;
    description: string;
    tier: string;
    icon: string;
    criteria: string | null;
    awarded_at: string | null;
    course_title: string | null;
  }>;

  const earned = badges.filter((b) => b.awarded_at);
  const certStats = db
    .prepare("SELECT COUNT(*) AS n, COALESCE(SUM(c.cpd_points), 0) AS cpd FROM certificates ct JOIN courses c ON c.id = ct.course_id WHERE ct.user_id = ? AND ct.revoked = 0")
    .get(user.id) as { n: number; cpd: number };

  const activeDays = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT substr(completed_at, 1, 10)) AS n FROM lesson_progress lp
         JOIN enrollments e ON e.id = lp.enrollment_id WHERE e.user_id = ?`
      )
      .get(user.id) as { n: number }
  ).n;

  const completedCourses = (
    db.prepare("SELECT COUNT(*) AS n FROM enrollments WHERE user_id = ? AND status = 'completed'").get(user.id) as { n: number }
  ).n;

  const nextBadge = badges.find((b) => !b.awarded_at);

  return (
    <div>
      <PageHeader
        eyebrow="Recognition"
        title="Achievements & Badges"
        description="Badges are awarded automatically as you complete courses, pass assessments and demonstrate consistent learning. All recognition is recorded on your staff learning profile."
        actions={<Link href="/certificates" className="btn btn-outline btn-sm"><Award size={13} /> My certificates</Link>}
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Badges earned" value={earned.length} sub={`of ${badges.length} available`} icon={<Medal size={18} />} />
        <StatCard label="Certificates" value={certStats.n} sub={`${certStats.cpd} CPD points`} icon={<Award size={18} />} tone="gold" />
        <StatCard label="Courses completed" value={completedCourses} sub="Learning milestones" icon={<Trophy size={18} />} tone="blue" />
        <StatCard label="Active learning days" value={activeDays} sub="Days with lesson activity" icon={<Flame size={18} />} tone="red" />
      </div>

      <div className="mb-5 rounded-2xl border border-line bg-panel p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#2f5da8] dark:text-[#6fa8e8]">Your recognition progress</div>
            <div className="mt-1 font-display text-[18px] font-bold text-ink">
              {earned.length} of {badges.length} badges unlocked
            </div>
            <p className="mt-1 text-[11.5px] text-muted">
              {nextBadge
                ? `Next up: ${nextBadge.name} — ${nextBadge.criteria ?? nextBadge.description}.`
                : "You have unlocked every available badge. Outstanding commitment to learning."}
            </p>
          </div>
          <div className="w-full sm:w-64">
            <div className="mb-1.5 flex justify-between text-[10.5px] font-semibold text-muted">
              <span>Overall</span><span>{Math.round((earned.length / Math.max(1, badges.length)) * 100)}%</span>
            </div>
            <ProgressBar value={(earned.length / Math.max(1, badges.length)) * 100} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge) => {
          const Icon = ICONS[badge.icon] ?? Award;
          const unlocked = !!badge.awarded_at;
          return (
            <div key={badge.key} className={`card p-5 ${unlocked ? "" : "opacity-75"}`}>
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${unlocked ? TIER_STYLE[badge.tier] ?? TIER_STYLE.bronze : "bg-surface-2 text-muted"}`}>
                  {unlocked ? <Icon size={24} /> : <Lock size={20} />}
                </div>
                <span className={`chip capitalize ${unlocked ? badge.tier === "gold" ? "chip-gold" : badge.tier === "silver" ? "chip-gray" : "chip-gold" : "chip-gray"}`}>
                  {badge.tier}
                </span>
              </div>
              <h3 className="mt-3 font-display text-[15px] font-bold text-ink">{badge.name}</h3>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{badge.description}</p>
              <div className="mt-3 border-t border-line pt-2.5 text-[10.5px]">
                {unlocked ? (
                  <span className="flex items-center gap-1.5 font-medium text-green-700 dark:text-green-300">
                    <Sparkles size={12} /> Earned {formatDate(badge.awarded_at)}
                    {badge.course_title ? <span className="truncate text-muted">· {badge.course_title}</span> : null}
                  </span>
                ) : (
                  <span className="text-muted"><strong className="text-ink-soft">To earn:</strong> {badge.criteria ?? "Continue learning"}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
