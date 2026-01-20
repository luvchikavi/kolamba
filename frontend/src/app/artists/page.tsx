import Link from "next/link";
import { MapPin, DollarSign } from "lucide-react";

// Mock artists data (will be replaced with API call)
const artists = [
  {
    id: 1,
    nameHe: "דוד כהן",
    nameEn: "David Cohen",
    priceSingle: 500,
    city: "תל אביב",
    isFeatured: true,
    categories: [{ nameHe: "שירה", slug: "singing" }, { nameHe: "חזנות", slug: "cantorial" }],
  },
  {
    id: 2,
    nameHe: "שרה לוי",
    nameEn: "Sarah Levy",
    priceSingle: 400,
    city: "ירושלים",
    isFeatured: true,
    categories: [{ nameHe: "הרצאה", slug: "lecture" }],
  },
  {
    id: 3,
    nameHe: "יוסי מזרחי",
    nameEn: "Yossi Mizrachi",
    priceSingle: 600,
    city: "חיפה",
    isFeatured: false,
    categories: [{ nameHe: "קומדיה", slug: "comedy" }, { nameHe: "תיאטרון", slug: "theater" }],
  },
  {
    id: 4,
    nameHe: "מירי גולן",
    nameEn: "Miri Golan",
    priceSingle: 350,
    city: "תל אביב",
    isFeatured: false,
    categories: [{ nameHe: "מוסיקה", slug: "music" }],
  },
];

export default function ArtistsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="text-sm text-neutral-500 mb-4">
            <Link href="/" className="hover:text-primary-500">דף הבית</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-800">אמנים</span>
          </nav>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">אמנים</h1>
              <div className="h-0.5 w-24 bg-brand-gradient"></div>
            </div>
            <Link
              href="/search"
              className="px-4 py-2 bg-primary-400 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              חיפוש מתקדם
            </Link>
          </div>
        </div>
      </div>

      {/* Artists Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-neutral-600 mb-6">
          נמצאו <span className="font-bold">{artists.length}</span> אמנים
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.id}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-neutral-100"
            >
              {/* Featured badge */}
              {artist.isFeatured && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-1 bg-secondary-400 text-white text-xs rounded-full">
                    מומלץ
                  </span>
                </div>
              )}

              {/* Image placeholder */}
              <div className="relative aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <span className="text-5xl font-display font-bold text-white/50">
                  {artist.nameHe.charAt(0)}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-neutral-800 group-hover:text-primary-600 transition-colors">
                  {artist.nameHe}
                </h3>
                <p className="text-sm text-neutral-500 mb-2">{artist.nameEn}</p>

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
      </div>
    </div>
  );
}
