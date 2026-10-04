"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { LanguageCard } from "@/components/dashboard/LanguageCard";
import { SkillQueueGrid } from "@/components/dashboard/SkillQueueGrid";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { Spotlight } from "@/components/ui/spotlight";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { spanishConfig, japaneseConfig } from "@/lib/generation/seedData";
import type { CheckInResponse } from "@/types";
import type { ReviewQueueItem } from "@/components/dashboard/SkillQueueGrid";

const languageInfo: Record<string, { name: string; nativeName: string; rootSkill: string }> = {
  es: { name: "Spanish", nativeName: "Español", rootSkill: spanishConfig.skillGraphRoot },
  ja: { name: "Japanese", nativeName: "日本語", rootSkill: japaneseConfig.skillGraphRoot },
};

export default function DashboardClient() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [streak, setStreak] = useState(0);
  const [reviews, setReviews] = useState<ReviewQueueItem[]>([]);
  const [activeLanguages, setActiveLanguages] = useState<string[]>(["es"]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let active = true;

    async function loadDashboard() {
      setDashboardLoading(true);
      try {
        // Fetch user profile to get activeLanguages
        const profileResponse = await fetch(`/api/profile?uid=${encodeURIComponent(uid)}`);
        if (profileResponse.ok) {
          const profile = await profileResponse.json() as { activeLanguages?: string[] };
          if (profile.activeLanguages && active) {
            setActiveLanguages(profile.activeLanguages);
          }
        }

        // Fetch check-in and reviews for active languages
        const reviewPromises = activeLanguages.map((lang) =>
          fetch(`/api/reviews?uid=${encodeURIComponent(uid)}&lang=${encodeURIComponent(lang)}`)
        );

        const [checkInResponse, ...reviewResponses] = await Promise.all([
          fetch("/api/check-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid }) }),
          ...reviewPromises,
        ]);

        if (!active) return;

        if (checkInResponse.ok) {
          const checkIn = await checkInResponse.json() as CheckInResponse;
          setStreak(checkIn.streakCount);
        }

        const reviewPayloads = await Promise.all(
          reviewResponses.map(async (response) =>
            response.ok ? response.json() as Promise<{ reviews?: ReviewQueueItem[] }> : { reviews: [] }
          )
        );
        setReviews(reviewPayloads.flatMap((payload) => payload.reviews ?? []));
      } catch {
        // Errors are handled by empty states
      } finally {
        if (active) setDashboardLoading(false);
      }
    }

    void loadDashboard();
    return () => { active = false; };
  }, [user, activeLanguages]);

  if (loading) return <div className="grid min-h-dvh place-items-center bg-base text-sm text-zinc-500">Loading dashboard...</div>;
  if (!user) { router.replace("/auth"); return null; }

  const firstName = user.displayName?.split(" ")[0] || "Learner";

  return (
    <main className="min-h-dvh bg-base pb-28 lg:pl-64">
      <DesktopSidebar />
      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-12 lg:py-12">
        <Spotlight>
          <header className="flex items-center justify-between border-b border-white/10 pb-8">
            <div>
              <p className="text-sm text-zinc-500">Your workspace</p>
              <h1 className="mt-2 font-display text-4xl tracking-tight text-white">Good to see you, {firstName}.</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="hidden h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white sm:flex"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                aria-label="Sign out"
                className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>
        </Spotlight>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <StreakCard streakCount={streak} />
          {activeLanguages.map((lang) => {
            const info = languageInfo[lang];
            if (!info) return null;
            return (
              <LanguageCard
                key={lang}
                lang={lang}
                name={info.name}
                nativeName={info.nativeName}
                skillId={info.rootSkill}
              />
            );
          })}
        </div>
        <div className="mt-10"><SkillQueueGrid reviews={reviews} loading={dashboardLoading} /></div>
        <div className="mt-6"><StreakCalendar uid={user.uid} /></div>
      </div>
      <FloatingNav />
    </main>
  );
}
