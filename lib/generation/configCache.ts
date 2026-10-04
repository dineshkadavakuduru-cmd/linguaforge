import { adminDb } from "@/lib/firebase/admin";
import type { LanguageConfig, SkillNode } from "@/types";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const languageConfigCache = new Map<string, CacheEntry<LanguageConfig>>();
const skillGraphCache = new Map<string, CacheEntry<SkillNode[]>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function fetchLanguageConfigFromFirestore(lang: string): Promise<LanguageConfig | null> {
  try {
    const doc = await adminDb.collection("languageConfigs").doc(lang).get();
    if (doc.exists) {
      return doc.data() as LanguageConfig;
    }
  } catch {
    // Fall through to fallback
  }
  return null;
}

async function fetchSkillGraphFromFirestore(skillId: string): Promise<SkillNode[] | null> {
  try {
    const doc = await adminDb.collection("skillGraph").doc(skillId).get();
    if (doc.exists) {
      return doc.data() as SkillNode[];
    }
  } catch {
    // Fall through to fallback
  }
  return null;
}

export async function getLanguageConfig(lang: string): Promise<LanguageConfig | null> {
  const cached = languageConfigCache.get(lang);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const config = await fetchLanguageConfigFromFirestore(lang);
  if (config) {
    languageConfigCache.set(lang, { data: config, expiresAt: Date.now() + CACHE_TTL_MS });
  }
  return config;
}

export async function getSkillGraph(lang: string): Promise<SkillNode[] | null> {
  // Use lang as the document key for skill graph, or use a composite key
  const cacheKey = `${lang}-skills`;
  const cached = skillGraphCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const skills = await fetchSkillGraphFromFirestore(cacheKey);
  if (skills) {
    skillGraphCache.set(cacheKey, { data: skills, expiresAt: Date.now() + CACHE_TTL_MS });
  }
  return skills;
}

export async function getSkill(lang: string, skillId: string): Promise<SkillNode | null> {
  const skills = await getSkillGraph(lang);
  if (!skills) return null;
  return skills.find((skill) => skill.skillId === skillId) ?? null;
}

export function clearConfigCache() {
  languageConfigCache.clear();
  skillGraphCache.clear();
}