import type { Metadata } from "next";
import LearnClient from "@/components/exercise/LearnClient";

export const metadata: Metadata = {
  title: "Practice | LinguaForge",
  description: "Complete a focused language exercise and strengthen what you know.",
  openGraph: { title: "Practice | LinguaForge", description: "A focused LinguaForge language practice session.", type: "website" },
};

export default function LearnPage({ params }: { params: { lang: string; skillId: string } }) { return <LearnClient lang={params.lang} skillId={params.skillId} />; }
