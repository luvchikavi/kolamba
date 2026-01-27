"use client";

import Link from "next/link";
import { Music, BookOpen, Mic2, Newspaper, Star, Sparkles } from "lucide-react";

const categories = [
  {
    slug: "music",
    name: "MUSIC",
    icon: Music,
    iconColor: "text-teal-400",
    bgColor: "bg-teal-50",
    accentColor: "text-pink-300",
  },
  {
    slug: "literature",
    name: "LITERATURE",
    icon: BookOpen,
    iconColor: "text-pink-400",
    bgColor: "bg-pink-50",
    accentColor: "text-teal-300",
  },
  {
    slug: "journalism",
    name: "JOURNALISM",
    icon: Newspaper,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-50",
    accentColor: "text-pink-300",
  },
  {
    slug: "judaism",
    name: "JUDAISM",
    icon: Star,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-50",
    accentColor: "text-teal-300",
  },
  {
    slug: "comedy",
    name: "COMEDY",
    icon: Mic2,
    iconColor: "text-amber-400",
    bgColor: "bg-amber-50",
    accentColor: "text-teal-300",
  },
  {
    slug: "inspiration",
    name: "INSPIRATION",
    icon: Sparkles,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-50",
    accentColor: "text-pink-300",
  },
];

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12 relative">
          {/* Decorative flourishes */}
          <div className="absolute left-1/3 top-0 text-teal-400 opacity-40 text-xl hidden md:block">
            ~
          </div>
          <div className="absolute right-1/3 top-0 text-pink-400 opacity-40 text-xl hidden md:block">
            ,~
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 italic tracking-tight">
            SEARCH BY CATEGORY
          </h2>
        </div>

        {/* Categories Grid - Large Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/search?category=${category.slug}`}
                className={`group relative ${category.bgColor} rounded-3xl p-12 md:p-16 overflow-hidden hover:shadow-lg transition-all duration-300`}
              >
                {/* Background Icon - Large and faded */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Icon size={200} className={category.iconColor} strokeWidth={1} />
                </div>

                {/* Decorative accent */}
                <div className={`absolute top-6 right-6 ${category.accentColor} opacity-40 text-3xl`}>
                  ~
                </div>
                <div className={`absolute bottom-6 left-6 ${category.accentColor} opacity-40 text-3xl`}>
                  ,
                </div>

                {/* Category Name */}
                <h3 className="relative z-10 text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 text-center">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
