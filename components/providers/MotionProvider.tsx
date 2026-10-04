"use client";

import { RouteTransition } from "@/components/layout/RouteTransition";

export function MotionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RouteTransition>{children}</RouteTransition>;
}
