"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ExerciseDoc } from "@/types";
import { MAX_ANSWER_LENGTH, SESSION_LENGTH, type SaveState } from "@/lib/utils";
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

interface SessionSnapshot {
  exercise: ExerciseDoc;
  answered: { answer: string; correct: boolean } | null;
  sessionCorrect: number;
  sessionTotal: number;
}

const SAVE_TIMEOUT_MS = 8_000;

function storageKey(uid: string, lang: string, skillId: string) {
  return `linguaforge:session:${uid}:${lang}:${skillId}`;
}

function readSnapshot(uid: string, lang: string, skillId: string): SessionSnapshot | null {
  try {
    const raw = sessionStorage.getItem(storageKey(uid, lang, skillId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSnapshot;
    if (!parsed?.exercise?.exerciseId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSnapshot(uid: string, lang: string, skillId: string, snapshot: SessionSnapshot | null) {
  try {
    if (!snapshot) sessionStorage.removeItem(storageKey(uid, lang, skillId));
    else sessionStorage.setItem(storageKey(uid, lang, skillId), JSON.stringify(snapshot));
  } catch {
    // Storage can be unavailable (private mode); the session still works, it just won't resume.
  }
}

export function ExerciseCard({ uid, lang, skillId }: { uid: string; lang: string; skillId: string }) {
  const [exercise, setExercise] = useState<ExerciseDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answered, setAnswered] = useState<{ answer: string; correct: boolean } | null>(null);
  const [saveState, setSaveState] = useState<SaveState | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const exerciseStartTime = useRef<number>(Date.now());
  // Guards against duplicate submissions for the current exercise (rapid
  // clicks, double events, or re-entrant calls before state settles).
  const submissionLock = useRef(false);

  const loadExercise = useCallback(async function loadExercise() {
    setLoading(true);
    setError("");
    setAnswered(null);
    setSaveState(null);
    submissionLock.current = false;
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
  }, [uid, lang, skillId]);

  // Restore an in-progress session (e.g. after a refresh) before fetching a
  // brand-new exercise, so refreshes never silently lose session progress.
  useEffect(() => {
    const snapshot = readSnapshot(uid, lang, skillId);
    if (snapshot) {
      setExercise(snapshot.exercise);
      setAnswered(snapshot.answered);
      setSessionCorrect(snapshot.sessionCorrect);
      setSessionTotal(snapshot.sessionTotal);
      exerciseStartTime.current = Date.now();
      submissionLock.current = Boolean(snapshot.answered);
      setLoading(false);
    } else {
      void loadExercise();
    }
  }, [uid, lang, skillId, loadExercise]);

  // Keep the stored snapshot in sync with the live session state.
  useEffect(() => {
    if (!exercise || loading) return;
    writeSnapshot(uid, lang, skillId, { exercise, answered, sessionCorrect, sessionTotal });
  }, [exercise, answered, sessionCorrect, sessionTotal, loading, uid, lang, skillId]);

  const handleAnswered = useCallback(async function handleAnswered(answer: string, correct: boolean) {
    if (!exercise || submissionLock.current) return;
    submissionLock.current = true;
    const trimmedAnswer = answer.trim().slice(0, MAX_ANSWER_LENGTH);
    setAnswered({ answer: trimmedAnswer, correct });
    setSessionTotal((current) => current + 1);
    if (correct) setSessionCorrect((current) => current + 1);
    setSaveState("saving");
    const responseTimeMs = Math.max(0, Date.now() - exerciseStartTime.current);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), SAVE_TIMEOUT_MS);
      const response = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, lang, skillId, exerciseId: exercise.exerciseId, answer: trimmedAnswer, responseTimeMs }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(payload?.error || `Could not save answer (HTTP ${response.status}).`);
      setSaveState("saved");
    } catch {
      setSaveState("failed");
    }
  }, [exercise, skillId, lang, uid]);

  function continueSession() {
    if (sessionTotal >= SESSION_LENGTH) {
      setSessionComplete(true);
      writeSnapshot(uid, lang, skillId, null);
      return;
    }
    void loadExercise();
  }

  function restartSession() {
    writeSnapshot(uid, lang, skillId, null);
    setSessionCorrect(0);
    setSessionTotal(0);
    setSessionComplete(false);
    void loadExercise();
  }

  if (loading) return <div className="mx-auto w-full max-w-3xl animate-pulse rounded-xl border border-white/10 bg-surface p-8" role="status" aria-label="Loading exercise"><div className="h-4 w-24 rounded bg-white/10" /><div className="mt-8 h-10 w-4/5 rounded bg-white/10" /><div className="mt-10 grid gap-3 sm:grid-cols-2"><div className="h-14 rounded bg-white/10" /><div className="h-14 rounded bg-white/10" /><div className="h-14 rounded bg-white/10" /><div className="h-14 rounded bg-white/10" /></div></div>;
  if (error) return <div role="alert" className="mx-auto w-full max-w-3xl rounded-xl border border-rose-400/20 bg-rose-400/10 p-6 text-sm text-rose-200">{error}<button type="button" onClick={() => void loadExercise()} className="ml-3 rounded underline underline-offset-2 hover:text-white">Try again</button></div>;
  if (!exercise) return null;

  const options = exercise.content.options ?? [];
  const answer = Array.isArray(exercise.content.correctAnswer) ? exercise.content.correctAnswer[0] : exercise.content.correctAnswer;
  const questionNumber = Math.min(sessionTotal + (answered ? 0 : 1), SESSION_LENGTH);
  const progressPercent = Math.min(100, Math.round((sessionTotal / SESSION_LENGTH) * 100));

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-center justify-between text-sm text-zinc-500"><Link href="/dashboard" className="inline-flex items-center gap-2 transition-colors hover:text-white"><ArrowLeft className="h-4 w-4" /> Dashboard</Link><span>{lang === "ja" ? "日本語 · A1" : "Spanish · A1"}</span></div>
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
        <span aria-live="polite">Question {questionNumber} of {SESSION_LENGTH}</span>
        <span>{sessionCorrect} correct</span>
      </div>
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Session progress"><motion.div className="h-full rounded-full bg-accent-primary" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.25 }} /></div>
      <AnimatePresence mode="wait">
        <motion.section key={exercise.exerciseId} {...slideInRight} className="rounded-xl border border-white/10 bg-surface p-6 shadow-2xl sm:p-10" aria-busy={saveState === "saving"}>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-accent-primary"><BookOpen className="h-3.5 w-3.5" /> Practice</div>
          <h1 className="mt-8 font-display text-3xl leading-tight tracking-tight text-white sm:text-4xl">{exercise.content.prompt}</h1>
          {exercise.content.promptNative && <p className="mt-4 border-l-2 border-accent-primary/50 pl-4 font-mono text-base leading-7 text-accent-primary/90" lang={lang === "ja" ? "ja-Latn" : undefined}>{exercise.content.promptNative}</p>}
          {exercise.exerciseType === "multiple-choice" && <div className="mt-10"><MCQOptions options={options} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} selectedAnswer={answered?.answer ?? null} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} /></div>}
          {exercise.exerciseType === "fill-blank" && <FillBlank prompt={exercise.content.prompt} correctAnswer={answer} disabled={Boolean(answered)} initialAnswer={answered?.answer ?? ""} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {exercise.exerciseType === "translation" && <TranslationInput prompt={exercise.content.prompt} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} initialAnswer={answered?.answer ?? ""} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {exercise.exerciseType === "error-correction" && <ErrorCorrectionInput prompt={exercise.content.prompt} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} initialAnswer={answered?.answer ?? ""} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {exercise.exerciseType === "free-write" && <FreeWriteInput prompt={exercise.content.prompt} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} initialAnswer={answered?.answer ?? ""} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {exercise.exerciseType === "story-completion" && <StoryCompletionInput prompt={exercise.content.prompt} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} initialAnswer={answered?.answer ?? ""} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {exercise.exerciseType === "listening-transcribe" && <ListeningTranscribeInput prompt={exercise.content.prompt} correctAnswer={exercise.content.correctAnswer} disabled={Boolean(answered)} initialAnswer={answered?.answer ?? ""} onAnswered={(selectedAnswer, correct) => void handleAnswered(selectedAnswer, correct)} />}
          {answered && <FeedbackOverlay correct={answered.correct} explanation={exercise.content.explanation} exerciseId={exercise.exerciseId} uid={uid} saveState={saveState} onContinue={continueSession} />}
        </motion.section>
      </AnimatePresence>
      {sessionComplete && <SessionComplete correctCount={sessionCorrect} totalCount={sessionTotal} onRestart={restartSession} />}
      <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-zinc-500"><Loader2 className={`h-3 w-3 ${saveState === "saving" ? "animate-spin" : "invisible"}`} aria-hidden="true" />Generated practice is cached and reused while it remains fresh.</p>
    </div>
  );
}
