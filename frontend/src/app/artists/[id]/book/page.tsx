"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, DollarSign, MessageSquare, CheckCircle } from "lucide-react";

// Mock artist data (will be replaced with API call)
const artist = {
  id: 1,
  nameHe: "דוד כהן",
  nameEn: "David Cohen",
  priceSingle: 500,
  priceTour: 2000,
  categories: [
    { nameHe: "שירה", slug: "singing" },
    { nameHe: "חזנות", slug: "cantorial" },
  ],
};

export default function BookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    requestedDate: "",
    location: "",
    budget: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.requestedDate) {
      newErrors.requestedDate = "נא לבחור תאריך";
    } else {
      const selectedDate = new Date(formData.requestedDate);
      if (selectedDate <= new Date()) {
        newErrors.requestedDate = "נא לבחור תאריך עתידי";
      }
    }

    if (!formData.location || formData.location.length < 3) {
      newErrors.location = "נא להזין מיקום (לפחות 3 תווים)";
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      newErrors.budget = "נא להזין מספר חיובי";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            הבקשה נשלחה בהצלחה!
          </h1>
          <p className="text-neutral-600 mb-6">
            האמן {artist.nameHe} יקבל את בקשתך ויחזור אליך בהקדם.
          </p>
          <p className="text-sm text-neutral-500 mb-8">
            מספר בקשה: #
            {Math.random().toString(36).substring(2, 8).toUpperCase()}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/artists"
              className="px-6 py-3 bg-primary-400 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              חזור לרשימת האמנים
            </Link>
            <Link
              href="/"
              className="px-6 py-3 text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              חזור לדף הבית
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-neutral-500">
            <Link href="/" className="hover:text-primary-500">
              דף הבית
            </Link>
            <span className="mx-2">/</span>
            <Link href="/artists" className="hover:text-primary-500">
              אמנים
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/artists/${params.id}`}
              className="hover:text-primary-500"
            >
              {artist.nameHe}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-neutral-800">הזמנה</span>
          </nav>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-brand-gradient p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">שליחת בקשת הזמנה</h1>
            <p className="text-white/80">מלא את הפרטים ונחזור אליך בהקדם</p>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Artist Summary */}
              <div className="md:w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <div className="aspect-square rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center mb-4">
                    <span className="text-5xl font-display font-bold text-white/50">
                      {artist.nameHe.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-bold text-neutral-800">{artist.nameHe}</h3>
                  <p className="text-sm text-neutral-500 mb-3">{artist.nameEn}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {artist.categories.map((cat) => (
                      <span
                        key={cat.slug}
                        className="px-2 py-0.5 text-xs bg-primary-50 text-primary-600 rounded-full"
                      >
                        {cat.nameHe}
                      </span>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">הופעה בודדת</span>
                      <span className="font-medium">${artist.priceSingle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">סבב הופעות</span>
                      <span className="font-medium">${artist.priceTour}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 space-y-6">
                {/* Date */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-2">
                    <Calendar className="inline-block ml-2" size={18} />
                    תאריך מבוקש *
                  </label>
                  <input
                    type="date"
                    value={formData.requestedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, requestedDate: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.requestedDate
                        ? "border-red-400 focus:ring-red-200"
                        : "border-neutral-300 focus:ring-primary-200"
                    } focus:border-primary-400 focus:ring-2 outline-none transition-all`}
                  />
                  {errors.requestedDate && (
                    <p className="mt-1 text-sm text-red-500">{errors.requestedDate}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-2">
                    <MapPin className="inline-block ml-2" size={18} />
                    מיקום ההופעה *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="לדוגמה: New York, NY"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.location
                        ? "border-red-400 focus:ring-red-200"
                        : "border-neutral-300 focus:ring-primary-200"
                    } focus:border-primary-400 focus:ring-2 outline-none transition-all`}
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                {/* Budget */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-2">
                    <DollarSign className="inline-block ml-2" size={18} />
                    תקציב משוער (USD)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    placeholder="לדוגמה: 500"
                    min="0"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.budget
                        ? "border-red-400 focus:ring-red-200"
                        : "border-neutral-300 focus:ring-primary-200"
                    } focus:border-primary-400 focus:ring-2 outline-none transition-all`}
                  />
                  {errors.budget && (
                    <p className="mt-1 text-sm text-red-500">{errors.budget}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-2">
                    <MessageSquare className="inline-block ml-2" size={18} />
                    פרטים נוספים
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="ספר על הקהילה שלך, סוג האירוע, ציפיות מיוחדות..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-primary-400 hover:bg-primary-600 disabled:bg-primary-300 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      שולח...
                    </>
                  ) : (
                    "שלח בקשה"
                  )}
                </button>

                <p className="text-sm text-neutral-500 text-center">
                  בלחיצה על &quot;שלח בקשה&quot; אתה מסכים ל
                  <Link href="/terms" className="text-primary-500 hover:underline">
                    תנאי השימוש
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
