"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Star, Search, Filter, Loader2, Heart } from "lucide-react";
import { API_URL } from "@/lib/api";
import { toggleFavorite } from "@/lib/favorites";

interface Category {
  id: number;
  name_en: string;
  name_he: string;
  slug: string;
}

interface Artist {
  id: number;
  name_en: string | null;
  name_he: string | null;
  profile_image: string | null;
  price_single: number | null;
  price_tier: string | null;
  city: string | null;
  country: string | null;
  is_featured: boolean;
  categories: Category[];
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const ids = new Set<number>();
    try {
      const raw = localStorage.getItem("kolamba_favorites");
      if (raw) {
        const data = JSON.parse(raw);
        for (const list of data.lists || []) {
          for (const id of list.artistIds || []) {
            ids.add(id);
          }
        }
      }
    } catch { /* ignore */ }
    setFavoriteIds(ids);
  }, []);

  const handleFavoriteToggle = (artistId: number, artistName: string) => {
    toggleFavorite(artistId, artistName);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(artistId)) {
        next.delete(artistId);
      } else {
        next.add(artistId);
      }
      return next;
    });
  };

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch(`${API_URL}/talents`);
        if (res.ok) {
          const data = await res.json();
          setArtists(data);
        }
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const filteredArtists = artists.filter((artist) => {
    const name = artist.name_en || artist.name_he || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Talents</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Browse Talents
              </h1>
              <p className="text-slate-600">
                Discover talented Israeli performers for your events
              </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search talents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-11 w-64"
                />
              </div>
              <Link
                href="/search"
                className="btn-secondary flex items-center gap-2"
              >
                <Filter size={18} />
                Filters
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Artists Grid */}
      <div className="container-default py-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={40} className="animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            <p className="text-slate-600 mb-6">
              Found <span className="font-semibold text-slate-900">{filteredArtists.length}</span> talents
            </p>

            {filteredArtists.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">😕</p>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No talents found</h3>
                <p className="text-slate-600">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredArtists.map((artist) => {
                  const artistName = artist.name_en || artist.name_he || "Talent";
                  const fav = favoriteIds.has(artist.id);
                  return (
                    <div
                      key={artist.id}
                      className="group card card-hover overflow-hidden relative"
                    >
                      <Link href={`/talents/${artist.id}`}>
                        {/* Image / Avatar */}
                        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 flex items-center justify-center overflow-hidden">
                          {artist.profile_image ? (
                            <img
                              src={artist.profile_image}
                              alt={artistName}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-6xl font-bold text-white/40 group-hover:scale-110 transition-transform duration-500">
                              {artistName.charAt(0)}
                            </span>
                          )}
                          {artist.is_featured && (
                            <div className="absolute top-3 left-3">
                              <span className="badge-accent text-xs">Featured</span>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                              {artistName}
                            </h3>
                          </div>

                          {/* Categories */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {artist.categories?.slice(0, 2).map((cat) => (
                              <span key={cat.slug} className="badge-primary text-xs">
                                {cat.name_en}
                              </span>
                            ))}
                          </div>

                          {/* Location & Price */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1 text-slate-500">
                              <MapPin size={14} />
                              <span>{artist.city || artist.country || "Israel"}</span>
                            </div>
                            {artist.price_tier && (
                              <div className="font-semibold text-slate-900">
                                {artist.price_tier}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFavoriteToggle(artist.id, artistName);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-10"
                      >
                        <Heart
                          size={18}
                          className={fav ? "text-pink-500 fill-pink-500" : "text-pink-400"}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
