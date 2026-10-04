"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Flame, Sparkles } from "lucide-react";

export function StreakCard({ streakCount = 0 }: { streakCount?: number }) {
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 180, damping: 24 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    count.set(streakCount);
    const unsubscribe = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsubscribe;
  }, [count, streakCount, spring]);

  return (
    <section className="relative overflow-hidden rounded-xl border border-default bg-surface p-6">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">Current streak</p>
          <motion.p className="mt-3 font-display text-5xl tracking-tight text-white">{display}</motion.p>
          <p className="mt-2 text-sm text-zinc-500">{streakCount > 0 ? "Keep your practice rhythm going." : "Start a session to build momentum."}</p>
        </div>
        <div className="rounded-lg border border-orange-400/20 bg-orange-400/10 p-3 text-orange-300">
          <Flame className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-7 flex items-center gap-2 text-xs text-zinc-500">
        <Sparkles className="h-3.5 w-3.5 text-accent-primary" />
        <span>Consistency compounds over time.</span>
      </div>
    </section>
  );
}
