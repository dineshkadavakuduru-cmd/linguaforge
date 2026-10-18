import type { Metadata } from "next";
import AuthClient from "./AuthClient";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to continue your focused language practice.",
  alternates: { canonical: "/auth" },
  openGraph: { title: "Sign in", description: "Continue your focused language practice.", type: "website", url: "/auth" },
};

export default function AuthPage() { return <AuthClient />; }
