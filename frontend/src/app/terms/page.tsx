"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
  const { t, language, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 mb-8"
        >
          {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          {t.common.back}
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-8">{t.footer.terms}</h1>

          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-600 mb-6">
              {language === 'he'
                ? 'תנאי השימוש באתר קולמבה. עדכון אחרון: ינואר 2026'
                : 'Terms of Service for Kolamba. Last updated: January 2026'}
            </p>

            <h2 className="text-xl font-bold text-neutral-800 mt-8 mb-4">
              {language === 'he' ? '1. קבלת התנאים' : '1. Acceptance of Terms'}
            </h2>
            <p className="text-neutral-600 mb-4">
              {language === 'he'
                ? 'השימוש באתר ובשירותים מהווה הסכמה לתנאים אלה.'
                : 'By using this website and services, you agree to these terms.'}
            </p>

            <h2 className="text-xl font-bold text-neutral-800 mt-8 mb-4">
              {language === 'he' ? '2. השירותים' : '2. Services'}
            </h2>
            <p className="text-neutral-600 mb-4">
              {language === 'he'
                ? 'קולמבה מספקת פלטפורמה לחיבור בין אמנים לקהילות יהודיות.'
                : 'Kolamba provides a platform connecting artists with Jewish communities.'}
            </p>

            <h2 className="text-xl font-bold text-neutral-800 mt-8 mb-4">
              {language === 'he' ? '3. יצירת קשר' : '3. Contact'}
            </h2>
            <p className="text-neutral-600">
              {language === 'he'
                ? `לשאלות בנוגע לתנאי השימוש, צור קשר: ${t.footer.email}`
                : `For questions about these terms, contact: ${t.footer.email}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
