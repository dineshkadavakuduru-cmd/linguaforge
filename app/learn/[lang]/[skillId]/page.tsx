import type { Metadata } from "next";
import LearnClient from "@/components/exercise/LearnClient";

export const metadata: Metadata = {
  title: "Practice",
  description: "Complete a focused language exercise and strengthen what you know.",
  openGraph: { title: "Practice", description: "A focused LinguaForge language practice session.", type: "website" },
  robots: { index: false, follow: false },
};

export default function LearnPage({ params }: { params: { lang: string; skillId: string } }) { return <LearnClient lang={params.lang} skillId={params.skillId} />; }
