"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, X, MapPin, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchArtists } from "@/hooks/useArtists";
import { API_URL } from "@/lib/api";

interface Category {
  id: number;
  name_en: string;
  name_he: string;
  slug: string;
}

const languages = [
  "Hebrew",
  "English",
  "French",
  "Spanish",
  "Russian",
  "Italian",
  "Amharic",
  "Dutch",
  "Swedish",
  "Yiddish",
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get("language") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "name");
  const [sortOrder, setSortOrder] = useState(searchParams.get("sort_order") || "asc");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Build search params for API
  const apiParams = {
    q: query || undefined,
    category: selectedCategory || undefined,
    min_price: minPrice ? parseInt(minPrice) : undefined,
    max_price: maxPrice ? parseInt(maxPrice) : undefined,
    language: selectedLanguage || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  // Use the real API hook
  const { data: artists = [], isLoading, error } = useSearchArtists(apiParams);

  const updateSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (selectedLanguage) params.set("language", selectedLanguage);
    if (sortBy) params.set("sort_by", sortBy);
    if (sortOrder) params.set("sort_order", sortOrder);
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedLanguage("");
    setSortBy("name");
    setSortOrder("asc");
    router.push("/search");
  };

  const handleSortChange = (value: string) => {
    switch (value) {
      case "price_asc":
        setSortBy("price");
        setSortOrder("asc");
        break;
      case "price_desc":
        setSortBy("price");
        setSortOrder("desc");
        break;
      case "name":
      default:
        setSortBy("name");
        setSortOrder("asc");
        break;
    }
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
                      <span className="text-sm text-slate-600">{cat.name_en}</span>
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
                {isLoading ? (
                  <span>Searching...</span>
                ) : (
                  <>
                    Found <span className="font-semibold text-slate-900">{artists.length}</span> artists
                    {query && <span> for &quot;{query}&quot;</span>}
                  </>
                )}
              </p>
              <select
                className="input w-auto text-sm"
                value={sortBy === "price" ? `price_${sortOrder}` : "name"}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="name">Sort by: Name</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory && (
                  <span className="badge-primary flex items-center gap-1">
                    {categories.find((c) => c.slug === selectedCategory)?.name_en || selectedCategory}
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

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={40} className="animate-spin text-primary-500" />
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">😕</p>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
                <p className="text-slate-600 mb-6">Unable to load artists. Please try again.</p>
                <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && !error && artists.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist) => (
                  <Link key={artist.id} href={`/artists/${artist.id}`} className="group card card-hover overflow-hidden">
                    <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 flex items-center justify-center relative">
                      {artist.profile_image ? (
                        <img
                          src={artist.profile_image}
                          alt={artist.name_en || artist.name_he}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-5xl font-bold text-white/40 group-hover:scale-110 transition-transform duration-500">
                          {(artist.name_en || artist.name_he).charAt(0)}
                        </span>
                      )}
                      {artist.is_featured && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <Star size={12} fill="currentColor" />
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                          {artist.name_en || artist.name_he}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {artist.categories?.map((cat) => (
                          <span key={cat.slug} className="badge-primary text-xs">{cat.name_en}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin size={14} />
                          <span>{artist.city || artist.country}</span>
                        </div>
                        {artist.price_single && (
                          <div className="font-semibold text-slate-900">From ${artist.price_single}</div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && artists.length === 0 && (
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
