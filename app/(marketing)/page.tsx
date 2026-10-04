import type { Metadata } from "next";
import LandingClient from "@/components/marketing/LandingClient";

export const metadata: Metadata = {
  title: "LinguaForge | Learn languages. Actually remember them.",
  description: "A calmer language learning workspace built around deliberate practice and memory-aware review.",
  openGraph: {
    title: "LinguaForge | Learn languages. Actually remember them.",
    description: "Deliberate exercises and intelligent review for language learners.",
    type: "website",
  },
};

export default function MarketingPage() { return <LandingClient />; }
