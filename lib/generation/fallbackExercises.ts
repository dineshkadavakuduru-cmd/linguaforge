import type { ExerciseDoc, ExerciseType } from "@/types";

type FallbackDefinition = {
  type: ExerciseType;
  prompt: string;
  promptNative?: string;
  options: string[];
  answer: string;
  explanation: string;
};

const fallbackDefinitions: Record<string, FallbackDefinition[]> = {
  "present-tense-regular-verbs": [
    { type: "multiple-choice", prompt: "Choose the Spanish translation for 'I speak'.", options: ["Yo hablo", "Yo habla", "Tú hablas", "Ellos hablan"], answer: "Yo hablo", explanation: "Regular -ar verbs use -o for the yo form: hablar becomes yo hablo." },
    { type: "fill-blank", prompt: "Complete: Nosotros ___ español.", options: [], answer: "hablamos", explanation: "The nosotros form of hablar is hablamos." },
    { type: "translation", prompt: "Translate: 'She studies every day.'", options: [], answer: "Ella estudia todos los días", explanation: "Estudiar becomes estudia for ella." },
  ],
  "ser-vs-estar": [
    { type: "multiple-choice", prompt: "Choose the correct sentence for a permanent identity.", options: ["Soy estudiante", "Estoy estudiante", "Soy cansado", "Estoy de México"], answer: "Soy estudiante", explanation: "Use ser for identity and lasting characteristics." },
    { type: "fill-blank", prompt: "Complete: Yo ___ en casa ahora.", options: [], answer: "estoy", explanation: "Use estar for a current location or temporary state." },
    { type: "translation", prompt: "Translate: 'We are happy today.'", options: [], answer: "Estamos felices hoy", explanation: "A temporary feeling uses estar: estamos." },
  ],
  "definite-articles": [
    { type: "multiple-choice", prompt: "Which article completes: ___ libro?", options: ["El", "La", "Los", "Las"], answer: "El", explanation: "Libro is masculine singular, so it takes el." },
    { type: "fill-blank", prompt: "Complete: ___ casas son grandes.", options: [], answer: "Las", explanation: "Casas is feminine plural, so it takes las." },
    { type: "translation", prompt: "Translate: 'The boys are here.'", options: [], answer: "Los chicos están aquí", explanation: "Chicos is masculine plural, so use los." },
  ],
  "greetings-vocab": [
    { type: "multiple-choice", prompt: "What does 'Buenos días' mean?", options: ["Good morning", "Good night", "See you soon", "Thank you"], answer: "Good morning", explanation: "Buenos días is the standard morning greeting." },
    { type: "fill-blank", prompt: "Complete the greeting: Hasta ___.", options: [], answer: "luego", explanation: "Hasta luego means see you later." },
    { type: "translation", prompt: "Translate: 'Nice to meet you.'", options: [], answer: "Mucho gusto", explanation: "Mucho gusto is a common way to say nice to meet you." },
  ],
  "numbers-1-20": [
    { type: "multiple-choice", prompt: "Which Spanish number is 14?", options: ["Catorce", "Cuatro", "Cincuenta", "Doce"], answer: "Catorce", explanation: "Catorce means fourteen." },
    { type: "fill-blank", prompt: "Complete: Diez + uno = ___.", options: [], answer: "once", explanation: "Once is eleven." },
    { type: "translation", prompt: "Translate: 'I have twenty books.'", options: [], answer: "Tengo veinte libros", explanation: "Veinte means twenty, and tengo means I have." },
  ],
  "hiragana-basics": [
    { type: "multiple-choice", prompt: "Which sound does this character represent? あ", promptNative: "a", options: ["a", "i", "u", "o"], answer: "a", explanation: "あ is the hiragana character for the sound a." },
    { type: "fill-blank", prompt: "Complete the romaji for か.", promptNative: "ka", options: [], answer: "ka", explanation: "か represents the sound ka." },
    { type: "translation", prompt: "Read this hiragana word: ねこ", promptNative: "neko", options: [], answer: "cat", explanation: "ねこ (neko) means cat." },
  ],
  "katakana-basics": [
    { type: "multiple-choice", prompt: "Which sound does this character represent? ア", promptNative: "a", options: ["a", "i", "u", "e"], answer: "a", explanation: "ア is the katakana character for the sound a." },
    { type: "fill-blank", prompt: "Complete the romaji for カ.", promptNative: "ka", options: [], answer: "ka", explanation: "カ represents the sound ka." },
    { type: "translation", prompt: "Read this katakana word: テレビ", promptNative: "terebi", options: [], answer: "television", explanation: "テレビ (terebi) means television." },
  ],
  "greetings-ja": [
    { type: "multiple-choice", prompt: "What does this greeting mean? おはようございます", promptNative: "ohayou gozaimasu", options: ["Good morning", "Good night", "Thank you", "Goodbye"], answer: "Good morning", explanation: "おはようございます is a polite good morning greeting." },
    { type: "fill-blank", prompt: "Complete the greeting: こんにちは means ___.", promptNative: "konnichiwa", options: [], answer: "hello", explanation: "こんにちは is a common daytime hello." },
    { type: "translation", prompt: "Translate: ありがとう", promptNative: "arigatou", options: [], answer: "thank you", explanation: "ありがとう means thank you." },
  ],
  "numbers-ja": [
    { type: "multiple-choice", prompt: "Which number is this? 十", promptNative: "juu", options: ["Ten", "One", "Five", "Twenty"], answer: "Ten", explanation: "十 is read juu and means ten." },
    { type: "fill-blank", prompt: "Complete the romaji: 三 = ___.", promptNative: "san", options: [], answer: "san", explanation: "三 is read san and means three." },
    { type: "translation", prompt: "Read this number: 二十", promptNative: "nijuu", options: [], answer: "twenty", explanation: "二十 is read nijuu and means twenty." },
  ],
  "particles-wa-ga": [
    { type: "multiple-choice", prompt: "Choose the topic particle: 私___学生です。", promptNative: "Watashi wa gakusei desu.", options: ["は", "が", "を", "に"], answer: "は", explanation: "は marks the topic: as for me, I am a student." },
    { type: "fill-blank", prompt: "Complete: 猫___います。", promptNative: "Neko ga imasu.", options: [], answer: "が", explanation: "が can identify the subject that exists: the cat is here." },
    { type: "translation", prompt: "Translate: 私は学生です。", promptNative: "Watashi wa gakusei desu.", options: [], answer: "I am a student", explanation: "私は学生です means I am a student." },
  ],
};

export function getFallbackExercise(skillId: string, lang = "es", index = 0): ExerciseDoc {
  const definitions = fallbackDefinitions[skillId];
  if (!definitions) throw new Error(`No fallback exercises are defined for ${lang}/${skillId}.`);
  const definition = definitions[index % definitions.length];
  const exerciseId = `fallback-${lang}-${skillId}-${index % definitions.length}`;

  return {
    exerciseId,
    lang,
    skillId,
    exerciseType: definition.type,
    difficultyBand: 1,
    content: {
      prompt: definition.prompt,
      promptNative: definition.promptNative,
      options: definition.options.length > 0 ? definition.options : undefined,
      correctAnswer: definition.answer,
      explanation: definition.explanation,
    },
    metadata: {
      generatedAt: { toDate: () => new Date() } as never,
      modelUsed: "linguaforge-fallback",
      validationPassed: true,
      useCount: 0,
      flaggedCount: 0,
    },
  };
}

export const fallbackSkillIds = Object.keys(fallbackDefinitions);
