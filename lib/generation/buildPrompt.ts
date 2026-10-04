import type { LanguageConfig, SkillNode } from "@/types";

export function buildPrompt(skill: SkillNode, language: LanguageConfig, dominantErrors: string[]) {
  const errors = dominantErrors.length > 0 ? dominantErrors.join(", ") : "none recorded";
  const exerciseTypes = skill.exerciseTypes.join(", ");
  const scriptInstruction = language.hasRomanization
    ? `Because this language uses romanization support, content.prompt must contain the native ${language.name} script and content.promptNative must contain the matching romaji/romanization. Return both fields.`
    : "Do not add promptNative unless the language config requires it.";

  return [
    "You are LinguaForge's language exercise generator.",
    "Return exactly one valid JSON object and no markdown fences.",
    `Create an A1 ${language.name} exercise for the skill "${skill.skillId}" (${skill.description}).`,
    `Allowed exercise types: ${exerciseTypes}. Choose the type that best teaches this skill.`,
    "The JSON must include: exerciseType, difficultyBand (1 through 5), and content.",
    "content must include prompt, correctAnswer (a string or string array), explanation, and options when using multiple-choice.",
    scriptInstruction,
    `The learner's known error patterns are: ${errors}. Avoid reinforcing them without a clear explanation.`,
    "Keep the prompt concise, culturally neutral, and appropriate for an adult beginner.",
  ].join("\n");
}
