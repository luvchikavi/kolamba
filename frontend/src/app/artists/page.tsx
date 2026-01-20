"use client";

import Link from "next/link";
import { MapPin, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Mock artists data (will be replaced with API call)
const artists = [
  {
    id: 1,
    nameHe: "דוד כהן",
    nameEn: "David Cohen",
    priceSingle: 500,
    cityHe: "תל אביב",
    cityEn: "Tel Aviv",
    isFeatured: true,
    categories: [
      { nameHe: "שירה", nameEn: "Singing", slug: "singing" },
      { nameHe: "חזנות", nameEn: "Cantorial", slug: "cantorial" }
    ],
  },
  {
    id: 2,
    nameHe: "שרה לוי",
    nameEn: "Sarah Levy",
    priceSingle: 400,
    cityHe: "ירושלים",
    cityEn: "Jerusalem",
    isFeatured: true,
    categories: [{ nameHe: "הרצאה", nameEn: "Lecture", slug: "lecture" }],
  },
  {
    id: 3,
    nameHe: "יוסי מזרחי",
    nameEn: "Yossi Mizrachi",
    priceSingle: 600,
    cityHe: "חיפה",
    cityEn: "Haifa",
    isFeatured: false,
    categories: [
      { nameHe: "קומדיה", nameEn: "Comedy", slug: "comedy" },
      { nameHe: "תיאטרון", nameEn: "Theater", slug: "theater" }
    ],
  },
  {
    id: 4,
    nameHe: "מירי גולן",
    nameEn: "Miri Golan",
    priceSingle: 350,
    cityHe: "תל אביב",
    cityEn: "Tel Aviv",
    isFeatured: false,
    categories: [{ nameHe: "מוסיקה", nameEn: "Music", slug: "music" }],
  },
];

export default function ArtistsPage() {
  const { t, language, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-sm text-neutral-500 mb-4">
            <Link href="/" className="hover:text-primary-500">{t.pages.home}</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-800">{t.artists.title}</span>
          </nav>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">{t.artists.title}</h1>
              <div className="h-0.5 w-24 bg-brand-gradient"></div>
            </div>
            <Link
              href="/search"
              className="px-4 py-2 bg-primary-400 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              {t.search.advancedSearch}
            </Link>
          </div>
        </div>
      </div>

      {/* Artists Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-neutral-600 mb-6">
          {t.pages.found} <span className="font-bold">{artists.length}</span> {t.artists.title.toLowerCase()}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.id}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-100 relative"
            >
              {/* Featured badge */}
              {artist.isFeatured && (
                <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} z-10`}>
                  <span className="px-2 py-1 bg-secondary-400 text-white text-xs rounded-full">
                    {t.pages.featured}
                  </span>
                </div>
              )}

              {/* Image placeholder */}
              <div className="relative aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <span className="text-5xl font-display font-bold text-white/50">
                  {language === 'he' ? artist.nameHe.charAt(0) : artist.nameEn.charAt(0)}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
                  {language === 'he' ? artist.nameHe : artist.nameEn}
                </h3>
                <p className="text-sm text-neutral-500 mb-2">
                  {language === 'he' ? artist.nameEn : artist.nameHe}
                </p>

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

                <div className="flex justify-between items-center text-sm text-neutral-600">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{language === 'he' ? artist.cityHe : artist.cityEn}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    <span>{t.search.from}{artist.priceSingle}</span>
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
