"use client";

import { useEffect, useState } from "react";
import { BookOpen, LayoutDashboard, UserRound } from "lucide-react";
import { FloatingDock, FloatingDockItem } from "@/components/ui/floating-dock";
import { useAuth } from "@/components/providers/AuthProvider";
import { spanishConfig, japaneseConfig } from "@/lib/generation/seedData";

export function FloatingNav() {
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

  const items: FloatingDockItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Learn", href: learnHref, icon: <BookOpen className="h-5 w-5" /> },
    { title: "Profile", href: "/profile", icon: <UserRound className="h-5 w-5" /> },
  ];

  return <FloatingDock items={items} />;
}