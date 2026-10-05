"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Languages, LogOut, Plus, Save } from "lucide-react";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/client";
import { useAuth, useRequireAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Avatar } from "@/components/profile/Avatar";
import { MasteryRing } from "@/components/profile/MasteryRing";
import { ProgressBar } from "@/components/profile/ProgressBar";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { spanishSkills, japaneseSkills } from "@/lib/generation/seedData";
import type { UserDoc } from "@/types";

const availableLanguages = [{ code: "es", name: "Spanish", nativeName: "Español" }, { code: "ja", name: "Japanese", nativeName: "日本語" }];

export default function ProfileClient() {
  const router = useRouter();
  const { user, loading, error: authError, retry, shouldRedirect } = useRequireAuth();
  const { signOut } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [profile, setProfile] = useState<Partial<UserDoc> | null>(null);
  const [goal, setGoal] = useState(10);
  const [notifications, setNotifications] = useState(true);
  const [activeLanguages, setActiveLanguages] = useState(["es"]);
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<"idle" | "saving" | "saved" | "failed">("idle");

  useEffect(() => {
    if (!user) return;
    void Promise.all([
      getDoc(doc(db, "users", user.uid)),
      getDocs(query(collection(db, "userProgress"), where("uid", "==", user.uid))),
    ]).then(([profileSnapshot, progressSnapshot]) => {
      const data = profileSnapshot.data() as UserDoc | undefined;
      if (data) {
        setProfile(data); setGoal(data.settings?.dailyGoalMinutes ?? 10); setNotifications(data.settings?.notificationsEnabled ?? true); setTheme(data.settings?.uiTheme ?? "dark"); setActiveLanguages(data.activeLanguages ?? ["es"]);
      }
      const progressMap: Record<string, number> = {};
      progressSnapshot.forEach((progressDoc) => {
        const progress = progressDoc.data() as { lang?: string; skillId?: string; masteryScore?: number };
        if (progress.lang && progress.skillId) progressMap[`${progress.lang}_${progress.skillId}`] = progress.masteryScore ?? 0;
      });
      setProgressData(progressMap);
    }).catch(() => { setProfile(null); setProgressData({}); });
  }, [user, setTheme]);

  if (loading || shouldRedirect) return <PageSkeleton label="Loading profile…" />;
  if (authError && !user) {
    return (
      <main className="grid min-h-dvh place-items-center bg-base px-6">
        <div className="w-full max-w-md rounded-xl border border-default bg-surface p-8 text-center">
          <h1 className="font-display text-2xl tracking-tight text-white">We couldn&apos;t load your profile</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-zinc-300">{authError}</p>
          <button type="button" onClick={retry} className="mt-6 inline-flex h-10 items-center rounded-md border border-white/10 px-4 text-sm font-medium text-white hover:bg-white/[0.05]">Retry</button>
        </div>
      </main>
    );
  }
  if (!user) return null;

  async function saveSettings() {
    if (!user) return;
    if (saved === "saving") return;
    setSaved("saving");
    try {
      await setDoc(doc(db, "users", user.uid), { activeLanguages, settings: { dailyGoalMinutes: goal, notificationsEnabled: notifications, uiTheme: theme } }, { merge: true });
      setSaved("saved");
      window.setTimeout(() => setSaved("idle"), 2000);
    } catch {
      setSaved("failed");
      window.setTimeout(() => setSaved("idle"), 4000);
    }
  }

  function toggleLanguage(code: string) { if (code === "es" && activeLanguages.includes("es")) return; setActiveLanguages((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]); }
  const displayName = profile?.displayName || user.displayName || "Learner";
  const getLangProgress = (langCode: string) => {
    const languageSkills = langCode === "ja" ? japaneseSkills : spanishSkills;
    const scores = languageSkills.map((skill) => progressData[`${langCode}_${skill.skillId}`] ?? 0);
    return scores.reduce((total, score) => total + score, 0) / scores.length;
  };
  const skills = activeLanguages.flatMap((language) => (language === "ja" ? japaneseSkills : spanishSkills).map((skill) => ({ ...skill, lang: language })));

  async function handleSignOut() {
    if (saved === "saving") return;
    await signOut();
    router.replace("/auth");
  }

  return <main className="min-h-dvh bg-base pb-28 lg:pl-64"><DesktopSidebar /><div className="mx-auto max-w-6xl px-6 py-8 lg:px-12 lg:py-12"><header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-8"><div className="flex items-center gap-4"><Avatar user={user} /><div><p className="text-sm text-zinc-500">Your profile</p><h1 className="mt-1 font-display text-3xl tracking-tight text-white">{displayName}</h1><p className="mt-1 text-sm text-zinc-500">{user.email}</p></div></div><button type="button" onClick={() => void handleSignOut()} className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"><LogOut className="h-4 w-4" /> Sign out</button></header><div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><section className="rounded-xl border border-default bg-surface p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-zinc-400">Your mastery</p><h2 className="mt-1 font-display text-2xl text-white">Skills in progress</h2></div><Languages className="h-5 w-5 text-accent-primary" /></div><div className="mt-7 grid gap-6 sm:grid-cols-2">{skills.map((skill) => <MasteryRing key={`${skill.lang}-${skill.skillId}`} label={skill.skillId} value={progressData[`${skill.lang}_${skill.skillId}`] ?? 0} />)}</div></section><section className="rounded-xl border border-default bg-surface p-6"><p className="text-sm text-zinc-400">Language progress</p><h2 className="mt-1 font-display text-2xl text-white">Your languages</h2><div className="mt-7 space-y-6">{availableLanguages.filter((language) => activeLanguages.includes(language.code)).map((language) => <ProgressBar key={language.code} label={`${language.name} · ${language.nativeName}`} value={getLangProgress(language.code)} />)}</div></section></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-xl border border-default bg-surface p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-zinc-400">Preferences</p><h2 className="mt-1 font-display text-2xl text-white">Practice settings</h2></div><div className="flex items-center gap-3">{saved === "saved" && <span role="status" className="text-xs text-emerald-300">Saved</span>}{saved === "failed" && <span role="alert" className="text-xs text-rose-300">Save failed — check your connection</span>}<button type="button" onClick={() => void saveSettings()} disabled={saved === "saving"} aria-busy={saved === "saving"} className="inline-flex h-9 items-center gap-2 rounded-md bg-accent-primary px-3 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-70"><Save className="h-3.5 w-3.5" /> {saved === "saving" ? "Saving…" : saved === "saved" ? "Saved" : "Save"}</button></div></div><div className="mt-7 space-y-6"><label className="block"><span className="text-sm text-zinc-300">Daily goal</span><span className="mt-2 flex items-center gap-3"><input type="range" min="5" max="60" step="5" value={goal} onChange={(event) => setGoal(Number(event.target.value))} className="w-full accent-[var(--accent-primary)]" /><span className="w-12 text-right text-sm text-zinc-500">{goal}m</span></span></label><label className="flex items-center justify-between gap-4"><span><span className="block text-sm text-zinc-300">Notifications</span><span className="mt-1 block text-xs text-zinc-500">Practice reminders and progress updates.</span></span><input type="checkbox" checked={notifications} onChange={(event) => setNotifications(event.target.checked)} className="h-4 w-4 accent-[var(--accent-primary)]" /></label><label className="flex items-center justify-between gap-4"><span><span className="block text-sm text-zinc-300">Theme</span><span className="mt-1 block text-xs text-zinc-500">Choose how LinguaForge looks.</span></span><span className="relative"><select value={theme} onChange={(event) => setTheme(event.target.value as UserDoc["settings"]["uiTheme"])} className="h-9 appearance-none rounded-md border border-white/10 bg-white/[0.04] py-1 pl-3 pr-8 text-sm text-zinc-300 outline-none"><option value="dark">Dark</option><option value="light">Light</option><option value="system">System</option></select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" /></span></label></div></section><section className="rounded-xl border border-default bg-surface p-6"><p className="text-sm text-zinc-400">Language management</p><h2 className="mt-1 font-display text-2xl text-white">Active languages</h2><div className="mt-7 space-y-3">{availableLanguages.map((language) => { const active = activeLanguages.includes(language.code); return <div key={language.code} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4"><div><p className="text-sm font-medium text-zinc-200">{language.name}</p><p className="mt-1 text-xs text-zinc-500">{language.nativeName}</p></div><button type="button" disabled={language.code === "es"} onClick={() => toggleLanguage(language.code)} className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium ${active ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-zinc-500"}`}>{active ? <><Check className="h-3.5 w-3.5" /> Active</> : <><Plus className="h-3.5 w-3.5" /> Add</>}</button></div>})}</div><p className="mt-5 text-xs leading-5 text-zinc-500">Spanish stays active as your starting language. Add Japanese whenever you are ready.</p></section></div></div><FloatingNav /></main>;
}
