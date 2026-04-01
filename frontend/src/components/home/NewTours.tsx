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

interface TourOpportunity {
  id: number;
  name: string;
  region: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  status: string;
  artist: {
    id: number;
    name_en: string | null;
    name_he: string | null;
    profile_image: string | null;
    category: string | null;
  };
}

interface DisplayTour {
  key: string;
  artistId: number;
  artistName: string;
  profileImage: string | null;
  description: string | null;
  href: string;
  locations: { location: string; date: string }[];
}

export default function NewTours() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayTours, setDisplayTours] = useState<DisplayTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      // Fetch both real tours and announced tour dates
      const [oppsRes, datesRes] = await Promise.allSettled([
        fetch(`${API_URL}/tours/opportunities?limit=8`),
        fetch(`${API_URL}/talents/tour-dates/recent?limit=8`),
      ]);

      const items: DisplayTour[] = [];
      const seenArtistIds = new Set<number>();

      // Real tours take priority
      if (oppsRes.status === "fulfilled" && oppsRes.value.ok) {
        const opportunities: TourOpportunity[] = await oppsRes.value.json();
        for (const tour of opportunities) {
          const artistId = tour.artist.id;
          const artistName = tour.artist.name_en || tour.artist.name_he || "Artist";
          seenArtistIds.add(artistId);
          items.push({
            key: `tour-${tour.id}`,
            artistId,
            artistName,
            profileImage: tour.artist.profile_image,
            description: tour.name || tour.description,
            href: `/tours/${tour.id}`,
            locations: tour.region
              ? [{ location: tour.region, date: tour.start_date || "" }]
              : [],
          });
        }
      }

      // Fill with announced tour dates for artists not already shown
      if (datesRes.status === "fulfilled" && datesRes.value.ok) {
        const tourDates: TourWithArtist[] = await datesRes.value.json();
        const grouped = new Map<number, DisplayTour>();
        for (const td of tourDates) {
          const artistId = td.artist.id;
          if (seenArtistIds.has(artistId)) continue;
          const artistName = td.artist.name_en || td.artist.name_he || "Artist";
          if (!grouped.has(artistId)) {
            grouped.set(artistId, {
              key: `dates-${artistId}`,
              artistId,
              artistName,
              profileImage: td.artist.profile_image,
              description: td.description,
              href: `/talents/${artistId}`,
              locations: [],
            });
          }
          grouped.get(artistId)!.locations.push({
            location: td.location,
            date: td.start_date,
          });
        }
        items.push(...Array.from(grouped.values()));
      }

      setDisplayTours(items.slice(0, 8));
    } catch (error) {
      console.error("Failed to fetch tours:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (!isLoading && displayTours.length === 0) return null;

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="flex items-center gap-4 mb-12 max-w-4xl mx-auto">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-accent-500 to-primary-500" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold italic text-slate-900 sm:whitespace-nowrap uppercase">
            Upcoming Tours
          </h2>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-primary-500 to-accent-500" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            <div className="relative">
              {displayTours.length > 3 && (
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

              <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {displayTours.map((tour) => (
                  <Link
                    key={tour.key}
                    href={tour.href}
                    className="flex-shrink-0 w-64 sm:w-72 snap-start group"
                  >
                    <div className="card card-hover overflow-hidden">
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 relative overflow-hidden">
                        {tour.profileImage ? (
                          <>
                            <img
                              src={tour.profileImage}
                              alt={tour.artistName}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div
                              className="absolute inset-0 mix-blend-color opacity-40 pointer-events-none"
                              style={{ background: "linear-gradient(135deg, #CA7283 0%, #8E96AB 50%, #53B9CC 100%)" }}
                            />
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl font-bold text-white/40">
                              {tour.artistName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <p className="text-sm text-primary-600 font-medium mb-1">{tour.artistName}</p>
                        <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors mb-3">
                          {tour.description || "On Tour"}
                        </h3>
                        {/* List all tour stops */}
                        <div className="space-y-1.5">
                          {tour.locations.map((loc, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-500 text-sm">
                              <div className="flex items-center gap-1 flex-1 min-w-0">
                                <MapPin size={13} className="flex-shrink-0" />
                                <span className="truncate">{loc.location}</span>
                              </div>
                              {loc.date && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Calendar size={13} />
                                  <span>{formatDate(loc.date)}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                href="/tours"
                className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                View All Tours
                <ChevronRight size={18} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
