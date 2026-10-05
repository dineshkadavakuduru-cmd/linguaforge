import type { Metadata } from "next";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your LinguaForge profile, practice settings, and active languages.",
  openGraph: { title: "Profile", description: "Manage your language practice profile.", type: "website" },
  robots: { index: false, follow: false },
};

export default function ProfilePage() { return <ProfileClient />; }
