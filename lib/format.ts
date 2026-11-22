export function formatDate(value: string | Date | null | undefined, withTime = false): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, true);
}

export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function fullName(first: string, last: string): string {
  return `${first} ${last}`;
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0";
  return new Intl.NumberFormat("en-NG").format(n);
}

export function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function timeAgo(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

export function gradeFor(score: number): string {
  if (score >= 85) return "Distinction";
  if (score >= 70) return "Merit";
  return "Pass";
}

export function levelChip(level: string): string {
  if (level === "Advanced") return "chip-red";
  if (level === "Intermediate") return "chip-blue";
  return "chip-green";
}

export function statusChip(status: string): string {
  switch (status) {
    case "active":
    case "published":
    case "completed":
    case "graded":
      return "chip-green";
    case "pending":
    case "submitted":
    case "in_review":
      return "chip-gold";
    case "suspended":
    case "archived":
    case "revoked":
    case "failed":
      return "chip-red";
    case "draft":
      return "chip-gray";
    default:
      return "chip-gray";
  }
}

export function humanStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function truncate(text: string, length = 120): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}
