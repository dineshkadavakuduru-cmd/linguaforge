import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { buildPrompt } from "@/lib/generation/buildPrompt";
import { getFallbackExercise } from "@/lib/generation/fallbackExercises";
import { validateExercise, type GeneratedExercise } from "@/lib/generation/validateExercise";
import { languageCatalog } from "@/lib/generation/seedData";
import { getLanguageConfig, getSkill as getSkillFromCache } from "@/lib/generation/configCache";
import type { ExerciseDoc, GenerateExerciseRequest } from "@/types";

const DEFAULT_DIFFICULTY_BAND = 1;

async function getLanguageData(lang: string) {
  const config = await getLanguageConfig(lang);
  if (config) {
    return { config, skills: [] }; // Skills fetched separately
  }
  // Fallback to in-memory catalog
  return languageCatalog[lang];
}

async function getSkill(lang: string, skillId: string) {
  // Try cache first
  const skill = await getSkillFromCache(lang, skillId);
  if (skill) return skill;
  // Fallback to in-memory catalog
  const languageData = languageCatalog[lang];
  return languageData?.skills.find((s) => s.skillId === skillId);
}

function createExerciseId(lang: string, skillId: string, generated: GeneratedExercise) {
  return createHash("sha256")
    .update(JSON.stringify({ lang, skillId, type: generated.exerciseType, prompt: generated.content.prompt }))
    .digest("hex")
    .slice(0, 24);
}

async function getDominantErrors(uid: string, lang: string) {
  try {
    const mistake = await adminDb.collection("mistakes").doc(`${uid}_${lang}`).get();
    return (mistake.data()?.dominantErrors as string[] | undefined) ?? [];
  } catch {
    return [];
  }
}

async function readCachedExercise(lang: string, skillId: string, difficultyBand: number, threshold: number) {
  try {
    const snapshot = await adminDb
      .collection("exercises")
      .where("lang", "==", lang)
      .where("skillId", "==", skillId)
      .where("difficultyBand", "==", difficultyBand)
      .where("metadata.useCount", "<", threshold)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const cached = snapshot.docs[0];
    await cached.ref.update({ "metadata.useCount": FieldValue.increment(1) });
    return { ...(cached.data() as ExerciseDoc), metadata: { ...(cached.data().metadata as ExerciseDoc["metadata"]), useCount: ((cached.data().metadata as ExerciseDoc["metadata"]).useCount ?? 0) + 1 } };
  } catch {
    return null;
  }
}

async function requestFromOpenRouter(prompt: string): Promise<unknown> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "LinguaForge",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "google/gemini-flash-1.5",
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`);
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned an empty response");
  const normalized = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(normalized);
}

async function verifyExerciseAnswer(languageName: string, prompt: string, correctAnswer: string | string[], exerciseType: string): Promise<{ valid: boolean; reason: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { valid: true, reason: "Verification skipped (no API key)" };

  const answers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
  const answerStr = answers.join(" / ");

  const verificationPrompt = `Verify this ${languageName} exercise. Question: ${prompt}. Given answer: ${answerStr}. Exercise type: ${exerciseType}. Is the answer correct and appropriate for the question? Reply with only JSON: {"valid": true/false, "reason": "..."}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "LinguaForge",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "google/gemini-flash-1.5",
        temperature: 0.1,
        messages: [{ role: "user", content: verificationPrompt }],
      }),
    });

    if (!response.ok) return { valid: true, reason: `Verification request failed: ${response.status}` };

    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return { valid: true, reason: "Empty verification response" };

    const normalized = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const result = JSON.parse(normalized);
    return { valid: Boolean(result.valid), reason: String(result.reason ?? "") };
  } catch {
    return { valid: true, reason: "Verification error, defaulting to valid" };
  }
}

async function persistExercise(exercise: ExerciseDoc) {
  try {
    await adminDb.collection("exercises").doc(exercise.exerciseId).set(exercise);
  } catch {
    // Local development can use fallbacks without Firebase Admin credentials.
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<GenerateExerciseRequest>;
    if (!body.uid || !body.lang || !body.skillId) {
      return NextResponse.json({ error: "uid, lang, and skillId are required." }, { status: 400 });
    }

    const language = await getLanguageData(body.lang);
    const skill = await getSkill(body.lang, body.skillId);
    if (!language || !skill) {
      return NextResponse.json({ error: "This language or skill is not seeded yet." }, { status: 404 });
    }

    const difficultyBand = DEFAULT_DIFFICULTY_BAND;
    const threshold = Number(process.env.EXERCISE_STALENESS_THRESHOLD || 500);
    const cached = await readCachedExercise(body.lang, body.skillId, difficultyBand, threshold);
    if (cached) return NextResponse.json({ exercise: cached, fromCache: true });

    const dominantErrors = await getDominantErrors(body.uid, body.lang);
    const basePrompt = buildPrompt(skill, language.config, dominantErrors);
    let generated: GeneratedExercise | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const prompt = attempt === 0
          ? basePrompt
          : `${basePrompt}\nYour previous output failed validation. Return only corrected JSON matching the requested schema, with exactly four options for multiple-choice.`;
        const candidate = validateExercise(await requestFromOpenRouter(prompt));

        // Second-pass LLM validation of the answer key
        const verification = await verifyExerciseAnswer(
          language.config.name,
          candidate.content.prompt,
          candidate.content.correctAnswer,
          candidate.exerciseType
        );

        if (!verification.valid) {
          throw new Error(`Answer verification failed: ${verification.reason}`);
        }

        generated = candidate;
        break;
      } catch {
        generated = null;
      }
    }

    if (!generated) {
      const fallback = getFallbackExercise(body.skillId, body.lang, Math.floor(Math.random() * 3));
      await persistExercise(fallback);
      return NextResponse.json({ exercise: fallback, fromCache: false });
    }

    const exercise: ExerciseDoc = {
      exerciseId: createExerciseId(body.lang, body.skillId, generated),
      lang: body.lang,
      skillId: body.skillId,
      exerciseType: generated.exerciseType,
      difficultyBand: generated.difficultyBand as ExerciseDoc["difficultyBand"],
      content: generated.content,
      metadata: {
        generatedAt: Timestamp.now(),
        modelUsed: process.env.OPENROUTER_MODEL || "google/gemini-flash-1.5",
        validationPassed: true,
        useCount: 0,
        flaggedCount: 0,
      },
    };
    await persistExercise(exercise);
    return NextResponse.json({ exercise, fromCache: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate exercise." }, { status: 500 });
  }
}
