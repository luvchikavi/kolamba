"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Loader2,
  Music,
  Globe,
} from "lucide-react";
import { API_URL } from "@/lib/api";

interface TourDateWithArtist {
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
  region: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  description: string | null;
  confirmed_shows: number;
  price_tier: string | null;
  artist: {
    id: number;
    name_en: string | null;
    name_he: string | null;
    profile_image: string | null;
    category: string | null;
  };
}

export default function ToursPage() {
  const [tourDates, setTourDates] = useState<TourDateWithArtist[]>([]);
  const [opportunities, setOpportunities] = useState<TourOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [datesRes, oppsRes] = await Promise.allSettled([
          fetch(`${API_URL}/talents/tour-dates/recent?limit=20`),
          fetch(`${API_URL}/tours/opportunities`),
        ]);

        if (datesRes.status === "fulfilled" && datesRes.value.ok) {
          const data = await datesRes.value.json();
          setTourDates(data);
        }

        if (oppsRes.status === "fulfilled" && oppsRes.value.ok) {
          const data = await oppsRes.value.json();
          setOpportunities(data);
        }
      } catch (error) {
        console.error("Failed to fetch tours:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateRange = (start: string | null, end: string | null) => {
    if (!start) return "TBD";
    const startFormatted = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!end) return startFormatted;
    const endFormatted = new Date(end).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startFormatted} – ${endFormatted}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary-500" />
      </div>
    );
  }

  const hasTours = tourDates.length > 0 || opportunities.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 italic tracking-tight mb-4">
            UPCOMING TOURS
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover talented artists touring near your community. Browse upcoming tour dates
            and tour opportunities to bring live performances to your venue.
          </p>
        </div>

        {!hasTours ? (
          <div className="card p-12 text-center max-w-lg mx-auto">
            <Globe size={48} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Tours Yet</h2>
            <p className="text-slate-500 mb-6">
              Check back soon — artists are planning their upcoming tours.
            </p>
            <Link href="/search" className="btn-primary inline-flex">
              Browse Talents
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Tour Opportunities (shown first) */}
            {opportunities.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Music size={24} className="text-primary-500" />
                  Upcoming Tours
                </h2>
                <p className="text-slate-600 mb-6">
                  These artists are planning tours and looking for venues.
                  Request to join a tour to bring them to your community.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {opportunities.map((tour) => {
                    const artistName = tour.artist.name_en || tour.artist.name_he || "Artist";
                    return (
                      <div key={tour.id} className="card p-0 overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-4 p-4 border-b border-slate-100">
                          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                            {tour.artist.profile_image ? (
                              <img
                                src={tour.artist.profile_image}
                                alt={artistName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg font-semibold">
                                {artistName[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/talents/${tour.artist.id}`}
                              className="font-semibold text-slate-900 hover:text-primary-600 transition-colors line-clamp-1"
                            >
                              {artistName}
                            </Link>
                            {tour.artist.category && (
                              <p className="text-sm text-slate-500">{tour.artist.category}</p>
                            )}
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            tour.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {tour.status === "approved" ? "Confirmed" : "Open"}
                          </span>
                        </div>

                        <div className="p-4 space-y-3">
                          <h3 className="font-semibold text-slate-800">{tour.name}</h3>
                          {tour.description && (
                            <p className="text-sm text-slate-600 line-clamp-2">{tour.description}</p>
                          )}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin size={16} className="text-slate-400" />
                              <span className="line-clamp-1">{tour.region}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Calendar size={16} className="text-slate-400" />
                              <span>{formatDateRange(tour.start_date, tour.end_date)}</span>
                            </div>
                          </div>
                          {tour.price_tier && (
                            <span className="text-primary-600 font-semibold text-sm">{tour.price_tier}</span>
                          )}
                        </div>

                        <div className="px-4 pb-4">
                          <Link
                            href={`/talents/${tour.artist.id}`}
                            className="btn-primary w-full text-center justify-center text-sm"
                          >
                            View Artist & Tour Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Individual Shows */}
            {tourDates.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar size={24} className="text-primary-500" />
                  Individual Shows
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tourDates.map((tour) => {
                    const artistName = tour.artist.name_en || tour.artist.name_he || "Artist";
                    return (
                      <Link
                        key={`${tour.artist.id}-${tour.id}`}
                        href={`/talents/${tour.artist.id}`}
                        className="group"
                      >
                        <div className="card card-hover overflow-hidden">
                          <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 relative overflow-hidden">
                            {tour.artist.profile_image ? (
                              <img
                                src={tour.artist.profile_image}
                                alt={artistName}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-5xl font-bold text-white/40">
                                  {artistName.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
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
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
