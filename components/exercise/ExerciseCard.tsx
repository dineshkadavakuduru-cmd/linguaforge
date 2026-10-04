"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import type { ExerciseDoc } from "@/types";
import { slideInRight } from "@/lib/motion";
import { MCQOptions } from "@/components/exercise/MCQOptions";
import { FeedbackOverlay } from "@/components/exercise/FeedbackOverlay";
import { FillBlank } from "@/components/exercise/FillBlank";
import { TranslationInput } from "@/components/exercise/TranslationInput";
import { ErrorCorrectionInput } from "@/components/exercise/ErrorCorrectionInput";
import { FreeWriteInput } from "@/components/exercise/FreeWriteInput";
import { StoryCompletionInput } from "@/components/exercise/StoryCompletionInput";
import { ListeningTranscribeInput } from "@/components/exercise/ListeningTranscribeInput";
import { SessionComplete } from "@/components/exercise/SessionComplete";

export function ExerciseCard({ uid, lang, skillId }: { uid: string; lang: string; skillId: string }) {
  const [exercise, setExercise] = useState<ExerciseDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answered, setAnswered] = useState<{ answer: string; correct: boolean } | null>(null);
  const [progress, setProgress] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const exerciseStartTime = useRef<number>(Date.now());

  async function loadExercise() {
    setLoading(true);
    setError("");
    setAnswered(null);
    try {
      const response = await fetch("/api/generate-exercise", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, lang, skillId }) });
      const payload = await response.json() as { exercise?: ExerciseDoc; error?: string };
      if (!response.ok || !payload.exercise) throw new Error(payload.error || "Unable to load exercise.");
      setExercise(payload.exercise);
      exerciseStartTime.current = Date.now();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load exercise.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadExercise(); }, [skillId, lang, uid]);

  async function handleAnswered(answer: string, correct: boolean) {
    if (!exercise) return;
    setAnswered({ answer, correct });
    setSessionTotal((current) => current + 1);
    if (correct) setSessionCorrect((current) => current + 1);
    setProgress((current) => correct ? Math.min(100, current + 20) : current);
    const responseTimeMs = Date.now() - exerciseStartTime.current;
    await fetch("/api/submit-answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid, lang, skillId, exerciseId: exercise.exerciseId, answer, responseTimeMs }) });
  }

  function continueSession() {
    if (sessionTotal >= 10) {
      setSessionComplete(true);
      return;
    }
    void loadExercise();
  }

  function restartSession() {
    setSessionCorrect(0);
    setSessionTotal(0);
    setProgress(0);
    setSessionComplete(false);
    void loadExercise();
  }

  if (loading) return <div className="mx-auto w-full max-w-3xl animate-pulse rounded-xl border border-white/10 bg-surface p-8"><div className="h-4 w-24 rounded bg-white/10" /><div className="mt-8 h-10 w-4/5 rounded bg-white/10" /><div className="mt-10 grid gap-3 sm:grid-cols-2"><div className="h-14 rounded bg-white/10" /><div className="h-14 rounded bg-white/10" /><div className="h-14 rounded bg-white/10" /><div className="h-14 rounded bg-white/10" /></div></div>;
  if (error) return <div className="mx-auto w-full max-w-3xl rounded-xl border border-rose-400/20 bg-rose-400/10 p-6 text-sm text-rose-200">{error}<button type="button" onClick={() => void loadExercise()} className="ml-3 underline">Try again</button></div>;
  if (!exercise) return null;

  const options = exercise.content.options ?? [];
  const answer = Array.isArray(exercise.content.correctAnswer) ? exercise.content.correctAnswer[0] : exercise.content.correctAnswer;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-center justify-between text-sm text-zinc-500"><Link href="/dashboard" className="inline-flex items-center gap-2 transition-colors hover:text-white"><ArrowLeft className="h-4 w-4" /> Dashboard</Link><span>{lang === "ja" ? "日本語 · A1" : "Spanish · A1"}</span></div>
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-accent-primary" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.25 }} /></div>
      <AnimatePresence mode="wait">
        <motion.section key={exercise.exerciseId} {...slideInRight} className="rounded-xl border border-white/10 bg-surface p-6 shadow-2xl sm:p-10">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-accent-primary"><BookOpen className="h-3.5 w-3.5" /> Practice</div>
          <h1 className="mt-8 font-display text-3xl leading-tight tracking-tight text-white sm:text-4xl">{exercise.content.prompt}</h1>
          {exercise.content.promptNative && <p className="mt-4 border-l-2 border-accent-primary/50 pl-4 font-mono text-base leading-7 text-accent-primary/90" lang={lang === "ja" ? "ja-Latn" : undefined}>{exercise.content.promptNative}</p>}
          {exercise.exerciseType === "multiple-choice" && <div className="mt-10"><MCQOptions options={options} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} /></div>}
          {exercise.exerciseType === "fill-blank" && <FillBlank prompt={exercise.content.prompt} correctAnswer={answer} disabled={Boolean(answered)} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {exercise.exerciseType === "translation" && <TranslationInput prompt={exercise.content.prompt} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {exercise.exerciseType === "error-correction" && <ErrorCorrectionInput prompt={exercise.content.prompt} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {exercise.exerciseType === "free-write" && <FreeWriteInput prompt={exercise.content.prompt} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {exercise.exerciseType === "story-completion" && <StoryCompletionInput prompt={exercise.content.prompt} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {exercise.exerciseType === "listening-transcribe" && <ListeningTranscribeInput prompt={exercise.content.prompt} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {answered && <FeedbackOverlay correct={answered.correct} explanation={exercise.content.explanation} exerciseId={exercise.exerciseId} uid={uid} onContinue={continueSession} />}
        </motion.section>
      </AnimatePresence>
      {sessionComplete && <SessionComplete correctCount={sessionCorrect} totalCount={sessionTotal} onRestart={restartSession} />}
      <p className="mt-5 text-center text-xs text-zinc-600">Generated practice is cached and reused while it remains fresh.</p>
    </div>
  );
}
