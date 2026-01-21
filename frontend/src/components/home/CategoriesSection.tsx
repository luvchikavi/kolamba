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
  Mic,
} from "lucide-react";

const categories = [
  { slug: "music", name: "Music", icon: Music, color: "from-violet-500 to-purple-500" },
  { slug: "dance", name: "Dance", icon: Sparkles, color: "from-pink-500 to-rose-500" },
  { slug: "theater", name: "Theater", icon: Theater, color: "from-amber-500 to-orange-500" },
  { slug: "visual-arts", name: "Visual Arts", icon: Palette, color: "from-emerald-500 to-teal-500" },
  { slug: "workshops", name: "Workshops", icon: Users, color: "from-blue-500 to-indigo-500" },
  { slug: "lectures", name: "Lectures", icon: BookOpen, color: "from-cyan-500 to-blue-500" },
  { slug: "film", name: "Film", icon: Film, color: "from-red-500 to-pink-500" },
  { slug: "comedy", name: "Comedy", icon: Mic, color: "from-yellow-500 to-amber-500" },
];

export default function CategoriesSection() {
  return (
    <section className="section bg-slate-50">
      <div className="container-default">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Explore by Category
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Find the perfect artist for your event, from traditional music to contemporary theater
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/search?category=${category.slug}`}
                className="group card card-hover p-6 text-center"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white" size={26} />
                </div>
                <h3 className="font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>

        {/* View all link */}
        <div className="text-center mt-10">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium link-underline"
          >
            View all categories
          </Link>
        </div>
      </div>
    </section>
  );
}
