import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Review your language progress and continue your next focused practice session.",
  openGraph: { title: "Dashboard", description: "Your focused language practice dashboard.", type: "website" },
  robots: { index: false, follow: false },
};

export default function DashboardPage() { return <DashboardClient />; }
