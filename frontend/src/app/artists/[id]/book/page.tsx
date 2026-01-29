"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, DollarSign, MessageSquare, CheckCircle } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function BookingPage({ params }: { params: { id: string } }) {
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
      newErrors.requestedDate = "Please select a date";
    } else {
      const selectedDate = new Date(formData.requestedDate);
      if (selectedDate <= new Date()) {
        newErrors.requestedDate = "Please select a future date";
      }
    }
    if (!formData.location || formData.location.length < 3) {
      newErrors.location = "Please enter a location";
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
        `${API_URL}/bookings`,
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
      setErrors({ submit: "Error sending request. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pt-20">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-600" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Request Sent Successfully!</h1>
          <p className="text-slate-600 mb-6">
            The artist will receive your request and get back to you soon.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Request #{Math.random().toString(36).substring(2, 8).toUpperCase()}
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/artists" className="btn-primary justify-center">
              Browse More Artists
            </Link>
            <Link href="/" className="text-slate-600 hover:text-slate-800 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-24">
      <div className="max-w-2xl mx-auto">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
            <h1 className="text-2xl font-bold mb-2">Send Booking Request</h1>
            <p className="text-slate-300">Fill in the details and we&apos;ll get back to you soon</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  <Calendar className="inline-block mr-2" size={18} />
                  Requested Date *
                </label>
                <input
                  type="date"
                  value={formData.requestedDate}
                  onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className={`input ${errors.requestedDate ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                />
                {errors.requestedDate && <p className="mt-1 text-sm text-red-500">{errors.requestedDate}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  <MapPin className="inline-block mr-2" size={18} />
                  Performance Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                  className={`input ${errors.location ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                />
                {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  <DollarSign className="inline-block mr-2" size={18} />
                  Estimated Budget (USD)
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="Enter amount"
                  min="0"
                  className="input"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-2">
                  <MessageSquare className="inline-block mr-2" size={18} />
                  Additional Details
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tell us about your community, event type, any special requirements..."
                  rows={4}
                  className="input resize-none"
                />
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center py-4"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </button>

              <p className="text-sm text-slate-500 text-center">
                By clicking &quot;Send Request&quot; you agree to the{" "}
                <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
