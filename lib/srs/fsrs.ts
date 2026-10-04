import { createEmptyCard, fsrs, Rating, type Card, type Grade } from "ts-fsrs";

export type FsrsRating = "again" | "hard" | "good" | "easy";

const scheduler = fsrs({ enable_fuzz: false });

function toGrade(rating: FsrsRating): Grade {
  return {
    again: Rating.Again,
    hard: Rating.Hard,
    good: Rating.Good,
    easy: Rating.Easy,
  }[rating] as Grade;
}

export function createNewCard(now = new Date()): Card {
  return createEmptyCard(now);
}

export function updateCard(card: Card, rating: FsrsRating, now = new Date()): Card {
  return scheduler.next(card, now, toGrade(rating)).card;
}

export function cardToState(card: Card) {
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    lastReview: card.last_review ?? new Date(0),
    nextDue: card.due,
    reviewCount: card.reps,
    lapseCount: card.lapses,
  };
}

export function stateToCard(state?: {
  stability?: number;
  difficulty?: number;
  lastReview?: Date;
  nextDue?: Date;
  reviewCount?: number;
  lapseCount?: number;
}): Card {
  if (!state || !state.reviewCount) return createNewCard();
  return {
    due: state.nextDue ?? new Date(),
    stability: state.stability ?? 0,
    difficulty: state.difficulty ?? 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: state.reviewCount ?? 0,
    lapses: state.lapseCount ?? 0,
    state: state.reviewCount > 0 ? 2 : 0,
    last_review: state.lastReview,
  };
}
