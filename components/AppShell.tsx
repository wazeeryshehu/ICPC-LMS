"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileQuestion,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Medal,
  Menu,
  PenLine,
  Search,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { LogoPlate } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { signOutAction } from "@/lib/actions/auth";
import { ROLE_LABELS, type Role } from "@/lib/rbac";

interface ShellUser {
  id: number;
  staffId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  role: Role;
  designation: string | null;
  departmentName: string | null;
}

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; exact?: boolean };

function buildNav(role: Role): { section: string; items: NavItem[] }[] {
  const learning: NavItem[] = [
    { href: "/courses", label: "Course Catalogue", icon: BookOpen },
    { href: "/history", label: "My Learning", icon: GraduationCap },
    { href: "/certificates", label: "Certificates", icon: Award },
    { href: "/achievements", label: "Achievements", icon: Medal },
    { href: "/calendar", label: "Training Calendar", icon: CalendarDays },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/transcript", label: "Training Transcript", icon: ScrollText },
  ];
  const home: NavItem = { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true };

  if (role === "super_admin" || role === "training_admin") {
    const admin: NavItem[] = [
      { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/users", label: "Staff Management", icon: Users },
      { href: "/admin/departments", label: "Departments", icon: Building2 },
      { href: "/admin/announcements", label: "Announcements", icon: Bell },
      { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
    ];
    const governance: NavItem[] = [
      { href: "/admin/settings", label: "System Settings", icon: Settings },
      { href: "/admin/audit", label: "Audit Logs", icon: ShieldCheck },
    ];
    return [
      { section: "Administration", items: admin },
      { section: "Learning", items: learning.slice(0, 2) },
      { section: "Governance", items: governance },
    ];
  }

  if (role === "management") {
    return [
      {
        section: "Executive",
        items: [
          { href: "/admin", label: "Executive Dashboard", icon: LayoutDashboard, exact: true },
          { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
        ],
      },
      { section: "Learning", items: [learning[0], learning[4], learning[5]] },
    ];
  }

  if (role === "instructor") {
    return [
      {
        section: "Instructor",
        items: [
          { href: "/instructor", label: "Instructor Home", icon: LayoutDashboard, exact: true },
          { href: "/instructor/courses", label: "My Courses", icon: BookOpen },
          { href: "/instructor/question-bank", label: "Question Bank", icon: FileQuestion },
          { href: "/instructor/grading", label: "Grading Queue", icon: ClipboardCheck },
          { href: "/instructor/reports", label: "Course Reports", icon: BarChart3 },
        ],
      },
      { section: "Learning", items: [learning[0], learning[4], learning[5]] },
    ];
  }

  if (role === "coordinator") {
    return [
      { section: "Overview", items: [home, { href: "/department", label: "Department Overview", icon: Building2 }, { href: "/department/reports", label: "Department Reports", icon: BarChart3 }] },
      { section: "Learning", items: learning },
    ];
  }

  return [{ section: "My Learning", items: [home, ...learning] }];
}

const TITLES: Record<string, string> = {
  "/dashboard": "Learner Dashboard",
  "/courses": "Course Catalogue",
  "/history": "My Learning History",
  "/certificates": "My Certificates",
  "/achievements": "Achievements & Badges",
  "/calendar": "Training Calendar",
  "/notifications": "Notifications",
  "/profile": "My Profile",
  "/instructor": "Instructor Dashboard",
  "/instructor/courses": "My Courses",
  "/instructor/question-bank": "Question Bank",
  "/instructor/grading": "Grading Queue",
  "/instructor/reports": "Course Reports",
  "/instructor/courses/new": "Create Course",
  "/admin": "Administrative Dashboard",
  "/admin/users": "Staff Management",
  "/admin/departments": "Department Management",
  "/admin/announcements": "Announcements",
  "/admin/reports": "Reports & Analytics",
  "/admin/settings": "System Settings",
  "/admin/audit": "Audit Logs",
  "/department": "Department Overview",
  "/department/reports": "Department Reports",
};

function titleFor(pathname: string): string {
  if (pathname.startsWith("/courses/")) return "Course Details";
  if (pathname.startsWith("/learn/") && pathname.includes("/exam/")) return "Assessment";
  if (pathname.startsWith("/learn/")) return "Learning Interface";
  if (pathname.startsWith("/results/")) return "Assessment Result";
  if (pathname.startsWith("/verify")) return "Certificate Verification";
  if (pathname === "/transcript") return "Official Training Transcript";
  if (TITLES[pathname]) return TITLES[pathname];
  const match = Object.keys(TITLES)
    .filter((k) => k !== "/admin" && k !== "/instructor" && pathname.startsWith(k + "/"))
    .sort((a, b) => b.length - a.length)[0];
  if (match) return TITLES[match];
  return "ICPC Learning Portal";
}

export function AppShell({
  user,
  unread,
  children,
}: {
  user: ShellUser;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = buildNav(user.role);
  const title = titleFor(pathname);
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const displayName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ");
  const today = new Date().toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#071a3a] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <Link href="/" className="flex min-w-0 flex-col gap-2" onClick={() => setOpen(false)}>
          <LogoPlate imageClassName="h-8 w-auto" />
          <span className="text-[9.5px] uppercase leading-tight tracking-[0.13em] text-white/55">
            Digital Learning Portal
          </span>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8fc0f5] to-[#2f5da8] text-[13px] font-bold text-[#ffffff]">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-white">
            {displayName}
          </div>
          <div className="truncate text-[10.5px] text-white/50">{ROLE_LABELS[user.role]}</div>
        </div>
      </div>

      <nav className="scroll-thin mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {nav.map((group) => (
          <div key={group.section}>
            <div className="mb-1.5 px-3 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white/35">
              {group.section}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-medium transition ${
                      active
                        ? "bg-white/10 text-[#d6e8fb] shadow-[inset_3px_0_0_0_#2f7cd6]"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={16} className={active ? "text-[#8fc0f5]" : "text-white/50"} />
                    <span className="truncate">{item.label}</span>
                    {item.href === "/notifications" && unread > 0 && (
                      <span className="ml-auto rounded-full bg-[#2f7cd6] px-1.5 py-0.5 text-[9px] font-bold text-[#ffffff]">
                        {unread}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 flex items-center justify-between rounded-lg px-2">
          <span className="text-[10.5px] text-white/45">Staff ID: {user.staffId}</span>
          <ThemeToggle className="border-white/15 bg-white/5 text-white/70 hover:text-white" />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Users size={15} />
            My Profile
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] text-white/70 hover:bg-red-500/15 hover:text-red-300"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </form>
        </div>
        <p className="mt-2 px-2 text-[9.5px] leading-relaxed text-white/30">
          Demonstration environment. Staff records are fictitious.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">{sidebar}</div>
        </div>
      )}

      <div className="lg:pl-[268px]">
        <header className="sticky top-0 z-30 border-b border-line bg-panel/90 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 md:px-6">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg border border-line p-2 text-ink-soft hover:bg-surface-2 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                ICPC Learning Portal
              </div>
              <h1 className="truncate font-display text-[17px] font-bold text-ink md:text-lg">{title}</h1>
            </div>

            <div className="ml-auto flex items-center gap-2 md:gap-3">
              <div className="hidden items-center gap-2 rounded-lg border border-line bg-panel-2 px-3 py-2 text-[11.5px] text-muted xl:flex">
                <Search size={14} />
                <span>Staff ID {user.staffId} · {user.departmentName ?? "Unassigned"}</span>
              </div>
              <span className="hidden text-[11.5px] text-muted md:block">{today}</span>
              <Link
                href="/notifications"
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel text-ink-soft transition hover:text-ink"
                aria-label="Notifications"
              >
                <Bell size={17} />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2f7cd6] px-1 text-[9px] font-bold text-[#ffffff]">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <ThemeToggle />

              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-line bg-panel px-2 py-1.5 [&::-webkit-details-marker]:hidden">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-[10.5px] font-bold text-white">
                    {initials}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-[12px] font-semibold text-ink md:block">
                    {user.firstName}
                  </span>
                  <ChevronDown size={14} className="text-muted" />
                </summary>
                <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-panel shadow-lift">
                  <div className="border-b border-line bg-panel-2 px-4 py-3">
                    <div className="text-[13px] font-semibold text-ink">
                      {displayName}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">{user.email}</div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-muted">
                      <span className="chip chip-gold">{ROLE_LABELS[user.role]}</span>
                    </div>
                  </div>
                  <Link href="/profile" className="block px-4 py-2.5 text-[12.5px] text-ink-soft hover:bg-surface-2">
                    My profile & security
                  </Link>
                  <Link href="/verify" className="block px-4 py-2.5 text-[12.5px] text-ink-soft hover:bg-surface-2">
                    Verify a certificate
                  </Link>
                  <form action={signOutAction} className="border-t border-line">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12.5px] text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6 lg:px-8">{children}</main>
        <footer className="border-t border-line px-4 py-5 text-center text-[11px] text-muted md:px-8">
          © {new Date().getFullYear()} Independent Corrupt Practices and Other Related Offences Commission ·
          Digital Learning and Capacity Development Portal · Demonstration data
        </footer>
      </div>
    </div>
  );
}
