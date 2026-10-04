"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { correctFlash, wrongShake } from "@/lib/motion";

interface MCQOptionsProps {
  options: string[];
  correctAnswer: string | string[];
  disabled?: boolean;
  onAnswered: (answer: string, correct: boolean) => void;
}

export function MCQOptions({ options, correctAnswer, disabled = false, onAnswered }: MCQOptionsProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const answer = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;

  function choose(option: string) {
    if (disabled || selected) return;
    setSelected(option);
    onAnswered(option, option.trim().toLowerCase() === answer.trim().toLowerCase());
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option, index) => {
        const isSelected = selected === option;
        const isCorrect = isSelected && option.trim().toLowerCase() === answer.trim().toLowerCase();
        const isWrong = isSelected && !isCorrect;
        return (
          <motion.button
            key={`${option}-${index}`}
            type="button"
            disabled={disabled || Boolean(selected)}
            onClick={() => choose(option)}
            whileTap={{ scale: 0.98 }}
            {...(isCorrect ? correctFlash : {})}
            {...(isWrong ? wrongShake : {})}
            className={cn(
              "flex min-h-14 items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 text-left text-sm text-zinc-200 transition-colors hover:border-accent-primary/50 hover:bg-white/[0.06] disabled:cursor-default",
              isCorrect && "border-emerald-400/50 bg-emerald-400/10 text-emerald-100",
              isWrong && "border-rose-400/50 bg-rose-400/10 text-rose-100",
            )}
          >
            <span>{option}</span>
            {isCorrect && <Check className="h-4 w-4 text-emerald-300" />}
            {isWrong && <X className="h-4 w-4 text-rose-300" />}
          </motion.button>
        );
      })}
    </div>
  );
}
