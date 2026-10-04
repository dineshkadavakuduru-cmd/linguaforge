"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function CardContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 180, damping: 22 });

  return <motion.div ref={ref} onPointerMove={(event) => { const bounds = ref.current?.getBoundingClientRect(); if (!bounds) return; x.set((event.clientX - bounds.left) / bounds.width - 0.5); y.set((event.clientY - bounds.top) / bounds.height - 0.5); }} onPointerLeave={() => { x.set(0); y.set(0); }} style={{ rotateX, rotateY, transformPerspective: 900 }} className="h-full">{children}</motion.div>;
}

export function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`h-full transform-gpu rounded-xl ${className}`}>{children}</div>;
}
