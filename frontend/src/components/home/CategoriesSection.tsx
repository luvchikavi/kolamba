"use client";

import Link from "next/link";
import {
  Music,
  BookOpen,
  Users,
  Baby,
  Sparkles,
  Theater,
  Mic,
  Palette,
  Film,
  Newspaper
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
  { slug: "music", nameHe: "מוזיקה", nameEn: "Music", icon: Music },
  { slug: "dance", nameHe: "ריקוד", nameEn: "Dance", icon: Sparkles },
  { slug: "theater", nameHe: "תיאטרון", nameEn: "Theater", icon: Theater },
  { slug: "visual-arts", nameHe: "אמנות חזותית", nameEn: "Visual Arts", icon: Palette },
  { slug: "workshops", nameHe: "סדנאות", nameEn: "Workshops", icon: Users },
  { slug: "lectures", nameHe: "הרצאות", nameEn: "Lectures", icon: BookOpen },
  { slug: "film", nameHe: "קולנוע", nameEn: "Film", icon: Film },
  { slug: "journalism", nameHe: "עיתונות", nameEn: "Journalism", icon: Newspaper },
];

export default function CategoriesSection() {
  const { t, language, isRTL } = useLanguage();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
            {t.categories.title}
          </h2>
          <div className="h-0.5 w-32 bg-brand-gradient mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/search?category=${category.slug}`}
                className="group flex flex-col items-center p-4 rounded-xl bg-neutral-50 hover:bg-primary-50 border border-neutral-100 hover:border-primary-200 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-white group-hover:bg-primary-100 flex items-center justify-center mb-3 transition-colors shadow-sm">
                  <Icon className="text-primary-500 group-hover:text-primary-600" size={24} />
                </div>
                <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-600 text-center">
                  {language === 'he' ? category.nameHe : category.nameEn}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            {t.categories.viewAll} {isRTL ? '←' : '→'}
          </Link>
        </div>
      </div>
    </section>
  );
}
