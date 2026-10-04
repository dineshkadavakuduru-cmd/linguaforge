"use client";

import { motion } from "motion/react";

export function ProgressBar({ label, value }: { label: string; value: number }) {
  const percent = Math.max(0, Math.min(1, value));
  return <div><div className="flex items-center justify-between text-sm"><span className="text-zinc-300">{label}</span><span className="text-zinc-500">{Math.round(percent * 100)}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><motion.div initial={{ scaleX: 0 }} animate={{ scaleX: percent }} transition={{ duration: 0.7, ease: "easeOut" }} className="h-full origin-left rounded-full bg-accent-primary" /></div></div>;
}
