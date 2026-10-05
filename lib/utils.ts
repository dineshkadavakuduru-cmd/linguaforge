import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared practice-session constants.
export const SESSION_LENGTH = 10;
export const MAX_ANSWER_LENGTH = 2000;

// Lifecycle of saving an answer to the server.
export type SaveState = "saving" | "saved" | "failed";
