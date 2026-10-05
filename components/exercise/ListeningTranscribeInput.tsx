"use client";

import { FormEvent, useState } from "react";
import { motion } from "motion/react";
import { Check, Send, Volume2, X } from "lucide-react";
import { correctFlash, wrongShake } from "@/lib/motion";
import { MAX_ANSWER_LENGTH } from "@/lib/utils";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function ListeningTranscribeInput({
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
  const [played, setPlayed] = useState(Boolean(initialAnswer));
  const acceptedAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

  function handlePlay() {
    setPlayed(true);
    // In a real implementation, this would play TTS audio
    // For now, we show the "listening simulation" text
  }

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
        <label htmlFor="listening-transcribe-answer" className="sr-only">{prompt}</label>
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={handlePlay}
            disabled={disabled || result !== null}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
            aria-label="Play audio"
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm text-zinc-400">Listen and type what you hear</p>
            <p className="text-xs text-zinc-600">(Listening simulation - text shown below)</p>
          </div>
        </div>
        {!played && (
          <p className="mb-3 text-center text-zinc-500 italic">Click the play button to hear the audio</p>
        )}
        {played && (
          <p className="mb-3 font-mono text-base text-zinc-200 bg-white/[0.03] p-4 rounded-md text-center">
            {prompt}
          </p>
        )}
        <textarea
          id="listening-transcribe-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          disabled={disabled || result !== null || !played}
          rows={3}
          maxLength={MAX_ANSWER_LENGTH}
          placeholder={played ? "Type what you heard (in romaji/translation)" : "Listen first, then type"}
          className="block w-full resize-none rounded-md bg-white/[0.03] p-4 text-base leading-6 text-white outline-none placeholder:text-zinc-500 focus:bg-white/[0.06] disabled:opacity-50"
        />
      </motion.div>
      <button
        type="submit"
        disabled={disabled || result !== null || !answer.trim() || !played}
        className="inline-flex h-11 items-center gap-2 rounded-md bg-accent-primary px-5 text-sm font-semibold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" /> Check transcription
      </button>
      {result !== null && (
        <p className={`flex items-center gap-2 text-sm ${result ? "text-emerald-300" : "text-rose-300"}`}>
          {result ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {result ? "Correct transcription" : `Expected: ${acceptedAnswers[0]}`}
        </p>
      )}
    </form>
  );
}
