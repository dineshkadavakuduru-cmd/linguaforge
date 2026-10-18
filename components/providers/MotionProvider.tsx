"use client";

import { MotionConfig } from "motion/react";
import { RouteTransition } from "@/components/layout/RouteTransition";

export function MotionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // `reducedMotion="user"` makes every motion/react animation honour the OS
  // "prefers-reduced-motion" setting, matching the CSS-level handling in
  // globals.css so JS-driven transforms stop too.
  return (
    <MotionConfig reducedMotion="user">
      <RouteTransition>{children}</RouteTransition>
    </MotionConfig>
  );
}
