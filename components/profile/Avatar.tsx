"use client";

import Image from "next/image";
import type { User } from "firebase/auth";

function avatarColor(uid: string) {
  const colors = ["#6c63ff", "#0d9488", "#b45309", "#be123c", "#2563eb"];
  const hash = uid.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function Avatar({ user, size = "lg" }: { user: User; size?: "sm" | "lg" }) {
  const initials = (user.displayName || user.email || "L").trim().charAt(0).toUpperCase();
  const dimension = size === "lg" ? 80 : 40;
  const sizeClass = size === "lg" ? "h-20 w-20 text-3xl" : "h-10 w-10 text-base";

  if (user.photoURL) {
    return (
      <Image
        src={user.photoURL}
        alt={`${user.displayName || "Learner"} avatar`}
        width={dimension}
        height={dimension}
        unoptimized
        className={`${sizeClass} rounded-full border border-white/10 object-cover`}
      />
    );
  }

  return (
    <span
      style={{ backgroundColor: avatarColor(user.uid) }}
      aria-hidden="true"
      className={`${sizeClass} grid place-items-center rounded-full font-display text-white`}
    >
      {initials}
    </span>
  );
}
