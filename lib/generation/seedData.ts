import type { LanguageConfig, SkillNode } from "@/types";

export const spanishConfig: LanguageConfig = {
  code: "es",
  name: "Spanish",
  nativeName: "Español",
  script: "latin",
  rtl: false,
  hasRomanization: false,
  cefrLevels: ["A1", "A2", "B1", "B2", "C1"],
  skillGraphRoot: "greetings-vocab",
};

export const spanishSkills: SkillNode[] = [
  { skillId: "present-tense-regular-verbs", cefrLevel: "A1", category: "grammar", prerequisites: [], unlocks: ["ser-vs-estar"], exerciseTypes: ["translation", "fill-blank", "multiple-choice"], masteryThreshold: 0.8, description: "Conjugate common regular verbs in the present tense." },
  { skillId: "ser-vs-estar", cefrLevel: "A1", category: "grammar", prerequisites: ["present-tense-regular-verbs"], unlocks: ["definite-articles"], exerciseTypes: ["translation", "fill-blank", "multiple-choice"], masteryThreshold: 0.8, description: "Choose between ser and estar in beginner sentences." },
  { skillId: "definite-articles", cefrLevel: "A1", category: "grammar", prerequisites: [], unlocks: ["present-tense-regular-verbs"], exerciseTypes: ["translation", "fill-blank", "multiple-choice"], masteryThreshold: 0.8, description: "Use el, la, los, and las with familiar nouns." },
  { skillId: "greetings-vocab", cefrLevel: "A1", category: "vocabulary", prerequisites: [], unlocks: ["numbers-1-20"], exerciseTypes: ["translation", "multiple-choice", "fill-blank"], masteryThreshold: 0.8, description: "Recognize and use everyday Spanish greetings." },
  { skillId: "numbers-1-20", cefrLevel: "A1", category: "vocabulary", prerequisites: ["greetings-vocab"], unlocks: [], exerciseTypes: ["translation", "multiple-choice", "fill-blank"], masteryThreshold: 0.8, description: "Read, recognize, and produce numbers from one to twenty." },
];

export const japaneseConfig: LanguageConfig = {
  code: "ja",
  name: "Japanese",
  nativeName: "日本語",
  script: "cjk",
  rtl: false,
  hasRomanization: true,
  cefrLevels: ["A1", "A2", "B1", "B2", "C1"],
  skillGraphRoot: "hiragana-basics",
};

export const japaneseSkills: SkillNode[] = [
  { skillId: "hiragana-basics", cefrLevel: "A1", category: "reading", prerequisites: [], unlocks: ["katakana-basics"], exerciseTypes: ["translation", "multiple-choice", "fill-blank"], masteryThreshold: 0.8, description: "Recognize and read foundational hiragana characters and words." },
  { skillId: "katakana-basics", cefrLevel: "A1", category: "reading", prerequisites: ["hiragana-basics"], unlocks: ["greetings-ja"], exerciseTypes: ["translation", "multiple-choice", "fill-blank"], masteryThreshold: 0.8, description: "Recognize common katakana characters and loanwords." },
  { skillId: "greetings-ja", cefrLevel: "A1", category: "vocabulary", prerequisites: ["hiragana-basics"], unlocks: ["numbers-ja"], exerciseTypes: ["translation", "multiple-choice", "fill-blank"], masteryThreshold: 0.8, description: "Use everyday Japanese greetings and polite expressions." },
  { skillId: "numbers-ja", cefrLevel: "A1", category: "vocabulary", prerequisites: ["greetings-ja"], unlocks: ["particles-wa-ga"], exerciseTypes: ["translation", "multiple-choice", "fill-blank"], masteryThreshold: 0.8, description: "Read and use basic Japanese numbers from one to twenty." },
  { skillId: "particles-wa-ga", cefrLevel: "A1", category: "grammar", prerequisites: ["greetings-ja"], unlocks: [], exerciseTypes: ["translation", "fill-blank", "multiple-choice"], masteryThreshold: 0.8, description: "Distinguish the beginner uses of the particles は and が." },
];

export const languageCatalog: Record<string, { config: LanguageConfig; skills: SkillNode[] }> = {
  es: { config: spanishConfig, skills: spanishSkills },
  ja: { config: japaneseConfig, skills: japaneseSkills },
};
