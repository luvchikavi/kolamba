"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Calendar, DollarSign, MapPin, Users, Loader2, ChevronDown } from "lucide-react";
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

const countryCodes = [
  { code: "+1", label: "US/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+972", label: "Israel (+972)" },
  { code: "+33", label: "France (+33)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+34", label: "Spain (+34)" },
  { code: "+39", label: "Italy (+39)" },
  { code: "+31", label: "Netherlands (+31)" },
  { code: "+32", label: "Belgium (+32)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+43", label: "Austria (+43)" },
  { code: "+46", label: "Sweden (+46)" },
  { code: "+47", label: "Norway (+47)" },
  { code: "+45", label: "Denmark (+45)" },
  { code: "+7", label: "Russia (+7)" },
  { code: "+54", label: "Argentina (+54)" },
  { code: "+55", label: "Brazil (+55)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+52", label: "Mexico (+52)" },
];

// Phone number validation by country code
const getPhoneValidation = (countryCode: string): { min: number; max: number } => {
  const validationRules: Record<string, { min: number; max: number }> = {
    "+1": { min: 10, max: 10 },
    "+44": { min: 10, max: 11 },
    "+972": { min: 9, max: 10 },
    "+33": { min: 9, max: 9 },
    "+49": { min: 10, max: 11 },
    "+34": { min: 9, max: 9 },
    "+39": { min: 9, max: 10 },
    "+31": { min: 9, max: 9 },
    "+32": { min: 9, max: 9 },
    "+41": { min: 9, max: 9 },
    "+43": { min: 10, max: 11 },
    "+46": { min: 9, max: 10 },
    "+47": { min: 8, max: 8 },
    "+45": { min: 8, max: 8 },
    "+7": { min: 10, max: 10 },
    "+54": { min: 10, max: 11 },
    "+55": { min: 10, max: 11 },
    "+61": { min: 9, max: 9 },
    "+27": { min: 9, max: 9 },
    "+52": { min: 10, max: 10 },
  };
  return validationRules[countryCode] || { min: 7, max: 15 };
};

const validatePhoneNumber = (phone: string, countryCode: string): string | null => {
  if (!phone) return null; // Phone is optional
  const { min, max } = getPhoneValidation(countryCode);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < min || digits.length > max) {
    if (min === max) {
      return `Phone must be exactly ${min} digits`;
    }
    return `Phone must be ${min}-${max} digits`;
  }
  return null;
};

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Israel",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Sweden",
  "Norway",
  "Denmark",
  "Russia",
  "Argentina",
  "Brazil",
  "Australia",
  "South Africa",
  "Mexico",
  "Poland",
  "Hungary",
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
  venueCity: string;
  venueCountry: string;
  specialRequirements: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactPhoneCountryCode: string;
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
    venueCity: "",
    venueCountry: "United States",
    specialRequirements: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactPhoneCountryCode: "+1",
    communityName: "",
  });

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const updateBookingData = (field: keyof BookingData, value: string | boolean) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (stepErrors[field]) {
      setStepErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!bookingData.venueCapacity.trim()) {
      errors.venueCapacity = "Expected audience size is required";
    }
    if (!bookingData.venueCity.trim()) {
      errors.venueCity = "City is required";
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = () => {
    const errors: Record<string, string> = {};
    if (!bookingData.contactName.trim()) {
      errors.contactName = "Full name is required";
    }
    if (!bookingData.contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.contactEmail)) {
      errors.contactEmail = "Valid email is required";
    }
    // Phone validation (optional but if provided, must be valid)
    const phoneError = validatePhoneNumber(bookingData.contactPhone, bookingData.contactPhoneCountryCode);
    if (phoneError) {
      errors.contactPhone = phoneError;
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    // Validate step 3 before proceeding to step 4
    if (currentStep === 3) {
      if (!validateStep3()) return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Validate step 4 before submitting
    if (!validateStep4()) return;

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
          location: bookingData.venueCity ? `${bookingData.venueCity}, ${bookingData.venueCountry}` : null,
          budget: budgetValue || null,
          notes: [
            `Event Type: ${bookingData.eventType}`,
            bookingData.eventDescription ? `Description: ${bookingData.eventDescription}` : "",
            `Venue: ${bookingData.venueType}`,
            bookingData.venueCapacity ? `Capacity: ${bookingData.venueCapacity}` : "",
            bookingData.flexibleDates && bookingData.alternateDate ? `Alternate Date: ${bookingData.alternateDate}` : "",
            bookingData.specialRequirements ? `Special Requirements: ${bookingData.specialRequirements}` : "",
            `Contact: ${bookingData.contactName} (${bookingData.contactEmail})`,
            bookingData.contactPhone ? `Phone: ${bookingData.contactPhoneCountryCode} ${bookingData.contactPhone}` : "",
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
                    Expected Audience Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bookingData.venueCapacity}
                    onChange={(e) => updateBookingData("venueCapacity", e.target.value)}
                    placeholder="e.g., 150-200 people"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      stepErrors.venueCapacity ? "border-red-300 bg-red-50" : "border-slate-200"
                    }`}
                  />
                  {stepErrors.venueCapacity && (
                    <p className="mt-1 text-sm text-red-500">{stepErrors.venueCapacity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Venue Location <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={bookingData.venueCity}
                        onChange={(e) => updateBookingData("venueCity", e.target.value)}
                        placeholder="City"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          stepErrors.venueCity ? "border-red-300 bg-red-50" : "border-slate-200"
                        }`}
                      />
                      {stepErrors.venueCity && (
                        <p className="mt-1 text-sm text-red-500">{stepErrors.venueCity}</p>
                      )}
                    </div>
                    <div className="relative">
                      <select
                        value={bookingData.venueCountry}
                        onChange={(e) => updateBookingData("venueCountry", e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white"
                      >
                        {countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>
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
                      <p className="font-medium">{bookingData.venueCity ? `${bookingData.venueCity}, ${bookingData.venueCountry}` : "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Your Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingData.contactName}
                        onChange={(e) => updateBookingData("contactName", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          stepErrors.contactName ? "border-red-300" : "border-slate-200"
                        }`}
                      />
                      {stepErrors.contactName && (
                        <p className="mt-1 text-sm text-red-500">{stepErrors.contactName}</p>
                      )}
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
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={bookingData.contactEmail}
                        onChange={(e) => updateBookingData("contactEmail", e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          stepErrors.contactEmail ? "border-red-300" : "border-slate-200"
                        }`}
                      />
                      {stepErrors.contactEmail && (
                        <p className="mt-1 text-sm text-red-500">{stepErrors.contactEmail}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone
                      </label>
                      <div className="flex gap-2">
                        <div className="relative">
                          <select
                            value={bookingData.contactPhoneCountryCode}
                            onChange={(e) => updateBookingData("contactPhoneCountryCode", e.target.value)}
                            className={`h-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white pr-8 text-sm ${
                              stepErrors.contactPhone ? "border-red-300" : "border-slate-200"
                            }`}
                          >
                            {countryCodes.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.code}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                          />
                        </div>
                        <input
                          type="tel"
                          value={bookingData.contactPhone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            updateBookingData("contactPhone", digits);
                          }}
                          placeholder="Phone number"
                          maxLength={15}
                          className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            stepErrors.contactPhone ? "border-red-300" : "border-slate-200"
                          }`}
                        />
                      </div>
                      {stepErrors.contactPhone && (
                        <p className="mt-1 text-sm text-red-500">{stepErrors.contactPhone}</p>
                      )}
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
