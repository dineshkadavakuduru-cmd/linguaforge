import type { Metadata } from "next";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Profile | LinguaForge",
  description: "Manage your LinguaForge profile, practice settings, and active languages.",
  openGraph: { title: "Profile | LinguaForge", description: "Manage your language practice profile.", type: "website" },
};

export default function ProfilePage() { return <ProfileClient />; }
