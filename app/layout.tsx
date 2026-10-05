import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LinguaForge | Learn languages. Actually remember them.",
    template: "%s | LinguaForge",
  },
  description: "Learn languages with a calmer, more deliberate practice loop.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "LinguaForge",
    title: "LinguaForge | Learn languages. Actually remember them.",
    description: "Deliberate exercises and intelligent review for language learners.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LinguaForge — deliberate language practice" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinguaForge | Learn languages. Actually remember them.",
    description: "Deliberate exercises and intelligent review for language learners.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/favicon.ico", sizes: "any" }],
    apple: "/apple-touch-icon.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <MotionProvider>{children}</MotionProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
