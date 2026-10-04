import { NextResponse } from "next/server";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { getFallbackExercise } from "@/lib/generation/fallbackExercises";
import { updateAfterAnswer } from "@/lib/srs/scheduler";
import type { ExerciseDoc, SubmitAnswerRequest } from "@/types";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<SubmitAnswerRequest>;
    if (!body.uid || !body.lang || !body.skillId || !body.exerciseId || typeof body.answer !== "string") {
      return NextResponse.json({ error: "uid, lang, skillId, exerciseId, and answer are required." }, { status: 400 });
    }
    const submittedAnswer = body.answer;

    let exercise: ExerciseDoc | null = null;
    try {
      const snapshot = await adminDb.collection("exercises").doc(body.exerciseId).get();
      exercise = snapshot.exists ? snapshot.data() as ExerciseDoc : null;
    } catch {
      exercise = null;
    }
    if (!exercise && body.exerciseId.startsWith("fallback-")) {
      const fallbackParts = body.exerciseId.split("-");
      const fallbackLang = fallbackParts[1] || body.lang;
      const fallbackSkillId = fallbackParts.slice(2, -1).join("-");
      const fallbackIndex = Number(fallbackParts.at(-1) || 0);
      exercise = getFallbackExercise(fallbackSkillId, fallbackLang, Number.isFinite(fallbackIndex) ? fallbackIndex : 0);
    }
    if (!exercise) return NextResponse.json({ error: "Exercise not found." }, { status: 404 });

    const answers = Array.isArray(exercise.content.correctAnswer) ? exercise.content.correctAnswer : [exercise.content.correctAnswer];
    const correct = answers.some((answer) => normalize(answer) === normalize(submittedAnswer));
    const schedule = await updateAfterAnswer(body.uid, body.lang, body.skillId, correct, body.responseTimeMs ?? 0, body.exerciseId);

    if (correct) {
      try {
        await adminDb.collection("users").doc(body.uid).update({ xp: FieldValue.increment(5) });
      } catch {
        // XP increment failed silently to not break the response
      }
    }

    if (!correct && exercise) {
      const mistakeRef = adminDb.collection("mistakes").doc(`${body.uid}_${body.lang}`);
      const errorEntry = {
        skillId: body.skillId,
        exerciseType: exercise.exerciseType,
        errorPattern: `wrong_answer:${body.answer}`,
        timestamp: Timestamp.now(),
      };
      await mistakeRef.set({
        uid: body.uid,
        lang: body.lang,
        errorLog: FieldValue.arrayUnion(errorEntry),
        dominantErrors: FieldValue.arrayUnion(body.skillId),
      }, { merge: true });
    }

    return NextResponse.json({ correct, explanation: exercise.content.explanation, nextDue: schedule.nextDue, xpEarned: correct ? 5 : 0, newMasteryScore: schedule.newMasteryScore });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit answer." }, { status: 500 });
  }
}
