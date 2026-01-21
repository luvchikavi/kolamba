"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, X, MapPin, Star } from "lucide-react";
import Link from "next/link";

const categories = [
  { slug: "music", name: "Music" },
  { slug: "dance", name: "Dance" },
  { slug: "theater", name: "Theater" },
  { slug: "lectures", name: "Lectures" },
  { slug: "workshops", name: "Workshops" },
  { slug: "comedy", name: "Comedy" },
  { slug: "film", name: "Film" },
  { slug: "visual-arts", name: "Visual Arts" },
];

const languages = ["Hebrew", "English", "Yiddish", "French", "Spanish"];

const mockArtists = [
  {
    id: 1,
    name: "David Cohen",
    price: 500,
    city: "Tel Aviv",
    rating: 4.9,
    categories: [{ name: "Music", slug: "music" }, { name: "Cantorial", slug: "cantorial" }],
  },
  {
    id: 2,
    name: "Sarah Levy",
    price: 400,
    city: "Jerusalem",
    rating: 4.8,
    categories: [{ name: "Lectures", slug: "lectures" }],
  },
  {
    id: 3,
    name: "Yossi Mizrachi",
    price: 600,
    city: "Haifa",
    rating: 4.7,
    categories: [{ name: "Comedy", slug: "comedy" }],
  },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get("language") || "");
  const [showFilters, setShowFilters] = useState(false);

  const updateSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (selectedLanguage) params.set("language", selectedLanguage);
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedLanguage("");
    router.push("/search");
  };

  const hasActiveFilters = selectedCategory || minPrice || maxPrice || selectedLanguage;

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-100 sticky top-20 z-40">
        <div className="container-default py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateSearch()}
                placeholder="Search artists..."
                className="input pl-12"
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden btn-secondary flex items-center justify-center gap-2"
            >
              <Filter size={20} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">!</span>
              )}
            </button>

            {/* Search Button */}
            <button onClick={updateSearch} className="btn-primary">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="container-default py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="card p-6 sticky top-40">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-900">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">
                    Clear all
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat.slug} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.slug}
                        onChange={() => setSelectedCategory(cat.slug)}
                        className="text-primary-500 focus:ring-primary-400"
                      />
                      <span className="text-sm text-slate-600">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 mb-3">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="input text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="input text-sm"
                  />
                </div>
              </div>

              {/* Language Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 mb-3">Language</h4>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="input text-sm"
                >
                  <option value="">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Apply Filters Button (Mobile) */}
              <button
                onClick={() => { updateSearch(); setShowFilters(false); }}
                className="lg:hidden btn-primary w-full"
              >
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-600">
                Found <span className="font-semibold text-slate-900">{mockArtists.length}</span> artists
                {query && <span> for &quot;{query}&quot;</span>}
              </p>
              <select className="input w-auto text-sm">
                <option>Sort by: Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
              </select>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory && (
                  <span className="badge-primary flex items-center gap-1">
                    {categories.find((c) => c.slug === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory("")}><X size={14} /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="badge-primary flex items-center gap-1">
                    ${minPrice || "0"} - ${maxPrice || "∞"}
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}><X size={14} /></button>
                  </span>
                )}
                {selectedLanguage && (
                  <span className="badge-primary flex items-center gap-1">
                    {selectedLanguage}
                    <button onClick={() => setSelectedLanguage("")}><X size={14} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockArtists.map((artist) => (
                <Link key={artist.id} href={`/artists/${artist.id}`} className="group card card-hover overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white/40 group-hover:scale-110 transition-transform duration-500">
                      {artist.name.charAt(0)}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                        {artist.name}
                      </h3>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-medium text-slate-700">{artist.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {artist.categories.map((cat) => (
                        <span key={cat.slug} className="badge-primary text-xs">{cat.name}</span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin size={14} />
                        <span>{artist.city}</span>
                      </div>
                      <div className="font-semibold text-slate-900">From ${artist.price}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* No Results */}
            {mockArtists.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">😕</p>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
