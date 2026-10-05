"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Flag, Loader2, XCircle } from "lucide-react";
import type { SaveState } from "@/lib/utils";

export function FeedbackOverlay({
  correct,
  explanation,
  exerciseId,
  uid,
  saveState,
  onContinue,
}: {
  correct: boolean;
  explanation: string;
  exerciseId: string;
  uid: string;
  saveState: SaveState | null;
  onContinue: () => void;
}) {
  const [flagged, setFlagged] = useState(false);
  const [flagFailed, setFlagFailed] = useState(false);
  const continueRef = useRef<HTMLButtonElement>(null);

  // Move keyboard focus to the next action once feedback appears.
  useEffect(() => {
    continueRef.current?.focus();
  }, []);

  async function flagExercise() {
    setFlagFailed(false);
    try {
      const response = await fetch("/api/flag-exercise", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ exerciseId, uid }) });
      if (!response.ok) throw new Error("Flag request failed.");
      setFlagged(true);
    } catch {
      setFlagFailed(true);
    }
  }

  const saving = saveState === "saving";

  return (
    <div
      className={`mt-6 rounded-lg border p-4 ${correct ? "border-emerald-400/20 bg-emerald-400/10" : "border-rose-400/20 bg-rose-400/10"}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {correct ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" aria-hidden="true" />}
        <div>
          <p className={`font-medium ${correct ? "text-emerald-200" : "text-rose-200"}`}>{correct ? "Correct" : "Not quite"}</p>
          <p className="mt-1 text-sm leading-6 text-zinc-300">{explanation}</p>
          {saveState === "saving" && <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400"><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Saving your answer…</p>}
          {saveState === "failed" && <p className="mt-2 flex items-center gap-2 text-xs text-amber-300"><AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Your answer could not be saved — progress may be incomplete. You can continue anyway.</p>}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          ref={continueRef}
          onClick={onContinue}
          disabled={saving}
          aria-busy={saving}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.06] disabled:cursor-wait disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {saving ? "Saving…" : "Continue"}
        </button>
        <button type="button" disabled={flagged} onClick={() => void flagExercise()} className="inline-flex h-10 items-center gap-2 px-2 text-xs text-zinc-500 transition-colors hover:text-zinc-300 disabled:text-emerald-300">
          <Flag className="h-3.5 w-3.5" aria-hidden="true" /> {flagged ? "Flagged" : flagFailed ? "Report failed — try again" : "Report exercise"}
        </button>
      </div>
    </div>
  );
}
