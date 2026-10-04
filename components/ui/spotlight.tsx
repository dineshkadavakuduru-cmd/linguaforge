"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function Spotlight({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 120, damping: 24 });
  const smoothY = useSpring(y, { stiffness: 120, damping: 24 });
  const left = useTransform(smoothX, (value) => `${value - 220}px`);
  const top = useTransform(smoothY, (value) => `${value - 220}px`);
  return <div ref={ref} onPointerMove={(event) => { const bounds = ref.current?.getBoundingClientRect(); if (!bounds) return; x.set(event.clientX - bounds.left); y.set(event.clientY - bounds.top); }} className="relative overflow-hidden"> <motion.div aria-hidden="true" style={{ left, top }} className="pointer-events-none absolute h-[440px] w-[440px] rounded-full bg-accent-primary/[0.08] blur-3xl" />{children}</div>;
}
