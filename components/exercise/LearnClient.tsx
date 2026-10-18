"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { ExerciseCard } from "@/components/exercise/ExerciseCard";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { useRequireAuth } from "@/components/providers/AuthProvider";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { ExerciseCardErrorBoundary } from "@/components/exercise/ExerciseCardErrorBoundary";

export default function LearnClient({ lang, skillId }: { lang: string; skillId: string }) {
  const { user, loading, error, retry, shouldRedirect } = useRequireAuth();

  // Same bounded states as every other protected page: init → skeleton,
  // auth init error → retry card, resolved without a user → redirect.
  if (loading || shouldRedirect) return <PageSkeleton label="Loading lesson…" />;
  if (error && !user) {
    return (
      <main className="grid min-h-dvh place-items-center bg-base px-6">
        <div className="w-full max-w-md rounded-xl border border-default bg-surface p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-rose-400/20 bg-rose-400/10">
            <AlertCircle className="h-6 w-6 text-rose-300" aria-hidden="true" />
          </div>
          <h1 className="mt-6 font-display text-2xl tracking-tight text-white">We couldn&apos;t start this lesson</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-zinc-300">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-medium text-white hover:bg-white/[0.05]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry
          </button>
        </div>
      </main>
    );
  }
  if (!user) return null;

  return (
    <main className="min-h-dvh bg-base px-6 py-8 pb-28 sm:py-12">
      <ExerciseCardErrorBoundary>
        <ExerciseCard uid={user.uid} lang={lang} skillId={skillId} />
      </ExerciseCardErrorBoundary>
      <FloatingNav />
    </main>
  );
}
