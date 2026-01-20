"use client";

import Link from "next/link";
import { Mic2, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { FloatingDots } from "@/components/ui/FloatingDecorations";

export default function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-16 bg-brand-gradient overflow-hidden">
      {/* Floating dots decoration */}
      <FloatingDots count={15} className="opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Artist CTA */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Mic2 size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.cta.artistTitle}</h3>
            <p className="mb-6 text-white/80">
              {t.cta.artistDescription}
            </p>
            <Link
              href="/register/artist"
              className="inline-block px-8 py-3 bg-white text-primary-600 hover:bg-neutral-100 rounded-lg font-semibold transition-colors"
            >
              {t.cta.artistButton}
            </Link>
          </div>

          {/* Community CTA */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Building2 size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.cta.communityTitle}</h3>
            <p className="mb-6 text-white/80">
              {t.cta.communityDescription}
            </p>
            <Link
              href="/register/community"
              className="inline-block px-8 py-3 bg-white text-secondary-600 hover:bg-neutral-100 rounded-lg font-semibold transition-colors"
            >
              {t.cta.communityButton}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
