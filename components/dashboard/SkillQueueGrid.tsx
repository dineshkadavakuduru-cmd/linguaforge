import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

export interface ReviewQueueItem {
  skillId: string;
  lang: string;
  masteryScore: number;
  nextDue: string;
  reviewCount: number;
  isMastered: boolean;
}

export function SkillQueueGrid({ reviews = [], loading = false }: { reviews?: ReviewQueueItem[]; loading?: boolean }) {
  if (loading) return <section className="animate-pulse"><div className="mb-4 h-8 w-56 rounded bg-white/10" /><div className="h-48 rounded-xl border border-white/10 bg-surface/50" /></section>;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-zinc-400">Practice queue</p>
          <h2 className="mt-1 font-display text-2xl tracking-tight text-white">Ready when you are</h2>
        </div>
        <span className="text-xs text-zinc-600">{reviews.length ? `${reviews.length} due` : "No reviews due"}</span>
      </div>
      {reviews.length === 0 ? <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-white/10 bg-surface/50 p-8 text-center"><div><p className="text-sm font-medium text-zinc-300">Your skill queue is empty</p><p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">Complete a lesson and your next focused practice items will appear here.</p></div></div> : <div className="grid gap-3 md:grid-cols-2">{reviews.map((review) => <Link key={review.skillId} href={`/learn/${review.lang}/${review.skillId}`} className="group rounded-xl border border-white/10 bg-surface p-5 transition-colors hover:border-accent-primary/40"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-white">{review.skillId.replaceAll("-", " ")}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><Clock3 className="h-3.5 w-3.5" /> Review {review.reviewCount + 1}</p></div><ArrowUpRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-accent-primary" /></div><div className="mt-5 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-accent-primary" style={{ width: `${Math.round(review.masteryScore * 100)}%` }} /></div></Link>)}</div>}
    </section>
  );
}
