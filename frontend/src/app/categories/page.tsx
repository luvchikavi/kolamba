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
  ArrowLeft,
} from "lucide-react";

const categories = [
  { slug: "music", name: "Music", icon: Music, count: 45, color: "from-violet-500 to-purple-500" },
  { slug: "dance", name: "Dance", icon: Sparkles, count: 23, color: "from-pink-500 to-rose-500" },
  { slug: "theater", name: "Theater", icon: Theater, count: 18, color: "from-amber-500 to-orange-500" },
  { slug: "visual-arts", name: "Visual Arts", icon: Palette, count: 12, color: "from-emerald-500 to-teal-500" },
  { slug: "workshops", name: "Workshops", icon: Users, count: 34, color: "from-blue-500 to-indigo-500" },
  { slug: "lectures", name: "Lectures", icon: BookOpen, count: 56, color: "from-cyan-500 to-blue-500" },
  { slug: "film", name: "Film", icon: Film, count: 8, color: "from-red-500 to-pink-500" },
  { slug: "comedy", name: "Comedy", icon: Mic, count: 15, color: "from-yellow-500 to-amber-500" },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-10">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Categories</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Browse by Category
          </h1>
          <p className="text-slate-600">
            Choose a category to discover talented artists
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container-default py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/search?category=${category.slug}`}
                className="group card card-hover p-8"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-soft`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500">
                  {category.count} artists
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
