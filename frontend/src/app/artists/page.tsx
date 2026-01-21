"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Star, Search, Filter, ChevronDown } from "lucide-react";

interface Artist {
  id: number;
  name: string;
  price: number;
  city: string;
  country: string;
  rating: number;
  isFeatured: boolean;
  categories: { name: string; slug: string }[];
}

// Sample artists data
const artists: Artist[] = [
  {
    id: 1,
    name: "David Cohen",
    price: 800,
    city: "Tel Aviv",
    country: "Israel",
    rating: 4.9,
    isFeatured: true,
    categories: [
      { name: "Music", slug: "music" },
      { name: "Cantorial", slug: "cantorial" },
    ],
  },
  {
    id: 2,
    name: "Sarah Levy",
    price: 600,
    city: "Jerusalem",
    country: "Israel",
    rating: 4.8,
    isFeatured: true,
    categories: [{ name: "Theater", slug: "theater" }],
  },
  {
    id: 3,
    name: "Yossi Mizrachi",
    price: 500,
    city: "Haifa",
    country: "Israel",
    rating: 4.7,
    isFeatured: false,
    categories: [
      { name: "Comedy", slug: "comedy" },
      { name: "Stand-up", slug: "standup" },
    ],
  },
  {
    id: 4,
    name: "Miri Golan",
    price: 700,
    city: "Tel Aviv",
    country: "Israel",
    rating: 4.9,
    isFeatured: true,
    categories: [{ name: "Dance", slug: "dance" }],
  },
  {
    id: 5,
    name: "Avi Ben-David",
    price: 450,
    city: "Be'er Sheva",
    country: "Israel",
    rating: 4.6,
    isFeatured: false,
    categories: [{ name: "Lectures", slug: "lectures" }],
  },
  {
    id: 6,
    name: "Rachel Singer",
    price: 550,
    city: "Netanya",
    country: "Israel",
    rating: 4.8,
    isFeatured: false,
    categories: [
      { name: "Music", slug: "music" },
      { name: "Workshops", slug: "workshops" },
    ],
  },
  {
    id: 7,
    name: "Michael Stern",
    price: 900,
    city: "Tel Aviv",
    country: "Israel",
    rating: 5.0,
    isFeatured: true,
    categories: [{ name: "Film", slug: "film" }],
  },
  {
    id: 8,
    name: "Noa Shapiro",
    price: 400,
    city: "Eilat",
    country: "Israel",
    rating: 4.5,
    isFeatured: false,
    categories: [{ name: "Visual Arts", slug: "visual-arts" }],
  },
];

export default function ArtistsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <span className="text-slate-900 font-medium">Artists</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                Browse Artists
              </h1>
              <p className="text-slate-600">
                Discover talented Israeli artists for your community events
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
                  placeholder="Search artists..."
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
        <p className="text-slate-600 mb-6">
          Found <span className="font-semibold text-slate-900">{filteredArtists.length}</span> artists
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredArtists.map((artist) => (
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
                    <span className="text-sm font-medium text-slate-700">
                      {artist.rating}
                    </span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {artist.categories.slice(0, 2).map((cat) => (
                    <span key={cat.slug} className="badge-primary text-xs">
                      {cat.name}
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
    </div>
  );
}
