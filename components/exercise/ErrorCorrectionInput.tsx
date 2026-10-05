"use client";

import { FormEvent, useState } from "react";
import { motion } from "motion/react";
import { Check, Send, X } from "lucide-react";
import { correctFlash, wrongShake } from "@/lib/motion";
import { MAX_ANSWER_LENGTH } from "@/lib/utils";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function ErrorCorrectionInput({
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
  const acceptedAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || result !== null) return;
    const correct = acceptedAnswers.some((expected) => normalize(expected) === normalize(answer));
    setResult(correct);
    onAnswered(answer, correct);
  }

  return (
    <form onSubmit={submit} className="mt-10 space-y-4">
      <motion.div
        {...(result === true ? correctFlash : result === false ? wrongShake : {})}
        className={`rounded-lg border p-1 ${result === true ? "border-emerald-400/50" : result === false ? "border-rose-400/50" : "border-white/10"}`}
      >
        <label htmlFor="error-correction-answer" className="sr-only">{prompt}</label>
        <p className="mb-2 text-sm text-zinc-400">Fix the error in this sentence:</p>
        <p className="mb-3 font-mono text-base text-zinc-200">{prompt}</p>
        <textarea
          id="error-correction-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={disabled || result !== null}
          rows={4}
          maxLength={MAX_ANSWER_LENGTH}
          placeholder="Write the corrected sentence"
          className="block w-full resize-none rounded-md bg-white/[0.03] p-4 text-base leading-6 text-white outline-none placeholder:text-zinc-500 focus:bg-white/[0.06]"
        />
      </motion.div>
      <button
        type="submit"
        disabled={disabled || result !== null || !answer.trim()}
        className="inline-flex h-11 items-center gap-2 rounded-md bg-accent-primary px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" /> Check correction
      </button>
      {result !== null && (
        <p className={`flex items-center gap-2 text-sm ${result ? "text-emerald-300" : "text-rose-300"}`}>
          {result ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {result ? "Correct!" : `Correction: ${acceptedAnswers[0]}`}
        </p>
      )}
    </form>
  );
}
