"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { scaleIn } from "@/lib/motion";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function SessionComplete({ correctCount, totalCount, onRestart }: { correctCount: number; totalCount: number; onRestart: () => void }) {
  useEffect(() => {
    void confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#6c63ff", "#10b981", "#ffffff"] });
  }, []);

  return <AnimatePresence><div className="fixed inset-0 z-50 grid place-items-center bg-base/90 px-6 backdrop-blur-sm"><motion.div {...scaleIn} className="w-full max-w-md rounded-2xl border border-white/10 bg-elevated p-8 text-center shadow-2xl sm:p-10"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/10"><CheckCircle2 className="h-8 w-8 text-emerald-300" /></div><p className="mt-7 text-xs font-medium uppercase tracking-[0.18em] text-accent-primary">Session complete</p><h2 className="mt-3 font-display text-4xl tracking-tight text-white">You showed up.</h2><p className="mt-3 text-sm leading-6 text-zinc-400">{correctCount} of {totalCount} answers were correct. Small, focused sessions build lasting recall.</p><div className="mt-8"><ShimmerButton type="button" onClick={onRestart} className="w-full">Practice again</ShimmerButton></div></motion.div></div></AnimatePresence>;
}
