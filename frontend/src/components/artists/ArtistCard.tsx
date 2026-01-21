"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, CheckCircle2, Star } from "lucide-react";

interface ArtistCardProps {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  isVerified?: boolean;
  isFavorited?: boolean;
  onFavoriteToggle?: (id: number) => void;
}

export default function ArtistCard({
  id,
  name,
  category,
  description,
  image,
  rating,
  isVerified = true,
  isFavorited = false,
  onFavoriteToggle,
}: ArtistCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorited(!favorited);
    onFavoriteToggle?.(id);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            size={16}
            className="text-black fill-black"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            size={16}
            className="text-black fill-black/50"
          />
        );
      } else {
        stars.push(
          <Star
            key={i}
            size={16}
            className="text-gray-300"
          />
        );
      }
    }
    return stars;
  };

  return (
    <Link href={`/artists/${id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={image || "/placeholder-artist.jpg"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          >
            <Heart
              size={20}
              className={favorited ? "text-pink-500 fill-pink-500" : "text-pink-400"}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Name with Verified Badge */}
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">
              {name}
            </h3>
            {isVerified && (
              <CheckCircle2 size={20} className="text-teal-500 fill-teal-100" />
            )}
          </div>

          {/* Category Tag */}
          <span className="inline-block px-4 py-1.5 border border-slate-300 rounded-full text-sm font-medium text-slate-700 mb-3">
            {category}
          </span>

          {/* Description */}
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
            {description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Reviews</span>
            <div className="flex items-center gap-0.5">
              {renderStars(rating)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
