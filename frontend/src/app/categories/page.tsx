"use client";

import Link from "next/link";
import {
  Music,
  BookOpen,
  Users,
  Sparkles,
  Theater,
  Palette,
  Film,
  Newspaper,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
  { slug: "music", nameHe: "מוזיקה", nameEn: "Music", icon: Music, count: 45 },
  { slug: "dance", nameHe: "ריקוד", nameEn: "Dance", icon: Sparkles, count: 23 },
  { slug: "theater", nameHe: "תיאטרון", nameEn: "Theater", icon: Theater, count: 18 },
  { slug: "visual-arts", nameHe: "אמנות חזותית", nameEn: "Visual Arts", icon: Palette, count: 12 },
  { slug: "workshops", nameHe: "סדנאות", nameEn: "Workshops", icon: Users, count: 34 },
  { slug: "lectures", nameHe: "הרצאות", nameEn: "Lectures", icon: BookOpen, count: 56 },
  { slug: "film", nameHe: "קולנוע", nameEn: "Film", icon: Film, count: 8 },
  { slug: "journalism", nameHe: "עיתונות", nameEn: "Journalism", icon: Newspaper, count: 15 },
];

export default function CategoriesPage() {
  const { t, language, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-4"
          >
            {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            {t.common.back}
          </Link>
          <h1 className="text-3xl font-bold text-neutral-800">{t.categories.title}</h1>
          <p className="text-neutral-600 mt-2">
            {language === 'he'
              ? 'בחר קטגוריה כדי לגלות אמנים מוכשרים'
              : 'Choose a category to discover talented artists'}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            const name = language === 'he' ? category.nameHe : category.nameEn;

            return (
              <Link
                key={category.slug}
                href={`/search?category=${category.slug}`}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-neutral-100 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="text-primary-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
                  {name}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {category.count} {language === 'he' ? 'אמנים' : 'artists'}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
