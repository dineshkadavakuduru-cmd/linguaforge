// ---- Firestore document types ----

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  activeLanguages: string[];
  currentLanguage: string;
  xp: number;
  streakCount: number;
  streakFreezeCount: number;
  lastCheckInDate: string;
  timezone: string;
  createdAt: FirebaseFirestore.Timestamp;
  settings: {
    dailyGoalMinutes: number;
    notificationsEnabled: boolean;
    uiTheme: "dark" | "light" | "system";
  };
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  script: "latin" | "cjk" | "arabic" | "devanagari" | "cyrillic" | "other";
  rtl: boolean;
  hasRomanization: boolean;
  cefrLevels: Array<"A1" | "A2" | "B1" | "B2" | "C1" | "C2">;
  skillGraphRoot: string;
}

export type ExerciseType =
  | "translation"
  | "fill-blank"
  | "multiple-choice"
  | "listening-transcribe"
  | "error-correction"
  | "free-write"
  | "story-completion";

export interface SkillNode {
  skillId: string;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  category: "grammar" | "vocabulary" | "pronunciation" | "reading" | "listening" | "writing";
  prerequisites: string[];
  unlocks: string[];
  exerciseTypes: ExerciseType[];
  masteryThreshold: number;
  description: string;
}

export interface FSRSState {
  stability: number;
  difficulty: number;
  lastReview: FirebaseFirestore.Timestamp;
  nextDue: FirebaseFirestore.Timestamp;
  reviewCount: number;
  lapseCount: number;
}

export interface UserProgress {
  uid: string;
  lang: string;
  skillId: string;
  masteryScore: number;
  srsState: FSRSState;
  history: Array<{
    timestamp: FirebaseFirestore.Timestamp;
    exerciseId: string;
    correct: boolean;
    responseTime: number;
  }>;
  isUnlocked: boolean;
  isMastered: boolean;
}

export interface ExerciseContent {
  prompt: string;
  promptNative?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hints?: string[];
}

export interface ExerciseDoc {
  exerciseId: string;
  lang: string;
  skillId: string;
  exerciseType: ExerciseType;
  difficultyBand: 1 | 2 | 3 | 4 | 5;
  content: ExerciseContent;
  metadata: {
    generatedAt: FirebaseFirestore.Timestamp;
    modelUsed: string;
    validationPassed: boolean;
    useCount: number;
    flaggedCount: number;
  };
}

export interface MistakesDoc {
  uid: string;
  lang: string;
  errorLog: Array<{
    skillId: string;
    exerciseType: ExerciseType;
    errorPattern: string;
    timestamp: FirebaseFirestore.Timestamp;
  }>;
  dominantErrors: string[];
}

export interface GenerateExerciseRequest {
  uid: string;
  lang: string;
  skillId: string;
}

export interface GenerateExerciseResponse {
  exercise: ExerciseDoc;
  fromCache: boolean;
}

export interface SubmitAnswerRequest {
  uid: string;
  lang: string;
  skillId: string;
  exerciseId: string;
  answer: string;
  responseTimeMs: number;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  explanation: string;
  nextDue: string;
  xpEarned: number;
  newMasteryScore: number;
}

export interface CheckInResponse {
  streakCount: number;
  xp: number;
  alreadyCheckedIn: boolean;
  usedStreakFreeze: boolean;
}
