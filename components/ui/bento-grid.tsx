import { cn } from "@/lib/utils";

export function BentoGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid gap-4 md:grid-cols-6", className)}>{children}</div>;
}

export function BentoGridItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return <article className={cn("group relative overflow-hidden rounded-xl border border-white/10 bg-surface p-6 transition-colors hover:border-white/20", className)}>{children}</article>;
}
