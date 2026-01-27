"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react";

// Sample tours data - will be connected to real API
const sampleTours = [
  {
    id: 1,
    artistName: "Noga Erez",
    title: "European Tour 2026",
    regions: ["Germany", "France", "UK"],
    startDate: "March 2026",
    spotsLeft: 3,
    image: "/artists/noga-erez.jpg",
  },
  {
    id: 2,
    artistName: "Tuna",
    title: "US East Coast Tour",
    regions: ["New York", "New Jersey", "Florida"],
    startDate: "April 2026",
    spotsLeft: 5,
    image: "/artists/tuna.jpg",
  },
  {
    id: 3,
    artistName: "Eden Ben Zaken",
    title: "South America Tour",
    regions: ["Argentina", "Brazil", "Chile"],
    startDate: "May 2026",
    spotsLeft: 2,
    image: "/artists/eden-ben-zaken.jpg",
  },
  {
    id: 4,
    artistName: "Jasmin Moallem",
    title: "Canada Tour",
    regions: ["Toronto", "Montreal", "Vancouver"],
    startDate: "June 2026",
    spotsLeft: 4,
    image: "/artists/jasmin-moallem.jpg",
  },
];

export default function NewTours() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Title with decorative elements */}
        <div className="text-center mb-12 relative">
          {/* Decorative flourishes */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 -mt-4 flex items-center gap-2 text-pink-400 opacity-60">
            <span className="text-2xl">~</span>
            <span className="text-lg">,</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 italic tracking-tight">
            NEW TOURS
          </h2>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 -mb-2 flex items-center gap-2 text-teal-400 opacity-60">
            <span className="text-lg">~</span>
          </div>
        </div>

        {/* Tours Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors hidden md:flex"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 transition-colors hidden md:flex"
          >
            <ChevronRight size={24} className="text-slate-600" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {sampleTours.map((tour) => (
              <Link
                key={tour.id}
                href={`/tours/${tour.id}`}
                className="flex-shrink-0 w-72 snap-start group"
              >
                <div className="card card-hover overflow-hidden">
                  {/* Tour Image */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 via-primary-50 to-accent-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-bold text-white/40 group-hover:scale-110 transition-transform duration-500">
                        {tour.artistName.charAt(0)}
                      </span>
                    </div>
                    {/* Spots Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-slate-700">
                      {tour.spotsLeft} spots left
                    </div>
                  </div>

                  {/* Tour Info */}
                  <div className="p-5">
                    <p className="text-sm text-primary-600 font-medium mb-1">{tour.artistName}</p>
                    <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors mb-3">
                      {tour.title}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
                      <MapPin size={14} />
                      <span>{tour.regions.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <Calendar size={14} />
                      <span>{tour.startDate}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Tours Link */}
        <div className="text-center mt-8">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
          >
            View All Tours
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
