"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Globe, Users, Music } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { t, language, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-brand-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">{t.footer.about}</h1>
          <p className="text-xl text-white/80">{t.brand.tagline}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-8"
        >
          {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          {t.common.back}
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
              {language === 'he' ? 'מי אנחנו' : 'Who We Are'}
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              {t.brand.description}
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-neutral-50 rounded-lg">
              <Globe className="mx-auto text-primary-500 mb-3" size={40} />
              <h3 className="font-bold text-neutral-800">
                {language === 'he' ? 'קהילות ברחבי העולם' : 'Communities Worldwide'}
              </h3>
              <p className="text-sm text-neutral-500 mt-2">
                {language === 'he' ? 'מחברים קהילות יהודיות בכל רחבי העולם' : 'Connecting Jewish communities globally'}
              </p>
            </div>
            <div className="text-center p-6 bg-neutral-50 rounded-lg">
              <Music className="mx-auto text-secondary-500 mb-3" size={40} />
              <h3 className="font-bold text-neutral-800">
                {language === 'he' ? 'אמנים מוכשרים' : 'Talented Artists'}
              </h3>
              <p className="text-sm text-neutral-500 mt-2">
                {language === 'he' ? 'מאות אמנים ישראלים ויהודים' : 'Hundreds of Israeli and Jewish artists'}
              </p>
            </div>
            <div className="text-center p-6 bg-neutral-50 rounded-lg">
              <Users className="mx-auto text-primary-500 mb-3" size={40} />
              <h3 className="font-bold text-neutral-800">
                {language === 'he' ? 'חיבורים' : 'Connections'}
              </h3>
              <p className="text-sm text-neutral-500 mt-2">
                {language === 'he' ? 'יצירת קשרים בין תרבויות' : 'Creating cultural bridges'}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
              {language === 'he' ? 'צור קשר' : 'Contact Us'}
            </h2>
            <p className="text-neutral-600">
              {t.footer.email}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
