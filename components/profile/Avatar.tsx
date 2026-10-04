"use client";

import type { User } from "firebase/auth";

function avatarColor(uid: string) {
  const colors = ["#6c63ff", "#0d9488", "#b45309", "#be123c", "#2563eb"];
  const hash = uid.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function Avatar({ user, size = "lg" }: { user: User; size?: "sm" | "lg" }) {
  const initials = (user.displayName || user.email || "L").trim().charAt(0).toUpperCase();
  return user.photoURL ? <img src={user.photoURL} alt={`${user.displayName || "Learner"} avatar`} className={`${size === "lg" ? "h-20 w-20" : "h-10 w-10"} rounded-full border border-white/10 object-cover`} /> : <span style={{ backgroundColor: avatarColor(user.uid) }} className={`${size === "lg" ? "h-20 w-20 text-3xl" : "h-10 w-10 text-base"} grid place-items-center rounded-full font-display text-white`}>{initials}</span>;
}
