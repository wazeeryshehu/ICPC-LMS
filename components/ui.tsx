import Link from "next/link";
import { BookOpen, Clock, Layers, ShieldCheck, Sparkles } from "lucide-react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#2f5da8] dark:text-[#6fa8e8]">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-[22px] font-bold text-ink md:text-[26px]">{title}</h2>
        {description && <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  light?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <div className={`mb-2 text-[10.5px] font-bold uppercase tracking-[0.16em] ${light ? "text-[#8fc0f5]" : "text-[#2f5da8] dark:text-[#6fa8e8]"}`}>
            {eyebrow}
          </div>
        )}
        <h2 className={`font-display text-[24px] font-bold leading-tight md:text-[30px] ${light ? "text-white" : "text-ink"}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-2 max-w-2xl text-[13px] leading-relaxed ${light ? "text-white/65" : "text-muted"}`}>{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "green",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "green" | "gold" | "blue" | "red";
}) {
  const tones: Record<string, string> = {
    green: "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200",
    gold: "bg-gold-50 text-gold-700 dark:bg-gold-900/30 dark:text-gold-200",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200",
    red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200",
  };
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">{label}</div>
          <div className="mt-1.5 font-display text-[26px] font-bold leading-none text-ink">{value}</div>
          {sub && <div className="mt-1.5 text-[10.5px] text-muted">{sub}</div>}
        </div>
        {icon && <div className={`rounded-xl p-2.5 ${tones[tone]}`}>{icon}</div>}
      </div>
    </div>
  );
}

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`progress ${className}`} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
      {icon && <div className="mb-3 rounded-2xl bg-surface-2 p-3.5 text-muted">{icon}</div>}
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export interface CourseCardData {
  slug: string;
  title: string;
  summary: string;
  level: string;
  durationMinutes: number;
  isMandatory: number;
  legalReview: string;
  categoryName: string;
  instructorName: string;
  lessonCount: number;
  moduleCount: number;
  cpdPoints: number;
}

export function CourseCard({
  course,
  href,
  progress,
  footer,
}: {
  course: CourseCardData;
  href: string;
  progress?: number | null;
  footer?: React.ReactNode;
}) {
  return (
    <Link href={href} className="card card-hover group flex h-full flex-col overflow-hidden">
      <div className="relative h-1.5 w-full bg-gradient-to-r from-[#16437f] via-[#3b72c8] to-[#2f7cd6]" />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="chip chip-gray">{course.categoryName}</span>
          <span className={`chip ${course.level === "Advanced" ? "chip-red" : course.level === "Intermediate" ? "chip-blue" : "chip-green"}`}>
            {course.level}
          </span>
          {course.isMandatory ? <span className="chip chip-gold">Mandatory</span> : null}
        </div>
        <h3 className="mt-2.5 font-display text-[16.5px] font-bold leading-snug text-ink transition group-hover:text-brand-700 dark:group-hover:text-brand-300">
          {course.title}
        </h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-muted line-clamp-3">{course.summary}</p>

        {course.legalReview === "demo_pending" && (
          <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-gold-50 px-2.5 py-1.5 text-[9.5px] leading-snug text-gold-800 dark:bg-gold-900/20 dark:text-gold-200">
            <ShieldCheck size={12} className="mt-0.5 shrink-0" /> Demonstration legal content pending Legal Department review
          </div>
        )}

        <div className="mt-auto pt-3">
          {typeof progress === "number" && (
            <div className="mb-2.5">
              <div className="mb-1 flex justify-between text-[10px] font-semibold text-muted">
                <span>Progress</span><span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2.5 text-[10.5px] text-muted">
            <span className="flex items-center gap-1"><Layers size={12} /> {course.moduleCount} modules</span>
            <span className="flex items-center gap-1"><BookOpen size={12} /> {course.lessonCount} lessons</span>
            <span className="flex items-center gap-1"><Clock size={12} /> {Math.round(course.durationMinutes / 60)}h</span>
            {course.cpdPoints > 0 && <span className="flex items-center gap-1"><Sparkles size={12} /> {course.cpdPoints} CPD</span>}
          </div>
          {footer}
        </div>
      </div>
    </Link>
  );
}
