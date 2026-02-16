"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { NextIntlClientProvider } from "next-intl";
import { Locale, defaultLocale, isRtl } from "./config";

import en from "./messages/en.json";
import he from "./messages/he.json";

const messages: Record<Locale, typeof en> = { en, he };

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
}

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  dir: "ltr",
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = localStorage.getItem("kolamba-locale") as Locale | null;
    if (stored && (stored === "en" || stored === "he")) {
      setLocaleState(stored);
    }
  }, []);

  // Update html attributes when locale changes
  useEffect(() => {
    const dir = isRtl(locale) ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("kolamba-locale", newLocale);
  }, []);

  const dir = isRtl(locale) ? "rtl" : "ltr";

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dir }}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
