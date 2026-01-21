"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";

interface Category {
  id?: number;
  name: string;
  slug: string;
}

interface Artist {
  id: number;
  name: string;
  image?: string;
  price?: number;
  city?: string;
  country?: string;
  rating?: number;
  categories: Category[];
  isFeatured?: boolean;
}

interface ArtistCardProps {
  artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      href={`/artists/${artist.id}`}
      className="group card card-hover overflow-hidden"
    >
      {/* Image / Avatar */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 flex items-center justify-center overflow-hidden">
        {artist.image ? (
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-6xl font-bold text-white/40 group-hover:scale-110 transition-transform duration-500">
            {artist.name.charAt(0)}
          </span>
        )}
        {artist.isFeatured && (
          <div className="absolute top-3 left-3">
            <span className="badge-accent text-xs">Featured</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
            {artist.name}
          </h3>
          {artist.rating && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star size={14} fill="currentColor" />
              <span className="text-sm font-medium text-slate-700">{artist.rating}</span>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {artist.categories.slice(0, 2).map((cat) => (
            <span key={cat.slug} className="badge-primary text-xs">
              {cat.name}
            </span>
          ))}
          {artist.categories.length > 2 && (
            <span className="badge-slate text-xs">
              +{artist.categories.length - 2}
            </span>
          )}
        </div>

        {/* Location & Price */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-slate-500">
            <MapPin size={14} />
            <span>{artist.city || artist.country}</span>
          </div>
          {artist.price && (
            <div className="font-semibold text-slate-900">
              From ${artist.price}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
