"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import { LogoPlate } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function PublicHeader({ isAuthed, homeHref }: { isAuthed: boolean; homeHref: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#071a3a]">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <LogoPlate imageClassName="h-8 w-auto" className="px-2.5 py-1.5" />
            <div className="hidden border-l border-white/15 pl-3 xl:block">
              <div className="text-[9.5px] uppercase leading-tight tracking-[0.12em] text-white/55">
                Digital Learning &amp;<br />Capacity Development
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[12.5px] font-medium text-white/65 lg:flex">
            <a href="#about" className="hover:text-white">About the Portal</a>
            <a href="#courses" className="hover:text-white">Courses</a>
            <a href="#categories" className="hover:text-white">Departments</a>
            <Link href="/verify" className="flex items-center gap-1.5 hover:text-white">
              <ShieldCheck size={14} /> Verify Certificate
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden border-white/15 bg-white/5 text-white/70 hover:text-white sm:inline-flex" />
            <Link
              href={isAuthed ? homeHref : "/login"}
              className="btn btn-gold btn-sm hidden sm:inline-flex"
            >
              {isAuthed ? "Open my portal" : "Staff sign in"}
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg border border-white/15 p-2 text-white/80 lg:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-white/10 bg-[#071a3a] px-4 pb-4 lg:hidden">
            <nav className="flex flex-col gap-1 text-[13px] text-white/75">
              <a href="#about" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/5">About the Portal</a>
              <a href="#courses" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/5">Courses</a>
              <a href="#categories" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/5">Departments</a>
              <Link href="/verify" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/5">Verify Certificate</Link>
              <Link href="/activate" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/5">Staff activation</Link>
              <Link href={isAuthed ? homeHref : "/login"} className="btn btn-gold mt-2">
                {isAuthed ? "Open my portal" : "Staff sign in"}
              </Link>
            </nav>
          </div>
        )}
      </div>
      <div className="h-[3px] bg-gradient-to-r from-[#2f7cd6] via-[#8fc0f5] to-[#2f7cd6]" />
    </header>
  );
}
