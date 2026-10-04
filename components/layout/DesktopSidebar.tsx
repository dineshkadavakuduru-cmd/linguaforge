"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, LayoutDashboard, Languages, UserRound } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { spanishConfig, japaneseConfig } from "@/lib/generation/seedData";

export function DesktopSidebar() {
  const { user, loading } = useAuth();
  const [learnHref, setLearnHref] = useState("/dashboard");

  useEffect(() => {
    if (!user || loading) return;
    void (async () => {
      try {
        const response = await fetch(`/api/profile?uid=${encodeURIComponent(user.uid)}`);
        if (response.ok) {
          const profile = await response.json() as {
            activeLanguages?: string[];
            currentLanguage?: string;
          };
          const lang = profile.currentLanguage || profile.activeLanguages?.[0] || "es";
          const config = lang === "ja" ? japaneseConfig : spanishConfig;
          const skillId = config.skillGraphRoot;
          setLearnHref(`/learn/${lang}/${skillId}`);
        }
      } catch {
        setLearnHref("/dashboard");
      }
    })();
  }, [user, loading]);

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/[0.08] bg-[#0d0d13] px-5 py-7 lg:block">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-primary">
          <Languages className="h-4 w-4" />
        </span>
        LinguaForge
      </Link>
      <nav className="mt-12 space-y-1" aria-label="Desktop navigation">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg bg-white/[0.06] px-3 py-2.5 text-sm font-medium text-white"
        >
          <LayoutDashboard className="h-4 w-4 text-accent-primary" />
          Dashboard
        </Link>
        <Link
          href={learnHref}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <BookOpen className="h-4 w-4" />
          Learn
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-white"
        >
          <UserRound className="h-4 w-4" />
          Profile
        </Link>
      </nav>
      <div className="absolute bottom-7 left-5 right-5 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
        <p className="text-xs text-zinc-500">Focused practice</p>
        <p className="mt-2 text-sm leading-5 text-zinc-300">Your next review is waiting when you are.</p>
      </div>
    </aside>
  );
}