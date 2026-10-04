import type { Metadata } from "next";
import AuthClient from "./AuthClient";

export const metadata: Metadata = {
  title: "Sign in | LinguaForge",
  description: "Sign in to continue your focused language practice.",
  openGraph: { title: "Sign in | LinguaForge", description: "Continue your focused language practice.", type: "website" },
};

export default function AuthPage() { return <AuthClient />; }
