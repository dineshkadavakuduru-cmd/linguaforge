import type { Metadata } from "next";
import LandingClient from "@/components/marketing/LandingClient";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    url: SITE_URL,
  },
};

export default function MarketingPage() { return <LandingClient />; }
