"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { DiscoverArtist } from "@/lib/api";

interface DiscoverArtistCardProps {
  artist: DiscoverArtist;
}

export default function DiscoverArtistCard({ artist }: DiscoverArtistCardProps) {
  const name = artist.name_en || artist.name_he;

  const tourDateFormatted = artist.nearest_tour_date
    ? new Date(artist.nearest_tour_date.start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/talents/${artist.id}`}>
        {/* Image */}
        <div className="aspect-[4/3] bg-gradient-to-br from-pink-100 via-pink-50 to-slate-100 flex items-center justify-center relative">
          {artist.profile_image ? (
            <img
              src={artist.profile_image}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <span className="text-5xl font-bold text-white/40 group-hover:scale-110 transition-transform duration-500">
              {name.charAt(0)}
            </span>
          )}
          {artist.is_featured && (
            <div className="absolute top-3 left-3 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
              <Star size={12} fill="currentColor" />
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 group-hover:text-pink-600 transition-colors mb-1">
            {name}
          </h3>

          {/* Category badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {artist.categories?.map((cat) => (
              <span
                key={cat.slug}
                className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full text-xs font-medium"
              >
                {cat.name_en}
              </span>
            ))}
          </div>

          {/* Location and price */}
          <div className="flex justify-between items-center text-sm mb-2">
            <div className="flex items-center gap-1 text-slate-500">
              <MapPin size={14} />
              <span>{artist.city || artist.country}</span>
            </div>
            {artist.price_tier && (
              <span className="font-semibold text-pink-600">{artist.price_tier}</span>
            )}
          </div>

          {/* Interest badge */}
          {artist.matched_event_types.length > 0 && (
            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium inline-block mb-2">
              Matches: {artist.matched_event_types.slice(0, 2).join(", ")}
              {artist.matched_event_types.length > 2 && ` +${artist.matched_event_types.length - 2}`}
            </div>
          )}

          {/* Tour badge */}
          {artist.nearest_tour_date && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
              <MapPin size={12} />
              <span>
                Touring {Math.round(artist.nearest_tour_date.distance_km)}km away
                {tourDateFormatted && ` \u00B7 ${tourDateFormatted}`}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Action buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <Link
          href={`/talents/${artist.id}`}
          className="flex-1 text-center px-3 py-2 border-2 border-slate-900 rounded-full text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          View Profile
        </Link>
        <Link
          href={`/booking/${artist.id}`}
          className="flex-1 text-center px-3 py-2 bg-slate-900 text-white rounded-full text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Request Booking
        </Link>
      </div>
    </div>
  );
}
