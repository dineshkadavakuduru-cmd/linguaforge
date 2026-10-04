"use client";

import { motion } from "motion/react";

export function MasteryRing({ label, value }: { label: string; value: number }) {
  const percent = Math.max(0, Math.min(1, value));
  return <div className="flex items-center gap-4"><div className="relative h-16 w-16"><svg viewBox="0 0 40 40" className="h-full w-full -rotate-90"><circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" /><motion.circle cx="20" cy="20" r="16" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" pathLength="1" initial={{ pathLength: 0 }} animate={{ pathLength: percent }} transition={{ duration: 0.8, ease: "easeOut" }} /></svg><span className="absolute inset-0 grid place-items-center text-xs font-medium text-white">{Math.round(percent * 100)}%</span></div><div><p className="text-sm font-medium capitalize text-zinc-200">{label.replaceAll("-", " ")}</p><p className="mt-1 text-xs text-zinc-500">Skill mastery</p></div></div>;
}
