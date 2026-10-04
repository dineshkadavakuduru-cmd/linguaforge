import { z } from "zod";
import type { ExerciseContent, ExerciseDoc, ExerciseType } from "@/types";

const exerciseTypes: [ExerciseType, ...ExerciseType[]] = [
  "translation",
  "fill-blank",
  "multiple-choice",
  "listening-transcribe",
  "error-correction",
  "free-write",
  "story-completion",
];

const exerciseContentSchema = z.object({
  prompt: z.string().min(1),
  promptNative: z.string().min(1).optional(),
  options: z.array(z.string().min(1)).min(2).optional(),
  correctAnswer: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  explanation: z.string().min(1),
  hints: z.array(z.string().min(1)).optional(),
});

export const generatedExerciseSchema = z.object({
  exerciseType: z.enum(exerciseTypes),
  difficultyBand: z.number().int().min(1).max(5),
  content: exerciseContentSchema,
});

export type GeneratedExercise = z.infer<typeof generatedExerciseSchema>;

export function validateExercise(input: unknown): GeneratedExercise {
  const parsed = generatedExerciseSchema.parse(input);
  if (parsed.exerciseType === "multiple-choice" && (!parsed.content.options || parsed.content.options.length < 4)) {
    throw new Error("Multiple-choice exercises require at least four options.");
  }
  return parsed;
}

export function isExerciseContent(input: unknown): input is ExerciseContent {
  return exerciseContentSchema.safeParse(input).success;
}

export function isExerciseDoc(input: unknown): input is ExerciseDoc {
  return z.object({
    exerciseId: z.string(),
    lang: z.string(),
    skillId: z.string(),
    exerciseType: z.enum(exerciseTypes),
    difficultyBand: z.number().int().min(1).max(5),
    content: exerciseContentSchema,
    metadata: z.object({
      generatedAt: z.unknown(),
      modelUsed: z.string(),
      validationPassed: z.boolean(),
      useCount: z.number(),
      flaggedCount: z.number(),
    }),
  }).safeParse(input).success;
}
