"use client";

import { useRouter } from "next/navigation";
import { ExerciseCard } from "@/components/exercise/ExerciseCard";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { useAuth } from "@/components/providers/AuthProvider";
import { ExerciseCardErrorBoundary } from "@/components/exercise/ExerciseCardErrorBoundary";

export default function LearnClient({ lang, skillId }: { lang: string; skillId: string }) {
  const router = useRouter(); const { user, loading } = useAuth();
  if (loading) return <main className="grid min-h-dvh place-items-center bg-base text-sm text-zinc-500">Loading lesson...</main>;
  if (!user) { router.replace("/auth"); return null; }
  return <main className="min-h-dvh bg-base px-6 py-8 pb-28 sm:py-12"><ExerciseCardErrorBoundary><ExerciseCard uid={user.uid} lang={lang} skillId={skillId} /></ExerciseCardErrorBoundary><FloatingNav /></main>;
}
