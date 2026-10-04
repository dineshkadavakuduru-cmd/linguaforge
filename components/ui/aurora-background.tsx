"use client";

import { cn } from "@/lib/utils";

export function AuroraBackground({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("relative isolate min-h-dvh overflow-hidden bg-base", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(ellipse_at_top,_rgba(108,99,255,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.12),_transparent_45%)]" />
      <div className="pointer-events-none absolute -left-24 top-[-20%] -z-10 h-[55%] w-[75%] rounded-full bg-accent-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-[-15%] -z-10 h-[50%] w-[60%] rounded-full bg-cyan-500/10 blur-3xl" />
      {children}
    </div>
  );
}
