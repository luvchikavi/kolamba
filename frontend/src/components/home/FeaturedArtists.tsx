"use client";

import Link from "next/link";
import { MapPin, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Placeholder data - will be replaced with API call
const featuredArtists = [
  {
    id: 1,
    nameHe: "דוד כהן",
    nameEn: "David Cohen",
    profileImage: null,
    priceSingle: 500,
    cityHe: "תל אביב",
    cityEn: "Tel Aviv",
    categories: [
      { nameHe: "שירה", nameEn: "Singing", slug: "singing" },
      { nameHe: "חזנות", nameEn: "Cantorial", slug: "cantorial" },
    ],
  },
  {
    id: 2,
    nameHe: "שרה לוי",
    nameEn: "Sarah Levy",
    profileImage: null,
    priceSingle: 400,
    cityHe: "ירושלים",
    cityEn: "Jerusalem",
    categories: [{ nameHe: "הרצאה", nameEn: "Lecture", slug: "lecture" }],
  },
  {
    id: 3,
    nameHe: "יוסי מזרחי",
    nameEn: "Yossi Mizrachi",
    profileImage: null,
    priceSingle: 600,
    cityHe: "חיפה",
    cityEn: "Haifa",
    categories: [
      { nameHe: "קומדיה", nameEn: "Comedy", slug: "comedy" },
      { nameHe: "תיאטרון", nameEn: "Theater", slug: "theater" },
    ],
  },
  {
    id: 4,
    nameHe: "מירי גולן",
    nameEn: "Miri Golan",
    profileImage: null,
    priceSingle: 350,
    cityHe: "תל אביב",
    cityEn: "Tel Aviv",
    categories: [{ nameHe: "מוסיקה", nameEn: "Music", slug: "music" }],
  },
];

export default function FeaturedArtists() {
  const { t, language, isRTL } = useLanguage();

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">
              {t.artists.featured}
            </h2>
            <div className="h-0.5 w-32 bg-brand-gradient"></div>
          </div>
          <Link
            href="/artists"
            className="hidden sm:block text-primary-500 hover:text-primary-600 font-medium"
          >
            {t.artists.all} {isRTL ? '←' : '→'}
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArtists.map((artist) => {
            const artistName = language === 'he' ? artist.nameHe : artist.nameEn;
            const altName = language === 'he' ? artist.nameEn : artist.nameHe;
            const city = language === 'he' ? artist.cityHe : artist.cityEn;

            return (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-100"
              >
                {/* Image placeholder */}
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                  <span className="text-5xl font-display font-bold text-white/50">
                    {artistName.charAt(0)}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
                    {artistName}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-2">{altName}</p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {artist.categories.map((cat) => (
                      <span
                        key={cat.slug}
                        className="px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-full"
                      >
                        {language === 'he' ? cat.nameHe : cat.nameEn}
                      </span>
                    ))}
                  </div>

                  {/* Location & Price */}
                  <div className="flex justify-between items-center text-sm text-neutral-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} />
                      <span>{t.search.from}{artist.priceSingle}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/artists"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            {t.artists.all} {isRTL ? '←' : '→'}
          </Link>
        </div>
      </div>
    </section>
  );
}
