"use client";

import { FormEvent, useState } from "react";
import { motion } from "motion/react";
import { Send, BookOpen, Sparkles } from "lucide-react";
import { correctFlash } from "@/lib/motion";
import { MAX_ANSWER_LENGTH } from "@/lib/utils";

export function StoryCompletionInput({
  prompt,
  correctAnswer,
  disabled,
  initialAnswer = "",
  onAnswered,
}: {
  prompt: string;
  correctAnswer: string | string[];
  disabled: boolean;
  initialAnswer?: string;
  onAnswered: (answer: string, correct: boolean) => void;
}) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [result, setResult] = useState<boolean | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || result !== null) return;
    setResult(true);
    onAnswered(answer, true);
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-4">
      <motion.div
        {...(result === true ? correctFlash : {})}
        className={`rounded-lg border p-1 ${result === true ? "border-emerald-400/50" : "border-white/10"}`}
      >
        <label htmlFor="story-completion-answer" className="sr-only">{prompt}</label>
        <p className="mb-2 text-sm text-zinc-400">Story so far:</p>
        <p className="mb-3 font-mono text-base text-zinc-300 bg-white/[0.03] p-4 rounded-md">{prompt}</p>
        <p className="mb-2 text-sm text-zinc-400">Continue the story (one sentence):</p>
        <textarea
          id="story-completion-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={disabled || result !== null}
          rows={3}
          maxLength={MAX_ANSWER_LENGTH}
          placeholder="Write the next sentence..."
          className="block w-full resize-none rounded-md bg-white/[0.03] p-4 text-base leading-6 text-white outline-none placeholder:text-zinc-500 focus:bg-white/[0.06]"
        />
      </motion.div>
      <button
        type="submit"
        disabled={disabled || result !== null || !answer.trim()}
        className="inline-flex h-11 items-center gap-2 rounded-md bg-accent-primary px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" /> Continue story
      </button>
      {result !== null && (
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div>
              <p className="font-medium text-emerald-200">Story continued</p>
              <p className="mt-1 text-sm leading-6 text-zinc-300">
                Your sentence has been added to the story. Since this is a creative exercise, there&apos;s no single correct answer.
              </p>
              {correctAnswer && (
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  <span className="font-medium text-white">Model continuation:</span> {Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
