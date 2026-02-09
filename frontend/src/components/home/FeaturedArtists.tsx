"use client";

import { useRef, useState, useEffect } from "react";
import ArtistCard from "@/components/artists/ArtistCard";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toggleFavorite } from "@/lib/favorites";
import { API_URL, ArtistListItem } from "@/lib/api";

export default function FeaturedArtists() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [artists, setArtists] = useState<ArtistListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage
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

    // Fetch featured artists from API
    fetch(`${API_URL}/artists/featured?limit=6`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ArtistListItem[]) => setArtists(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleFavoriteToggle = (id: number) => {
    const artist = artists.find((a) => a.id === id);
    toggleFavorite(id, artist?.name_en || "Artist");
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Loader2 size={32} className="animate-spin text-slate-400 mx-auto" />
        </div>
      </section>
    );
  }

  if (artists.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title with decorative elements */}
        <div className="text-center mb-12 relative">
          {/* Decorative flourishes */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -mt-4 flex items-center gap-2 text-teal-400 opacity-60">
            <span className="text-2xl">~</span>
            <span className="text-lg">,</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 italic tracking-tight">
            NEW ARTISTS
          </h2>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 -mb-2 flex items-center gap-2 text-pink-400 opacity-60">
            <span className="text-lg">~</span>
          </div>
        </div>

        {/* Artists Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors hidden md:flex"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors hidden md:flex"
          >
            <ChevronRight size={24} className="text-slate-600" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="flex-shrink-0 w-72 snap-start"
              >
                <ArtistCard
                  id={artist.id}
                  name={artist.name_en || artist.name_he}
                  category={artist.categories?.[0]?.name_en || "Artist"}
                  description={artist.bio_en || ""}
                  image={artist.profile_image || ""}
                  rating={5}
                  isFavorited={favoriteIds.has(artist.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
