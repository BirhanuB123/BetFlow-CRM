"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import { en, type Dictionary } from "./dictionaries/en";
import { am } from "./dictionaries/am";

export type Language = "en" | "am";

const dictionaries: Record<Language, Dictionary> = {
  en,
  am,
};

type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (keyPath: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "betflow-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && (saved === "en" || saved === "am")) {
        setLangState(saved);
      }
    } catch {
      // Ignore SSR / localStorage issues
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // Ignore
    }
  }, []);

  // Helper to resolve nested keys like "nav.dashboard" or "actions.launchCommandCenter"
  const t = useCallback(
    (keyPath: string): string => {
      const currentDict = dictionaries[lang] || dictionaries.en;
      const parts = keyPath.split(".");
      let current: unknown = currentDict;

      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = (current as Record<string, unknown>)[part];
        } else {
          // Fallback to English dictionary if key missing in Amharic
          let fallback: unknown = dictionaries.en;
          for (const fbPart of parts) {
            if (fallback && typeof fallback === "object" && fbPart in fallback) {
              fallback = (fallback as Record<string, unknown>)[fbPart];
            } else {
              return keyPath;
            }
          }
          return typeof fallback === "string" ? fallback : keyPath;
        }
      }

      return typeof current === "string" ? current : keyPath;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider value={{ lang: mounted ? lang : "en", setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
