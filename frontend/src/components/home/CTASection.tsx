import Link from "next/link";
import { Mic2, Building2 } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-16 bg-brand-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Artist CTA */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Mic2 size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">אתה אמן?</h3>
            <p className="mb-6 text-white/80">
              הצטרף לפלטפורמה והגיע לקהילות יהודיות ברחבי העולם
            </p>
            <Link
              href="/register/artist"
              className="inline-block px-8 py-3 bg-white text-primary-600 hover:bg-neutral-100 rounded-lg font-semibold transition-colors"
            >
              הצטרף כאמן
            </Link>
          </div>

          {/* Community CTA */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Building2 size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">מייצג קהילה?</h3>
            <p className="mb-6 text-white/80">
              הרשם וגלה אמנים מוכשרים לאירועים בקהילה שלך
            </p>
            <Link
              href="/register/community"
              className="inline-block px-8 py-3 bg-white text-secondary-600 hover:bg-neutral-100 rounded-lg font-semibold transition-colors"
            >
              הרשם כקהילה
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
