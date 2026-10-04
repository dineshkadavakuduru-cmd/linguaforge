"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase/client";

interface AuthContextValue {
  user: FirebaseUser | null;
  loading: boolean;
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

async function ensureUserDocument(user: FirebaseUser, displayName?: string) {
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
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setLoading(false);
  }), []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
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
    signOut: () => auth.signOut(),
  }), [loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
