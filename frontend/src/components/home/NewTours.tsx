"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";

interface TourWithArtist {
  id: number;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
  artist: {
    id: number;
    name_en: string | null;
    name_he: string | null;
    profile_image: string | null;
    city: string | null;
    country: string | null;
  };
}

export default function NewTours() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tours, setTours] = useState<TourWithArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      // Use the new efficient endpoint that returns tours with artist info
      const res = await fetch(`${API_URL}/artists/tour-dates/recent?limit=8`);
      if (!res.ok) return;

      const data: TourWithArtist[] = await res.json();
      setTours(data);
    } catch (error) {
      console.error("Failed to fetch tours:", error);
    } finally {
      setIsLoading(false);
    }
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Don't render section if no tours
  if (!isLoading && tours.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Title with decorative elements */}
        <div className="text-center mb-12 relative">
          {/* Decorative flourishes */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -mt-4 flex items-center gap-2 text-pink-400 opacity-60">
            <span className="text-2xl">~</span>
            <span className="text-lg">,</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 italic tracking-tight">
            UPCOMING TOURS
          </h2>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 -mb-2 flex items-center gap-2 text-teal-400 opacity-60">
            <span className="text-lg">~</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {/* Tours Carousel */}
            <div className="relative">
              {/* Navigation Buttons */}
              {tours.length > 3 && (
                <>
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
                </>
              )}

              {/* Scrollable Container */}
              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {tours.map((tour) => {
                  const artistName = tour.artist.name_en || tour.artist.name_he || "Artist";
                  return (
                    <Link
                      key={`${tour.artist.id}-${tour.id}`}
                      href={`/artists/${tour.artist.id}`}
                      className="flex-shrink-0 w-72 snap-start group"
                    >
                      <div className="card card-hover overflow-hidden">
                        {/* Tour Image */}
                        <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 relative overflow-hidden">
                          {tour.artist.profile_image ? (
                            <img
                              src={tour.artist.profile_image}
                              alt={artistName}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-5xl font-bold text-white/40 group-hover:scale-110 transition-transform duration-500">
                                {artistName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Tour Info */}
                        <div className="p-5">
                          <p className="text-sm text-primary-600 font-medium mb-1">{artistName}</p>
                          <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors mb-3">
                            {tour.description || "On Tour"}
                          </h3>
                          <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
                            <MapPin size={14} />
                            <span>{tour.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500 text-sm">
                            <Calendar size={14} />
                            <span>{formatDate(tour.start_date)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* View All Artists Link */}
            <div className="text-center mt-8">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                Browse All Artists
                <ChevronRight size={18} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
