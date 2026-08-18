import type { Metadata } from "next";
import { Bebas_Neue, Inter_Tight } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { LanguageProvider } from "@/context/LanguageContext";
import { Locale } from "@/dictionaries";
import "../globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-bebas",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Universal Method Seminar 2026 — Chris Collins (Bracciano, Italy)",
  description:
    "Official 2-Day Martial Arts Seminar in Bracciano (Rome), Italy. Master Chris Collins (BJJ Black Belt & Wing Tsun Sifu). Reserve your official pass.",
  icons: {
    icon: [
      { url: "/logo-header.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/logo-header.png",
    apple: "/logo-header.png",
  },
  openGraph: {
    title: "Universal Method Seminar 2026 — Chris Collins",
    description: "Official 2-Day Martial Arts Seminar in Bracciano (Rome), Italy — 7 and 8 September 2026.",
    images: ["/logo.png"],
  },
};

export async function generateStaticParams() {
  return [{ lang: "it" }, { lang: "en" }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang: Locale = resolvedParams.lang === "en" ? "en" : "it";

  return (
    <html lang={lang} className={`${bebasNeue.variable} ${interTight.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageProvider lang={lang}>
          <SmoothScroll>{children}</SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
