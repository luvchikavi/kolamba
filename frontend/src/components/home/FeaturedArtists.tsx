"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";

interface Artist {
  id: number;
  name: string;
  image?: string;
  price: number;
  city: string;
  country: string;
  rating: number;
  categories: string[];
  isFeatured: boolean;
}

// Sample data with realistic artists
const sampleArtists: Artist[] = [
  {
    id: 1,
    name: "David Cohen",
    price: 800,
    city: "Tel Aviv",
    country: "Israel",
    rating: 4.9,
    categories: ["Music", "Cantorial"],
    isFeatured: true,
  },
  {
    id: 2,
    name: "Sarah Levy",
    price: 600,
    city: "Jerusalem",
    country: "Israel",
    rating: 4.8,
    categories: ["Theater", "Drama"],
    isFeatured: true,
  },
  {
    id: 3,
    name: "Yossi Mizrachi",
    price: 500,
    city: "Haifa",
    country: "Israel",
    rating: 4.7,
    categories: ["Comedy", "Stand-up"],
    isFeatured: true,
  },
  {
    id: 4,
    name: "Miri Golan",
    price: 700,
    city: "Tel Aviv",
    country: "Israel",
    rating: 4.9,
    categories: ["Dance", "Contemporary"],
    isFeatured: true,
  },
];

export default function FeaturedArtists() {
  const [artists, setArtists] = useState<Artist[]>(sampleArtists);

  return (
    <section className="section bg-white">
      <div className="container-default">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Featured Artists
            </h2>
            <p className="text-slate-600">
              Discover our most popular and highly-rated performers
            </p>
          </div>
          <Link
            href="/artists"
            className="group flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            View all artists
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Artists grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.id}`}
              className="group card card-hover overflow-hidden"
            >
              {/* Image / Avatar */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 flex items-center justify-center overflow-hidden">
                <span className="text-6xl font-bold text-white/40 group-hover:scale-110 transition-transform duration-500">
                  {artist.name.charAt(0)}
                </span>
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
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-medium text-slate-700">{artist.rating}</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {artist.categories.slice(0, 2).map((cat) => (
                    <span key={cat} className="badge-primary text-xs">
                      {cat}
                    </span>
                  ))}
                </div>

                {/* Location & Price */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={14} />
                    <span>{artist.city}</span>
                  </div>
                  <div className="font-semibold text-slate-900">
                    From ${artist.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
