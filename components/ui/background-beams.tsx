"use client";

export function BackgroundBeams() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[12%] top-[-22%] h-[130%] w-px rotate-[28deg] bg-gradient-to-b from-transparent via-accent-primary/40 to-transparent blur-[1px]" />
      <div className="absolute left-[42%] top-[-25%] h-[140%] w-px rotate-[28deg] bg-gradient-to-b from-transparent via-white/15 to-transparent" />
      <div className="absolute right-[18%] top-[-18%] h-[125%] w-px rotate-[28deg] bg-gradient-to-b from-transparent via-accent-primary/25 to-transparent blur-[1px]" />
      <div className="absolute inset-x-0 top-1/3 h-56 bg-accent-primary/[0.06] blur-3xl" />
    </div>
  );
}
