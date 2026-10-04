import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { cardToState, stateToCard, updateCard, type FsrsRating } from "@/lib/srs/fsrs";
import type { UserProgress } from "@/types";

export interface ReviewQueueItem {
  skillId: string;
  lang: string;
  masteryScore: number;
  nextDue: string;
  reviewCount: number;
  isMastered: boolean;
}

function asDate(value: unknown) {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (value && typeof (value as { toDate?: unknown }).toDate === "function") return (value as { toDate: () => Date }).toDate();
  return new Date(String(value));
}

export async function getNextReview(uid: string, lang: string): Promise<ReviewQueueItem[]> {
  try {
    const snapshot = await adminDb
      .collection("userProgress")
      .where("uid", "==", uid)
      .where("lang", "==", lang)
      .where("srsState.nextDue", "<=", Timestamp.now())
      .orderBy("srsState.nextDue", "asc")
      .limit(10)
      .get();

    return snapshot.docs.map((document) => {
      const progress = document.data() as UserProgress;
      const due = asDate(progress.srsState.nextDue);
      return {
        skillId: progress.skillId,
        lang: progress.lang,
        masteryScore: progress.masteryScore,
        nextDue: due.toISOString(),
        reviewCount: progress.srsState.reviewCount,
        isMastered: progress.isMastered,
      };
    });
  } catch {
    return [];
  }
}

export async function updateAfterAnswer(uid: string, lang: string, skillId: string, correct: boolean, responseTimeMs: number, exerciseId?: string) {
  const progressRef = adminDb.collection("userProgress").doc(`${uid}_${lang}_${skillId}`);
  let existing: UserProgress | null = null;
  try {
    const snapshot = await progressRef.get();
    existing = snapshot.exists ? snapshot.data() as UserProgress : null;
  } catch {
    existing = null;
  }

  const currentState = existing?.srsState;
  const priorCard = stateToCard(currentState ? {
    stability: currentState.stability,
    difficulty: currentState.difficulty,
    lastReview: asDate(currentState.lastReview),
    nextDue: asDate(currentState.nextDue),
    reviewCount: currentState.reviewCount,
    lapseCount: currentState.lapseCount,
  } : undefined);
  const rating: FsrsRating = correct ? (responseTimeMs > 7000 ? "hard" : "good") : "again";
  const nextCard = updateCard(priorCard, rating);
  const nextState = cardToState(nextCard);
  const historyEntry = {
    timestamp: Timestamp.now(),
    exerciseId: exerciseId ?? "unknown",
    correct,
    responseTime: responseTimeMs,
  };
  const history = [...(existing?.history ?? []), historyEntry].slice(-100);
  const priorMastery = existing?.masteryScore ?? 0;
  const newMasteryScore = Math.max(0, Math.min(1, priorMastery + (correct ? 0.08 : -0.04)));

  const update = {
    uid,
    lang,
    skillId,
    masteryScore: newMasteryScore,
    srsState: {
      stability: nextState.stability,
      difficulty: nextState.difficulty,
      lastReview: Timestamp.fromDate(nextState.lastReview),
      nextDue: Timestamp.fromDate(nextState.nextDue),
      reviewCount: nextState.reviewCount,
      lapseCount: nextState.lapseCount,
    },
    history,
    isUnlocked: existing?.isUnlocked ?? true,
    isMastered: newMasteryScore >= 0.8,
  };

  try {
    await progressRef.set(update, { merge: true });
  } catch {
    // API callers can still receive the calculated result in local development.
  }

  return { nextDue: nextState.nextDue.toISOString(), newMasteryScore, srsState: update.srsState };
}

export async function applyStreakUpdate(uid: string, update: Record<string, unknown>) {
  await adminDb.collection("users").doc(uid).set({ ...update, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}
