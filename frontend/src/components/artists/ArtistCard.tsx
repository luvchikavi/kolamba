import Link from "next/link";
import { MapPin, DollarSign } from "lucide-react";
import type { ArtistListItem, Category } from "@/lib/api";

interface ArtistCardProps {
  artist: ArtistListItem;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link
      href={`/artists/${artist.id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-100"
    >
      {/* Featured badge */}
      {artist.is_featured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-1 bg-secondary-400 text-white text-xs rounded-full">
            מומלץ
          </span>
        </div>
      )}

      {/* Image placeholder */}
      <div className="relative aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
        {artist.profile_image ? (
          <img
            src={artist.profile_image}
            alt={artist.name_he}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl font-display font-bold text-white/50">
            {artist.name_he.charAt(0)}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
          {artist.name_he}
        </h3>
        <p className="text-sm text-neutral-500 mb-2">{artist.name_en}</p>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-3">
          {artist.categories.slice(0, 2).map((cat: Category) => (
            <span
              key={cat.slug}
              className="px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-full"
            >
              {cat.name_he}
            </span>
          ))}
          {artist.categories.length > 2 && (
            <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-500 rounded-full">
              +{artist.categories.length - 2}
            </span>
          )}
        </div>

        {/* Location & Price */}
        <div className="flex justify-between items-center text-sm text-neutral-600">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{artist.city || artist.country}</span>
          </div>
          {artist.price_single && (
            <div className="flex items-center gap-1">
              <DollarSign size={14} />
              <span>מ-${artist.price_single}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
