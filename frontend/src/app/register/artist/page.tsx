"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Music, MapPin, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ArtistRegistrationPage() {
  const router = useRouter();
  const { t, language, isRTL } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    category: "",
    city: "",
  });
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: "music", labelHe: "מוזיקה", labelEn: "Music" },
    { value: "dance", labelHe: "ריקוד", labelEn: "Dance" },
    { value: "theater", labelHe: "תיאטרון", labelEn: "Theater" },
    { value: "lectures", labelHe: "הרצאות", labelEn: "Lectures" },
    { value: "workshops", labelHe: "סדנאות", labelEn: "Workshops" },
    { value: "other", labelHe: "אחר", labelEn: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch {
      setError(language === 'he' ? 'שגיאה בהרשמה. נסה שוב.' : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            {language === 'he' ? 'ברוכים הבאים לקולמבה!' : 'Welcome to Kolamba!'}
          </h1>
          <p className="text-neutral-600 mb-6">
            {language === 'he'
              ? 'החשבון שלך נוצר בהצלחה. כעת תוכל להתחיל לבנות את הפרופיל שלך.'
              : 'Your account has been created successfully. You can now start building your profile.'}
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
          >
            {t.auth.login}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-brand-gradient p-6 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">
              {language === 'he' ? 'הרשמה כאמן' : 'Register as Artist'}
            </h1>
            <p className="text-white/80">
              {language === 'he'
                ? 'הצטרף לקולמבה והגע לקהילות יהודיות ברחבי העולם'
                : 'Join Kolamba and reach Jewish communities worldwide'}
            </p>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <User className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {t.auth.name}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === 'he' ? 'השם המלא שלך' : 'Your full name'}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <Mail className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {t.auth.email}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  dir="ltr"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <Lock className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {t.auth.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all pl-12"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <Music className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {language === 'he' ? 'תחום פעילות' : 'Category'}
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                >
                  <option value="">{language === 'he' ? 'בחר תחום' : 'Select category'}</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {language === 'he' ? cat.labelHe : cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <MapPin className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {language === 'he' ? 'עיר' : 'City'}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={language === 'he' ? 'תל אביב' : 'Tel Aviv'}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary-400 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {language === 'he' ? 'נרשם...' : 'Registering...'}
                  </>
                ) : (
                  t.auth.register
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-neutral-600 text-sm mt-6">
              {t.auth.hasAccount}{" "}
              <Link href="/login" className="text-primary-500 hover:underline font-medium">
                {t.auth.login}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
