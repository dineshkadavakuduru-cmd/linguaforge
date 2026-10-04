"use client";

import { useState } from "react";
import { CheckCircle2, Flag, XCircle } from "lucide-react";

export function FeedbackOverlay({ correct, explanation, exerciseId, uid, onContinue }: { correct: boolean; explanation: string; exerciseId: string; uid: string; onContinue: () => void }) {
  const [flagged, setFlagged] = useState(false);
  async function flagExercise() { const response = await fetch("/api/flag-exercise", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ exerciseId, uid }) }); if (response.ok) setFlagged(true); }
  return (
    <div className={`mt-6 rounded-lg border p-4 ${correct ? "border-emerald-400/20 bg-emerald-400/10" : "border-rose-400/20 bg-rose-400/10"}`}>
      <div className="flex items-start gap-3">
        {correct ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />}
        <div>
          <p className={`font-medium ${correct ? "text-emerald-200" : "text-rose-200"}`}>{correct ? "Correct" : "Not quite"}</p>
          <p className="mt-1 text-sm leading-6 text-zinc-300">{explanation}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={onContinue} className="inline-flex h-10 items-center rounded-md border border-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]">Continue</button><button type="button" disabled={flagged} onClick={() => void flagExercise()} className="inline-flex h-10 items-center gap-2 px-2 text-xs text-zinc-500 transition-colors hover:text-zinc-300 disabled:text-emerald-300"><Flag className="h-3.5 w-3.5" /> {flagged ? "Flagged" : "Report exercise"}</button></div>
    </div>
  );
}
