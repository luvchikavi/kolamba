"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, DollarSign, MessageSquare, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function BookingPage({ params }: { params: { id: string } }) {
  const { language, isRTL } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    requestedDate: "",
    location: "",
    budget: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const texts = {
    title: language === 'he' ? 'שליחת בקשת הזמנה' : 'Send Booking Request',
    subtitle: language === 'he' ? 'מלא את הפרטים ונחזור אליך בהקדם' : 'Fill in the details and we\'ll get back to you soon',
    date: language === 'he' ? 'תאריך מבוקש' : 'Requested Date',
    location: language === 'he' ? 'מיקום ההופעה' : 'Performance Location',
    budget: language === 'he' ? 'תקציב משוער (USD)' : 'Estimated Budget (USD)',
    notes: language === 'he' ? 'פרטים נוספים' : 'Additional Details',
    submit: language === 'he' ? 'שלח בקשה' : 'Send Request',
    submitting: language === 'he' ? 'שולח...' : 'Sending...',
    successTitle: language === 'he' ? 'הבקשה נשלחה בהצלחה!' : 'Request Sent Successfully!',
    successMessage: language === 'he' ? 'האמן יקבל את בקשתך ויחזור אליך בהקדם.' : 'The artist will receive your request and get back to you soon.',
    requestNumber: language === 'he' ? 'מספר בקשה' : 'Request Number',
    backToArtists: language === 'he' ? 'חזור לרשימת האמנים' : 'Back to Artists',
    backToHome: language === 'he' ? 'חזור לדף הבית' : 'Back to Home',
    dateRequired: language === 'he' ? 'נא לבחור תאריך' : 'Please select a date',
    dateFuture: language === 'he' ? 'נא לבחור תאריך עתידי' : 'Please select a future date',
    locationRequired: language === 'he' ? 'נא להזין מיקום' : 'Please enter location',
    locationPlaceholder: language === 'he' ? 'עיר, מדינה' : 'City, Country',
    budgetPlaceholder: language === 'he' ? 'הזן סכום' : 'Enter amount',
    notesPlaceholder: language === 'he' ? 'ספר על הקהילה שלך, סוג האירוע...' : 'Tell us about your community, event type...',
    termsPrefix: language === 'he' ? 'בלחיצה על "שלח בקשה" אתה מסכים ל' : 'By clicking "Send Request" you agree to the',
    termsLink: language === 'he' ? 'תנאי השימוש' : 'Terms of Service',
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.requestedDate) {
      newErrors.requestedDate = texts.dateRequired;
    } else {
      const selectedDate = new Date(formData.requestedDate);
      if (selectedDate <= new Date()) {
        newErrors.requestedDate = texts.dateFuture;
      }
    }
    if (!formData.location || formData.location.length < 3) {
      newErrors.location = texts.locationRequired;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://kolamba-production.up.railway.app"}/api/bookings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artist_id: parseInt(params.id),
            requested_date: formData.requestedDate || null,
            location: formData.location,
            budget: formData.budget ? parseInt(formData.budget) : null,
            notes: formData.notes || null,
          }),
        }
      );
      if (!response.ok) throw new Error("Booking request failed");
      setIsSubmitted(true);
    } catch {
      setErrors({ submit: language === 'he' ? 'שגיאה בשליחה' : 'Error sending request' });
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="text-sm text-neutral-500 mb-8">
            {texts.requestNumber} #{Math.random().toString(36).substring(2, 8).toUpperCase()}
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/artists" className="px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
              {texts.backToArtists}
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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-brand-gradient p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">{texts.title}</h1>
            <p className="text-white/80">{texts.subtitle}</p>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <Calendar className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {texts.date} *
                </label>
                <input
                  type="date"
                  value={formData.requestedDate}
                  onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.requestedDate ? 'border-red-400' : 'border-neutral-300'} focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                />
                {errors.requestedDate && <p className="mt-1 text-sm text-red-500">{errors.requestedDate}</p>}
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
                  placeholder={texts.locationPlaceholder}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.location ? 'border-red-400' : 'border-neutral-300'} focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all`}
                />
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <DollarSign className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {texts.budget}
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder={texts.budgetPlaceholder}
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-2">
                  <MessageSquare className={`inline-block ${isRTL ? 'ml-2' : 'mr-2'}`} size={18} />
                  {texts.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={texts.notesPlaceholder}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                />
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-400 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {texts.submitting}
                  </>
                ) : texts.submit}
              </button>

              <p className="text-sm text-neutral-500 text-center">
                {texts.termsPrefix}{' '}
                <Link href="/terms" className="text-primary-500 hover:underline">{texts.termsLink}</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
