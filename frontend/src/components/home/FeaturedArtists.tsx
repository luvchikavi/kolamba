"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, DollarSign } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Artist {
  id: number;
  name_he: string;
  name_en: string;
  profile_image?: string;
  price_single: number;
  city: string;
  categories: Array<{ name_he: string; name_en: string; slug: string }>;
}

// Fallback data in case API is unavailable
const fallbackArtists: Artist[] = [
  {
    id: 1,
    name_he: "אבי לבצ'יק",
    name_en: "Avi Luvchik",
    price_single: 800,
    city: "Tel Aviv",
    categories: [{ name_he: "מוסיקה", name_en: "Music", slug: "music" }],
  },
  {
    id: 2,
    name_he: "דוד כהן",
    name_en: "David Cohen",
    price_single: 500,
    city: "Jerusalem",
    categories: [{ name_he: "שירה", name_en: "Singing", slug: "singing" }],
  },
  {
    id: 3,
    name_he: "שרה לוי",
    name_en: "Sarah Levy",
    price_single: 400,
    city: "Haifa",
    categories: [{ name_he: "הרצאה", name_en: "Lecture", slug: "lecture" }],
  },
  {
    id: 4,
    name_he: "יוסי מזרחי",
    name_en: "Yossi Mizrachi",
    price_single: 600,
    city: "Tel Aviv",
    categories: [{ name_he: "קומדיה", name_en: "Comedy", slug: "comedy" }],
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://kolamba-production.up.railway.app";

export default function FeaturedArtists() {
  const { t, language, isRTL } = useLanguage();
  const [artists, setArtists] = useState<Artist[]>(fallbackArtists);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch(`${API_URL}/api/artists/featured?limit=4`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setArtists(data);
          }
        }
      } catch (error) {
        console.log("Using fallback artist data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

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
          {artists.map((artist) => {
            const artistName = language === 'he' ? artist.name_he : artist.name_en;
            const altName = language === 'he' ? artist.name_en : artist.name_he;

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
                        {language === 'he' ? cat.name_he : cat.name_en}
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
                      <span>{t.search.from}{artist.price_single}</span>
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
