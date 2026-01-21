"use client";

import Link from "next/link";
import {
  MapPin,
  Globe,
  Calendar,
  MessageSquare,
  Star,
  Clock,
  Users,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

// Sample artist data
const artist = {
  id: 1,
  name: "David Cohen",
  bio: "Singer and cantor with 20 years of experience performing at Jewish communities worldwide. Specializes in liturgical singing, Mizrahi piyyutim, and family performances. Has performed at hundreds of communities in the US, Europe, and Australia.",
  image: null,
  priceSingle: 800,
  priceTour: 2500,
  languages: ["Hebrew", "English", "Yiddish"],
  city: "Tel Aviv",
  country: "Israel",
  rating: 4.9,
  reviewCount: 127,
  isFeatured: true,
  categories: [
    { name: "Music", slug: "music" },
    { name: "Cantorial", slug: "cantorial" },
  ],
  performanceTypes: [
    "Singing and cantorial performances",
    "Lectures on Jewish musical traditions",
    "Piyyut workshops",
    "Family shows and holiday celebrations",
  ],
  availability: [
    { period: "March - April 2026", available: true },
    { period: "June - July 2026", available: true },
    { period: "September 2026", available: false },
  ],
};

export default function ArtistDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-4">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="hover:text-primary-600 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/artists"
              className="hover:text-primary-600 transition-colors"
            >
              Artists
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">{artist.name}</span>
          </nav>
        </div>
      </div>

      {/* Artist Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-default py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Image */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 flex items-center justify-center shadow-soft-lg">
                <span className="text-8xl font-bold text-white/50">
                  {artist.name.charAt(0)}
                </span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {artist.isFeatured && (
                  <span className="badge-accent">Featured Artist</span>
                )}
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Star size={18} fill="currentColor" />
                  <span className="font-semibold text-slate-900">
                    {artist.rating}
                  </span>
                  <span className="text-slate-500 text-sm">
                    ({artist.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {artist.name}
              </h1>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {artist.categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/search?category=${cat.slug}`}
                    className="badge-primary hover:bg-primary-200 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              {/* Location & Languages */}
              <div className="flex flex-wrap gap-6 text-slate-600 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-slate-400" />
                  <span>
                    {artist.city}, {artist.country}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={18} className="text-slate-400" />
                  <span>{artist.languages.join(", ")}</span>
                </div>
              </div>

              {/* CTA (Desktop) */}
              <Link
                href={`/artists/${artist.id}/book`}
                className="hidden lg:inline-flex btn-primary gap-2"
              >
                <MessageSquare size={20} />
                Send Booking Request
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-default py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="card p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
              <div className="divider-gradient mb-6" />
              <p className="text-slate-600 leading-relaxed">{artist.bio}</p>
            </section>

            {/* Performance Types */}
            <section className="card p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Performance Types
              </h2>
              <div className="divider-gradient mb-6" />
              <ul className="space-y-3">
                {artist.performanceTypes.map((type, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle
                      size={20}
                      className="text-primary-500 flex-shrink-0 mt-0.5"
                    />
                    {type}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Pricing</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users size={18} className="text-slate-400" />
                    Single Performance
                  </div>
                  <span className="text-xl font-bold text-slate-900">
                    ${artist.priceSingle}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={18} className="text-slate-400" />
                    Tour Package
                  </div>
                  <span className="text-xl font-bold text-slate-900">
                    ${artist.priceTour}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Prices are estimates and may vary based on event requirements.
              </p>
            </div>

            {/* Availability */}
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Availability</h3>
              <div className="space-y-3">
                {artist.availability.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                      slot.available
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span className="text-sm font-medium">{slot.period}</span>
                    </div>
                    <span className="text-xs font-medium">
                      {slot.available ? "Available" : "Booked"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/artists/${artist.id}/book`}
              className="btn-primary w-full justify-center gap-2 py-4"
            >
              <MessageSquare size={20} />
              Send Booking Request
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-soft-lg">
        <Link
          href={`/artists/${artist.id}/book`}
          className="btn-primary w-full justify-center gap-2 py-4"
        >
          <MessageSquare size={20} />
          Send Booking Request
        </Link>
      </div>
    </div>
  );
}
