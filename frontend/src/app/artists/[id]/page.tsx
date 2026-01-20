import Link from "next/link";
import { MapPin, Globe, DollarSign, Calendar, MessageSquare } from "lucide-react";

// Mock artist data (will be replaced with API call)
const artist = {
  id: 1,
  nameHe: "דוד כהן",
  nameEn: "David Cohen",
  bioHe: "זמר וחזן עם 20 שנות ניסיון בהופעות בקהילות יהודיות ברחבי העולם. מתמחה בשירה ליטורגית, פיוטים מזרחיים ומופעים משפחתיים. הופיע במאות קהילות בארה״ב, אירופה ואוסטרליה.",
  bioEn: "Singer and cantor with 20 years of experience performing at Jewish communities worldwide. Specializes in liturgical singing, Mizrahi piyyutim, and family performances. Has performed at hundreds of communities in the US, Europe, and Australia.",
  profileImage: null,
  priceSingle: 500,
  priceTour: 2000,
  languages: ["Hebrew", "English", "Yiddish"],
  city: "תל אביב",
  country: "Israel",
  isFeatured: true,
  categories: [
    { nameHe: "שירה", nameEn: "Singing", slug: "singing" },
    { nameHe: "חזנות", nameEn: "Cantorial", slug: "cantorial" },
  ],
  availability: {
    "2026-03": true,
    "2026-04": true,
    "2026-06": true,
    "2026-07": true,
  },
};

export default function ArtistProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-neutral-500">
            <Link href="/" className="hover:text-primary-500">דף הבית</Link>
            <span className="mx-2">/</span>
            <Link href="/artists" className="hover:text-primary-500">אמנים</Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-800">{artist.nameHe}</span>
          </nav>
        </div>
      </div>

      {/* Artist Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            <div className="md:w-72 flex-shrink-0">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center shadow-lg">
                <span className="text-8xl font-display font-bold text-white/50">
                  {artist.nameHe.charAt(0)}
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  {artist.isFeatured && (
                    <span className="inline-block px-3 py-1 bg-secondary-400 text-white text-sm rounded-full mb-3">
                      אמן מומלץ
                    </span>
                  )}
                  <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-1">
                    {artist.nameHe}
                  </h1>
                  <p className="text-xl text-neutral-500 mb-4">{artist.nameEn}</p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {artist.categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/search?category=${cat.slug}`}
                        className="px-3 py-1 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-full text-sm transition-colors"
                      >
                        {cat.nameHe}
                      </Link>
                    ))}
                  </div>

                  {/* Location & Languages */}
                  <div className="flex flex-wrap gap-4 text-neutral-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={18} />
                      <span>{artist.city}, {artist.country}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe size={18} />
                      <span>{artist.languages.join(", ")}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button (Desktop) */}
                <Link
                  href={`/artists/${artist.id}/book`}
                  className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <MessageSquare size={20} />
                  יצירת קשר
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-neutral-800 mb-4">אודות</h2>
              <div className="h-0.5 w-16 bg-brand-gradient mb-4"></div>
              <p className="text-neutral-700 leading-relaxed mb-4">{artist.bioHe}</p>
              <p className="text-neutral-600 text-sm leading-relaxed">{artist.bioEn}</p>
            </section>

            {/* Performance Types */}
            <section className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-neutral-800 mb-4">סוגי הופעות</h2>
              <div className="h-0.5 w-16 bg-brand-gradient mb-4"></div>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                  הופעות שירה וחזנות
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                  הרצאות על מסורת יהודית
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                  סדנאות פיוט
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                  מופעים משפחתיים
                </li>
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-neutral-800 mb-4">מחירים</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-neutral-600">הופעה בודדת</span>
                  <span className="font-bold text-lg">${artist.priceSingle}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-neutral-600">סבב הופעות</span>
                  <span className="font-bold text-lg">${artist.priceTour}</span>
                </div>
              </div>
              <p className="text-sm text-neutral-500 mt-4">
                * מחירים משוערים, ניתן למשא ומתן
              </p>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-neutral-800 mb-4">זמינות</h3>
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <Calendar size={18} />
                <span className="font-medium">זמין לטורים</span>
              </div>
              <div className="text-sm text-neutral-600">
                <p className="mb-1">תקופות זמינות:</p>
                <ul className="space-y-1">
                  <li>• מרץ-אפריל 2026</li>
                  <li>• יוני-יולי 2026</li>
                </ul>
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/artists/${artist.id}/book`}
              className="block w-full text-center px-6 py-4 bg-primary-400 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors shadow-lg"
            >
              שלח בקשת הזמנה
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <Link
          href={`/artists/${artist.id}/book`}
          className="block w-full text-center px-6 py-4 bg-primary-400 hover:bg-primary-600 text-white rounded-xl font-semibold"
        >
          שלח בקשת הזמנה
        </Link>
      </div>
    </div>
  );
}
