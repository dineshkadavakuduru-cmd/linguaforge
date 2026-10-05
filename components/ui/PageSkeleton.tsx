import { Languages } from "lucide-react";

/**
 * Full-page skeleton used while auth state or page data resolves, so users
 * never see an unbounded blank/loading-text screen.
 */
export function PageSkeleton({ label }: { label?: string }) {
  return (
    <main
      className="grid min-h-dvh place-items-center bg-base px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid h-10 w-10 animate-pulse place-items-center rounded-lg bg-white/10">
          <Languages className="h-5 w-5 text-zinc-400" aria-hidden="true" />
        </div>
        <div className="mx-auto mt-6 h-4 w-48 animate-pulse rounded bg-white/10" />
        <div className="mx-auto mt-3 h-4 w-64 max-w-full animate-pulse rounded bg-white/[0.07]" />
        <div className="mx-auto mt-8 grid w-full max-w-sm gap-3">
          <div className="h-12 animate-pulse rounded-md bg-white/[0.07]" />
          <div className="h-12 animate-pulse rounded-md bg-white/[0.07]" />
        </div>
        <span className="sr-only">{label || "Loading…"}</span>
      </div>
    </main>
  );
}

export default PageSkeleton;
