"use client";

import { ExerciseCard } from "@/components/exercise/ExerciseCard";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { ExerciseCardErrorBoundary } from "@/components/exercise/ExerciseCardErrorBoundary";

export default function LearnClient({ lang, skillId }: { lang: string; skillId: string }) {
  const { user, loading, shouldRedirect } = useRequireAuth();
  if (loading || shouldRedirect) return <PageSkeleton label="Loading lesson…" />;
  if (!user) return null;
  return <main className="min-h-dvh bg-base px-6 py-8 pb-28 sm:py-12"><ExerciseCardErrorBoundary><ExerciseCard uid={user.uid} lang={lang} skillId={skillId} /></ExerciseCardErrorBoundary><FloatingNav /></main>;
}
