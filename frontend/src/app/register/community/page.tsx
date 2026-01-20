"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, User, Mail, MapPin, Users, Globe, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CommunityRegistrationPage() {
  const { language, isRTL } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    communityName: "",
    location: "",
    audienceSize: "",
    language: "English",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const texts = {
    title: language === 'he' ? 'הרשמת קהילה' : 'Community Registration',
    subtitle: language === 'he' ? 'הצטרפו לקולמבה' : 'Join Kolamba',
    email: language === 'he' ? 'אימייל' : 'Email',
    name: language === 'he' ? 'שם איש קשר' : 'Contact Name',
    communityName: language === 'he' ? 'שם הקהילה' : 'Community Name',
    location: language === 'he' ? 'מיקום' : 'Location',
    audienceSize: language === 'he' ? 'גודל קהילה' : 'Community Size',
    mainLanguage: language === 'he' ? 'שפה עיקרית' : 'Main Language',
    submit: language === 'he' ? 'הרשמה' : 'Register',
    submitting: language === 'he' ? 'נרשם...' : 'Registering...',
    successTitle: language === 'he' ? 'נרשמת בהצלחה!' : 'Registration Successful!',
    successMessage: language === 'he' ? 'תודה שהצטרפת לקולמבה' : 'Thank you for joining Kolamba',
    backToHome: language === 'he' ? 'חזרה לדף הבית' : 'Back to Home',
    login: language === 'he' ? 'התחברות' : 'Login',
    small: language === 'he' ? 'קטן (עד 100)' : 'Small (up to 100)',
    medium: language === 'he' ? 'בינוני (100-500)' : 'Medium (100-500)',
    large: language === 'he' ? 'גדול (500+)' : 'Large (500+)',
    required: language === 'he' ? 'שדה חובה' : 'Required field',
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = texts.required;
    }
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = texts.required;
    }
    if (!formData.communityName || formData.communityName.length < 2) {
      newErrors.communityName = texts.required;
    }
    if (!formData.location || formData.location.length < 3) {
      newErrors.location = texts.required;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">{texts.successTitle}</h1>
          <p className="text-neutral-600 mb-6">{texts.successMessage}</p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
              {texts.login}
            </Link>
            <Link href="/" className="px-6 py-3 text-neutral-600 hover:text-neutral-800 transition-colors">
              {texts.backToHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-brand-gradient p-6 text-white text-center">
            <h1 className="text-2xl font-bold mb-2">{texts.title}</h1>
            <p className="text-white/80">{texts.subtitle}</p>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <Mail className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {texts.email} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-400' : 'border-neutral-300'} focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                  dir="ltr"
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <User className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {texts.name} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-400' : 'border-neutral-300'} focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <Building2 className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {texts.communityName} *
                </label>
                <input
                  type="text"
                  value={formData.communityName}
                  onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.communityName ? 'border-red-400' : 'border-neutral-300'} focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                />
                {errors.communityName && <p className="mt-1 text-sm text-red-500">{errors.communityName}</p>}
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <MapPin className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {texts.location} *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.location ? 'border-red-400' : 'border-neutral-300'} focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                />
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <Users className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {texts.audienceSize}
                </label>
                <select
                  value={formData.audienceSize}
                  onChange={(e) => setFormData({ ...formData, audienceSize: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                >
                  <option value="">{language === 'he' ? 'בחר...' : 'Select...'}</option>
                  <option value="small">{texts.small}</option>
                  <option value="medium">{texts.medium}</option>
                  <option value="large">{texts.large}</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <Globe className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {texts.mainLanguage}
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                >
                  <option value="English">English</option>
                  <option value="Hebrew">עברית</option>
                  <option value="French">Français</option>
                  <option value="Spanish">Español</option>
                  <option value="Russian">Русский</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary-400 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {texts.submitting}
                  </>
                ) : texts.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
