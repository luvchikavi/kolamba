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
  Palette
} from "lucide-react";

const categories = [
  { slug: "singing", nameHe: "שירה", nameEn: "Singing", icon: Music },
  { slug: "cantorial", nameHe: "חזנות", nameEn: "Cantorial", icon: Mic },
  { slug: "lecture", nameHe: "הרצאה", nameEn: "Lecture", icon: BookOpen },
  { slug: "workshop", nameHe: "סדנה", nameEn: "Workshop", icon: Users },
  { slug: "children", nameHe: "מופע לילדים", nameEn: "Children", icon: Baby },
  { slug: "comedy", nameHe: "קומדיה", nameEn: "Comedy", icon: Sparkles },
  { slug: "theater", nameHe: "תיאטרון", nameEn: "Theater", icon: Theater },
  { slug: "visual-art", nameHe: "אמנות", nameEn: "Visual Art", icon: Palette },
];

export default function CategoriesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
            קטגוריות פופולריות
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
                  {category.nameHe}
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
            לכל הקטגוריות ←
          </Link>
        </div>
      </div>
    </section>
  );
}
