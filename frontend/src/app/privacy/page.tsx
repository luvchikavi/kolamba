"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-neutral-800 mb-8">{t.footer.privacy}</h1>

          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-600 mb-6">
              {language === 'he'
                ? 'מדיניות הפרטיות של קולמבה. עדכון אחרון: ינואר 2026'
                : 'Privacy Policy for Kolamba. Last updated: January 2026'}
            </p>

            <h2 className="text-xl font-bold text-neutral-800 mt-8 mb-4">
              {language === 'he' ? '1. מידע שאנו אוספים' : '1. Information We Collect'}
            </h2>
            <p className="text-neutral-600 mb-4">
              {language === 'he'
                ? 'אנו אוספים מידע שאתם מספקים ישירות, כגון שם, אימייל ופרטי קשר.'
                : 'We collect information you provide directly, such as name, email, and contact details.'}
            </p>

            <h2 className="text-xl font-bold text-neutral-800 mt-8 mb-4">
              {language === 'he' ? '2. שימוש במידע' : '2. Use of Information'}
            </h2>
            <p className="text-neutral-600 mb-4">
              {language === 'he'
                ? 'המידע משמש לתפעול השירות, יצירת קשר וחיבור בין אמנים לקהילות.'
                : 'Information is used to operate the service, contact you, and connect artists with communities.'}
            </p>

            <h2 className="text-xl font-bold text-neutral-800 mt-8 mb-4">
              {language === 'he' ? '3. אבטחת מידע' : '3. Data Security'}
            </h2>
            <p className="text-neutral-600 mb-4">
              {language === 'he'
                ? 'אנו נוקטים באמצעי אבטחה מתאימים להגנה על המידע שלכם.'
                : 'We implement appropriate security measures to protect your information.'}
            </p>

            <h2 className="text-xl font-bold text-neutral-800 mt-8 mb-4">
              {language === 'he' ? '4. יצירת קשר' : '4. Contact'}
            </h2>
            <p className="text-neutral-600">
              {language === 'he'
                ? `לשאלות בנוגע למדיניות הפרטיות, צור קשר: ${t.footer.email}`
                : `For privacy inquiries, contact: ${t.footer.email}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
