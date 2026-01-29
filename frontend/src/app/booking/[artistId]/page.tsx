"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Calendar, DollarSign, MapPin, Users, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";

interface ArtistInfo {
  id: number;
  name_en: string;
  name_he: string;
  categories: { name_en: string }[];
}

const eventTypes = [
  "Concert",
  "Workshop",
  "Lecture",
  "Performance",
  "Holiday Celebration",
  "Shabbat Service",
  "Educational Program",
  "Family Event",
  "Youth Program",
  "Other",
];

const venueTypes = [
  "Indoor Theater",
  "Outdoor Venue",
  "Community Hall",
  "Synagogue",
  "School Auditorium",
  "Private Venue",
  "Other",
];

interface BookingData {
  eventType: string;
  eventDescription: string;
  date: string;
  flexibleDates: boolean;
  alternateDate: string;
  budget: string;
  venueType: string;
  venueCapacity: string;
  venueAddress: string;
  specialRequirements: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  communityName: string;
}

const steps = [
  { number: 1, title: "Event Type" },
  { number: 2, title: "Select A Date" },
  { number: 3, title: "Budget & Venue" },
  { number: 4, title: "Review And Submit" },
];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const artistId = params.artistId as string;

  const [artist, setArtist] = useState<{ name: string; category: string }>({ name: "Loading...", category: "" });
  const [isLoadingArtist, setIsLoadingArtist] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
                const response = await fetch(`${API_URL}/artists/${artistId}`);
        if (response.ok) {
          const data: ArtistInfo = await response.json();
          setArtist({
            name: data.name_en || data.name_he,
            category: data.categories?.[0]?.name_en || "Performance",
          });
        }
      } catch (error) {
        console.error("Failed to fetch artist:", error);
      } finally {
        setIsLoadingArtist(false);
      }
    };
    fetchArtist();
  }, [artistId]);

  const [bookingData, setBookingData] = useState<BookingData>({
    eventType: "",
    eventDescription: "",
    date: "",
    flexibleDates: false,
    alternateDate: "",
    budget: "",
    venueType: "",
    venueCapacity: "",
    venueAddress: "",
    specialRequirements: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    communityName: "",
  });

  const updateBookingData = (field: keyof BookingData, value: string | boolean) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
            const token = localStorage.getItem("access_token");

      // Parse budget to get a numeric value
      let budgetValue: number | undefined;
      if (bookingData.budget) {
        const budgetMatch = bookingData.budget.match(/\d+/);
        if (budgetMatch) {
          budgetValue = parseInt(budgetMatch[0], 10);
        }
      }

      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          artist_id: parseInt(artistId, 10),
          requested_date: bookingData.date || null,
          location: bookingData.venueAddress || null,
          budget: budgetValue || null,
          notes: [
            `Event Type: ${bookingData.eventType}`,
            bookingData.eventDescription ? `Description: ${bookingData.eventDescription}` : "",
            `Venue: ${bookingData.venueType}`,
            bookingData.venueCapacity ? `Capacity: ${bookingData.venueCapacity}` : "",
            bookingData.flexibleDates && bookingData.alternateDate ? `Alternate Date: ${bookingData.alternateDate}` : "",
            bookingData.specialRequirements ? `Special Requirements: ${bookingData.specialRequirements}` : "",
            `Contact: ${bookingData.contactName} (${bookingData.contactEmail})`,
            bookingData.contactPhone ? `Phone: ${bookingData.contactPhone}` : "",
            bookingData.communityName ? `Organization: ${bookingData.communityName}` : "",
          ].filter(Boolean).join("\n"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit booking request");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Booking submission failed:", error);
      setSubmitError("Failed to submit booking request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-teal-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Quote Request Sent!</h1>
          <p className="text-slate-600 mb-8">
            Thank you for your interest in booking {artist.name}. We&apos;ll review your request and get back to you within 48 hours.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/community"
              className="px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link href="/artists" className="text-slate-600 hover:text-slate-800 transition-colors">
              Browse More Artists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-slate-900">
              KOLAMBA
            </Link>
            <span className="text-slate-600">GET A QUOTE FOR <strong>{artist.name.toUpperCase()}</strong></span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-4">
              HELPING YOU GET<br />THE BEST TALENTS<br />FROM ISRAEL
            </h1>
          </div>

          {/* Steps Indicator */}
          <div className="flex justify-end mb-8">
            <div className="flex flex-col gap-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`flex items-center gap-3 ${
                    currentStep === step.number ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  <span className="text-lg font-medium">
                    {step.number} | {step.title}
                  </span>
                  {currentStep > step.number && (
                    <Check size={18} className="text-teal-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Steps */}
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            {/* Step 1: Event Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">What type of event are you planning?</h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateBookingData("eventType", type)}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        bookingData.eventType === type
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tell us more about your event (optional)
                  </label>
                  <textarea
                    value={bookingData.eventDescription}
                    onChange={(e) => updateBookingData("eventDescription", e.target.value)}
                    rows={4}
                    placeholder="Describe your event, audience, and any special requirements..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Select Date */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">When would you like to host the event?</h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => updateBookingData("date", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="flexibleDates"
                    checked={bookingData.flexibleDates}
                    onChange={(e) => updateBookingData("flexibleDates", e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                  />
                  <label htmlFor="flexibleDates" className="text-slate-700">
                    I&apos;m flexible with dates
                  </label>
                </div>

                {bookingData.flexibleDates && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Alternative Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.alternateDate}
                      onChange={(e) => updateBookingData("alternateDate", e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Budget & Venue */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Budget & Venue Details</h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <DollarSign size={16} className="inline mr-2" />
                    Event Budget (USD)
                  </label>
                  <select
                    value={bookingData.budget}
                    onChange={(e) => updateBookingData("budget", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select budget range</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-2500">$1,000 - $2,500</option>
                    <option value="2500-5000">$2,500 - $5,000</option>
                    <option value="5000-10000">$5,000 - $10,000</option>
                    <option value="10000+">$10,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Venue Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {venueTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateBookingData("venueType", type)}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          bookingData.venueType === type
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Users size={16} className="inline mr-2" />
                    Expected Audience Size
                  </label>
                  <input
                    type="text"
                    value={bookingData.venueCapacity}
                    onChange={(e) => updateBookingData("venueCapacity", e.target.value)}
                    placeholder="e.g., 150-200 people"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Venue Location
                  </label>
                  <input
                    type="text"
                    value={bookingData.venueAddress}
                    onChange={(e) => updateBookingData("venueAddress", e.target.value)}
                    placeholder="City, State/Country"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Review & Submit</h2>

                {/* Summary */}
                <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-slate-900">Booking Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Artist</p>
                      <p className="font-medium">{artist.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Event Type</p>
                      <p className="font-medium">{bookingData.eventType || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Date</p>
                      <p className="font-medium">{bookingData.date || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Budget</p>
                      <p className="font-medium">{bookingData.budget || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Venue Type</p>
                      <p className="font-medium">{bookingData.venueType || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Location</p>
                      <p className="font-medium">{bookingData.venueAddress || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Your Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingData.contactName}
                        onChange={(e) => updateBookingData("contactName", e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Community/Organization Name
                      </label>
                      <input
                        type="text"
                        value={bookingData.communityName}
                        onChange={(e) => updateBookingData("communityName", e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={bookingData.contactEmail}
                        onChange={(e) => updateBookingData("contactEmail", e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={bookingData.contactPhone}
                        onChange={(e) => updateBookingData("contactPhone", e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Special Requirements or Notes
                  </label>
                  <textarea
                    value={bookingData.specialRequirements}
                    onChange={(e) => updateBookingData("specialRequirements", e.target.value)}
                    rows={3}
                    placeholder="Any additional information..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {submitError}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors"
                >
                  Continue
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !bookingData.contactName || !bookingData.contactEmail}
                  className="px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quote Request"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
