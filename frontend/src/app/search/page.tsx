"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, X, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

// Placeholder data with bilingual support
const categories = [
  { slug: "singing", nameHe: "שירה", nameEn: "Singing" },
  { slug: "cantorial", nameHe: "חזנות", nameEn: "Cantorial" },
  { slug: "lecture", nameHe: "הרצאה", nameEn: "Lecture" },
  { slug: "workshop", nameHe: "סדנה", nameEn: "Workshop" },
  { slug: "children", nameHe: "מופע לילדים", nameEn: "Children's Show" },
  { slug: "comedy", nameHe: "קומדיה", nameEn: "Comedy" },
  { slug: "theater", nameHe: "תיאטרון", nameEn: "Theater" },
  { slug: "music", nameHe: "מוסיקה", nameEn: "Music" },
];

const languages = ["Hebrew", "English", "Yiddish", "French", "Spanish"];

// Mock artists data with bilingual support
const mockArtists = [
  {
    id: 1,
    nameHe: "דוד כהן",
    nameEn: "David Cohen",
    priceSingle: 500,
    cityHe: "תל אביב",
    cityEn: "Tel Aviv",
    categories: [
      { nameHe: "שירה", nameEn: "Singing", slug: "singing" },
      { nameHe: "חזנות", nameEn: "Cantorial", slug: "cantorial" }
    ],
  },
  {
    id: 2,
    nameHe: "שרה לוי",
    nameEn: "Sarah Levy",
    priceSingle: 400,
    cityHe: "ירושלים",
    cityEn: "Jerusalem",
    categories: [{ nameHe: "הרצאה", nameEn: "Lecture", slug: "lecture" }],
  },
  {
    id: 3,
    nameHe: "יוסי מזרחי",
    nameEn: "Yossi Mizrachi",
    priceSingle: 600,
    cityHe: "חיפה",
    cityEn: "Haifa",
    categories: [{ nameHe: "קומדיה", nameEn: "Comedy", slug: "comedy" }],
  },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language, isRTL } = useLanguage();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get("language") || "");
  const [showFilters, setShowFilters] = useState(false);

  // Update URL when filters change
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
    <div className="min-h-screen bg-neutral-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-neutral-400`} size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && updateSearch()}
                placeholder={t.search.placeholder}
                className={`w-full py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
              />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 rounded-lg"
            >
              <Filter size={20} />
              <span>{t.search.filters}</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {/* Search Button */}
            <button
              onClick={updateSearch}
              className="px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              {t.search.button}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-40">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">{t.search.filters}</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-500 hover:text-primary-600"
                  >
                    {t.search.clearAll}
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">{t.search.category}</h4>
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
                      <span className="text-sm">{language === 'he' ? cat.nameHe : cat.nameEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">{t.search.priceRange}</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={t.search.minimum}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    dir="ltr"
                  />
                  <input
                    type="number"
                    placeholder={t.search.maximum}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Language Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">{t.search.language}</h4>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">{t.search.allLanguages}</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Apply Filters Button (Mobile) */}
              <button
                onClick={() => {
                  updateSearch();
                  setShowFilters(false);
                }}
                className="lg:hidden w-full py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-medium"
              >
                {t.search.applyFilters}
              </button>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-neutral-600">
                {t.search.resultsFound} <span className="font-bold">{mockArtists.length}</span> {query && <span>{t.search.resultsFor} &quot;{query}&quot;</span>}
              </p>
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option>{t.search.sortBy} {t.search.relevance}</option>
                <option>{t.search.priceLowToHigh}</option>
                <option>{t.search.priceHighToLow}</option>
              </select>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {language === 'he'
                      ? categories.find((c) => c.slug === selectedCategory)?.nameHe
                      : categories.find((c) => c.slug === selectedCategory)?.nameEn}
                    <button onClick={() => setSelectedCategory("")}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    ${minPrice || "0"} - ${maxPrice || "∞"}
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedLanguage && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {selectedLanguage}
                    <button onClick={() => setSelectedLanguage("")}>
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockArtists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-100"
                >
                  {/* Image placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <span className="text-5xl font-display font-bold text-white/50">
                      {language === 'he' ? artist.nameHe.charAt(0) : artist.nameEn.charAt(0)}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
                      {language === 'he' ? artist.nameHe : artist.nameEn}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-2">
                      {language === 'he' ? artist.nameEn : artist.nameHe}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {artist.categories.map((cat) => (
                        <span
                          key={cat.slug}
                          className="px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-full"
                        >
                          {language === 'he' ? cat.nameHe : cat.nameEn}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-sm text-neutral-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        <span>{language === 'he' ? artist.cityHe : artist.cityEn}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        <span>{t.search.from}{artist.priceSingle}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* No Results */}
            {mockArtists.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">😕</p>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">{t.search.noResults}</h3>
                <p className="text-neutral-600 mb-6">{t.search.noResultsHint}</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-lg"
                >
                  {t.search.clearFilters}
                </button>
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
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
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
