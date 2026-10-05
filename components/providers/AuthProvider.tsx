"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  OAuthProvider,
  type User as FirebaseUser,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase/client";

// Give Firebase a bounded window to resolve the session so the UI can never
// get stuck on a loading state when auth initialization hangs.
const AUTH_INIT_TIMEOUT_MS = 12_000;

interface AuthContextValue {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signUp: (email: string, password: string, displayName: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signInWithApple: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

// Never let profile syncing block a successful sign-in: if Firestore is
// unreachable the user can still proceed and we retry on a later visit.
async function ensureUserDocument(user: FirebaseUser, displayName?: string) {
  try {
    const userRef = doc(db, "users", user.uid);
    const existing = await getDoc(userRef);
    if (existing.exists()) return;

    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? "",
      displayName: displayName || user.displayName || user.email?.split("@")[0] || "Learner",
      avatarUrl: user.photoURL ?? "",
      activeLanguages: ["es"],
      currentLanguage: "es",
      xp: 0,
      streakCount: 0,
      streakFreezeCount: 0,
      lastCheckInDate: "",
      timezone: getTimezone(),
      createdAt: serverTimestamp(),
      settings: {
        dailyGoalMinutes: 10,
        notificationsEnabled: true,
        uiTheme: "dark",
      },
    });
  } catch (profileError) {
    console.warn("Could not sync the user profile document.", profileError);
  }
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Prefer explicit local persistence so sessions survive refreshes even when
  // Firebase defaults change or IndexedDB is unavailable.
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {
      // Firebase falls back to in-memory persistence; sign-in still works.
    });
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: () => void = () => {};

    setLoading(true);
    setError(null);

    timeoutId = setTimeout(() => {
      setLoading(false);
      setError(
        "Authentication is taking longer than expected. Check your connection and try again."
      );
    }, AUTH_INIT_TIMEOUT_MS);

    unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (timeoutId) clearTimeout(timeoutId);
        setUser(nextUser);
        setLoading(false);
        setError(null);
      },
      (authError) => {
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
        setError(authError instanceof Error ? authError.message : "Authentication failed to initialize.");
      }
    );

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    retry,
    signIn: async (email, password) => {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDocument(credential.user);
      return credential.user;
    },
    signUp: async (email, password, displayName) => {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserDocument(credential.user, displayName);
      return credential.user;
    },
    signInWithGoogle: async () => {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureUserDocument(credential.user);
      return credential.user;
    },
    signInWithApple: async () => {
      const credential = await signInWithPopup(auth, new OAuthProvider("apple.com"));
      await ensureUserDocument(credential.user);
      return credential.user;
    },
    signOut: () => firebaseSignOut(auth),
  }), [user, loading, error, retry]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

/**
 * Guards pages that require a signed-in user. Once auth state resolves and the
 * user is missing it redirects to /auth. While `loading` or `shouldRedirect`
 * are true callers must render a skeleton — never the protected page body.
 */
export function useRequireAuth() {
  const router = useRouter();
  const { user, loading, error, retry } = useAuth();
  const shouldRedirect = !loading && !user;

  useEffect(() => {
    if (shouldRedirect) router.replace("/auth");
  }, [router, shouldRedirect]);

  return { user, loading, error, retry, shouldRedirect };
}
