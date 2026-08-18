"use client";

import React, { createContext, useContext, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, getDictionary, Dictionary } from "@/dictionaries";

interface LanguageContextType {
  lang: Locale;
  dict: Dictionary;
  switchLanguage: (newLang: Locale) => void;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  lang,
  children,
}: {
  lang: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const dict = getDictionary(lang);

  const switchLanguage = (newLang: Locale) => {
    if (newLang === lang) return;

    startTransition(() => {
      if (!pathname) {
        router.push(`/${newLang}`);
        return;
      }

      // Replace current language segment in pathname
      const segments = pathname.split("/");
      if (segments[1] === "it" || segments[1] === "en") {
        segments[1] = newLang;
      } else {
        segments.splice(1, 0, newLang);
      }

      const newPathname = segments.join("/") || `/${newLang}`;
      router.push(newPathname);
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, dict, switchLanguage, isPending }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
