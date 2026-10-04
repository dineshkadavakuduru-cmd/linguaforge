import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | LinguaForge",
  description: "Review your language progress and continue your next focused practice session.",
  openGraph: { title: "Dashboard | LinguaForge", description: "Your focused language practice dashboard.", type: "website" },
};

export default function DashboardPage() { return <DashboardClient />; }
