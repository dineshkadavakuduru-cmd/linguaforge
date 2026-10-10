"use client";

import { ExerciseCard } from "@/components/exercise/ExerciseCard";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { ExerciseCardErrorBoundary } from "@/components/exercise/ExerciseCardErrorBoundary";

export default function LearnClient({ lang, skillId }: { lang: string; skillId: string }) {
  const { user, loading, error: authError, retry, shouldRedirect } = useRequireAuth();
  if (loading || shouldRedirect) return <PageSkeleton label="Loading lesson…" />;
  if (authError && !user) {
    return (
      <main className="grid min-h-dvh place-items-center bg-base px-6">
        <div className="w-full max-w-md rounded-xl border border-default bg-surface p-8 text-center">
          <h1 className="font-display text-2xl tracking-tight text-white">We couldn&apos;t load the lesson</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-zinc-300">{authError}</p>
          <button type="button" onClick={retry} className="mt-6 inline-flex h-10 items-center rounded-md border border-white/10 px-4 text-sm font-medium text-white hover:bg-white/[0.05]">Retry</button>
        </div>
      </main>
    );
  }
  if (!user) return null;
  return <main className="min-h-dvh bg-base px-6 py-8 pb-28 sm:py-12"><ExerciseCardErrorBoundary><ExerciseCard uid={user.uid} lang={lang} skillId={skillId} /></ExerciseCardErrorBoundary><FloatingNav /></main>;
}
