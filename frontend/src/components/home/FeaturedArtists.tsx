"use client";

import Link from "next/link";
import { MapPin, DollarSign } from "lucide-react";

// Placeholder data - will be replaced with API call
const featuredArtists = [
  {
    id: 1,
    nameHe: "דוד כהן",
    nameEn: "David Cohen",
    profileImage: null,
    priceSingle: 500,
    city: "תל אביב",
    categories: [{ nameHe: "שירה", slug: "singing" }, { nameHe: "חזנות", slug: "cantorial" }],
  },
  {
    id: 2,
    nameHe: "שרה לוי",
    nameEn: "Sarah Levy",
    profileImage: null,
    priceSingle: 400,
    city: "ירושלים",
    categories: [{ nameHe: "הרצאה", slug: "lecture" }],
  },
  {
    id: 3,
    nameHe: "יוסי מזרחי",
    nameEn: "Yossi Mizrachi",
    profileImage: null,
    priceSingle: 600,
    city: "חיפה",
    categories: [{ nameHe: "קומדיה", slug: "comedy" }, { nameHe: "תיאטרון", slug: "theater" }],
  },
  {
    id: 4,
    nameHe: "מירי גולן",
    nameEn: "Miri Golan",
    profileImage: null,
    priceSingle: 350,
    city: "תל אביב",
    categories: [{ nameHe: "מוסיקה", slug: "music" }],
  },
];

export default function FeaturedArtists() {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
              אמנים מומלצים
            </h2>
            <div className="h-0.5 w-32 bg-brand-gradient"></div>
          </div>
          <Link
            href="/artists"
            className="hidden sm:block text-primary-500 hover:text-primary-600 font-medium"
          >
            לכל האמנים ←
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArtists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.id}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-100"
            >
              {/* Image placeholder */}
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <span className="text-5xl font-display font-bold text-white/50">
                  {artist.nameHe.charAt(0)}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
                  {artist.nameHe}
                </h3>
                <p className="text-sm text-neutral-500 mb-2">{artist.nameEn}</p>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {artist.categories.map((cat) => (
                    <span
                      key={cat.slug}
                      className="px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-full"
                    >
                      {cat.nameHe}
                    </span>
                  ))}
                </div>

                {/* Location & Price */}
                <div className="flex justify-between items-center text-sm text-neutral-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{artist.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    <span>מ-${artist.priceSingle}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/artists"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            לכל האמנים ←
          </Link>
        </div>
      </div>
    </section>
  );
}
