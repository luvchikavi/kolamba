"use client";

import { useLocale } from "@/i18n/provider";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    const nextLocale: Locale = locale === "en" ? "he" : "en";
    setLocale(nextLocale);
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-sm text-slate-600"
      aria-label={`Switch to ${localeNames[locale === "en" ? "he" : "en"]}`}
      title={`Switch to ${localeNames[locale === "en" ? "he" : "en"]}`}
    >
      <Globe size={16} />
      <span className="font-medium">{locale === "en" ? "עב" : "EN"}</span>
    </button>
  );
}
