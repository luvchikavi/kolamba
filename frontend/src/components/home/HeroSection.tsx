"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-neutral-100 via-white to-neutral-100 py-16 md:py-24">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-brand-gradient opacity-5"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo */}
        <h1 className="text-5xl md:text-7xl font-display font-bold text-brand-gradient mb-2 tracking-wide">
          KOLAMBA
        </h1>
        <div className="h-1 w-48 md:w-64 bg-brand-gradient mx-auto mb-4"></div>
        <p className="text-sm md:text-base text-primary-500 uppercase tracking-widest mb-8">
          The Jewish Culture Club
        </p>

        {/* Tagline */}
        <h2 className="text-2xl md:text-3xl text-neutral-700 mb-8 font-hebrew">
          מקשרים אמנים ישראלים לקהילות יהודיות ברחבי העולם
        </h2>

        <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
          גלו אמנים מוכשרים לאירועים בקהילה שלכם - שירה, הרצאות, סדנאות ועוד
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש אמנים, קטגוריות..."
                className="w-full pr-12 pl-4 py-4 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-right"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
            >
              חפש
            </button>
          </div>
        </form>

        {/* Quick category links */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <span className="text-neutral-500 text-sm">פופולרי:</span>
          {["שירה", "חזנות", "הרצאה", "סדנה"].map((cat) => (
            <button
              key={cat}
              onClick={() => router.push(`/search?q=${encodeURIComponent(cat)}`)}
              className="px-3 py-1 text-sm bg-white hover:bg-primary-50 text-neutral-600 hover:text-primary-600 rounded-full border border-neutral-200 hover:border-primary-300 transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
