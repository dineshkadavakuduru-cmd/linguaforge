"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { slideInRight } from "@/lib/motion";

export function RouteTransition({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  return <AnimatePresence mode="wait" initial={false}><motion.div key={pathname} {...slideInRight}>{children}</motion.div></AnimatePresence>;
}
